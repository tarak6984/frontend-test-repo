import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
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
            const response = await axios.post(
                this.openRouterApiUrl,
                {
                    model: request.model || 'openai/gpt-3.5-turbo',
                    messages: request.messages,
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
