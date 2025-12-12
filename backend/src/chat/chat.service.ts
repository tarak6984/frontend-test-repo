import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface DocumentContext {
    id: string;
    title: string;
    type: string;
    status: string;
    fundName?: string;
    fundCode?: string;
}

export interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
    documentContext?: DocumentContext[]; // Selected documents for context
}

@Injectable()
export class ChatService {
    private readonly openRouterApiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    private readonly apiKey: string;

    constructor() {
        // Get API key from environment variable
        this.apiKey = process.env.OPENROUTER_API_KEY || '';

        if (!this.apiKey) {
            console.warn('OPENROUTER_API_KEY not set. Chat feature will not work.');
        }
    }

    async createChatCompletion(request: ChatCompletionRequest): Promise<any> {
        if (!this.apiKey) {
            throw new HttpException(
                'OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.',
                HttpStatus.SERVICE_UNAVAILABLE
            );
        }

        try {
            // Prepare messages with document context if provided
            let messages = [...request.messages];

            // If document context is provided, inject it as a system message
            if (request.documentContext && request.documentContext.length > 0) {
                const documentInfo = request.documentContext.map(doc =>
                    `- ${doc.title} (${doc.type}, Status: ${doc.status}${doc.fundName ? `, Fund: ${doc.fundName}` : ''})`
                ).join('\n');

                const systemMessage: ChatMessage = {
                    role: 'system',
                    content: `You are an AI assistant for Audit Vault, a compliance document management system. The user is currently discussing the following documents:\n\n${documentInfo}\n\nProvide helpful information about these documents, compliance requirements, and audit processes. Be specific when referencing these documents.`
                };

                // Insert system message at the beginning
                messages = [systemMessage, ...messages];
            }

            const response = await axios.post(
                this.openRouterApiUrl,
                {
                    model: request.model || 'openai/gpt-3.5-turbo',
                    messages: messages,
                    temperature: request.temperature || 0.7,
                    max_tokens: request.max_tokens || 1000,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'http://localhost:3001', // Optional: for rankings
                        'X-Title': 'Audit Vault', // Optional: for rankings
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('OpenRouter API Error:', error.response?.data || error.message);

            if (error.response?.status === 401) {
                throw new HttpException(
                    'Invalid OpenRouter API key',
                    HttpStatus.UNAUTHORIZED
                );
            }

            if (error.response?.status === 429) {
                throw new HttpException(
                    'Rate limit exceeded. Please try again later.',
                    HttpStatus.TOO_MANY_REQUESTS
                );
            }

            throw new HttpException(
                error.response?.data?.error?.message || 'Failed to get chat completion',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getAvailableModels(): Promise<string[]> {
        // Return a list of commonly used models
        // You can expand this or fetch from OpenRouter API
        return [
            'openai/gpt-4o',
            'openai/gpt-4-turbo',
            'openai/gpt-3.5-turbo',
            'anthropic/claude-3.5-sonnet',
            'anthropic/claude-3-opus',
            'google/gemini-pro',
            'meta-llama/llama-3.1-70b-instruct',
        ];
    }
}
