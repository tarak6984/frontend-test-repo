import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ChatService, ChatCompletionRequest } from './chat.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('completions')
    async createCompletion(@Body() request: ChatCompletionRequest) {
        return this.chatService.createChatCompletion(request);
    }

    @Get('models')
    async getModels() {
        const models = await this.chatService.getAvailableModels();
        return { models };
    }
}
