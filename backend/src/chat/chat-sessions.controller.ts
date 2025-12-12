import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatSessionsService } from './chat-sessions.service';

@Controller('chat/sessions')
@UseGuards(AuthGuard('jwt'))
export class ChatSessionsController {
    constructor(private readonly chatSessionsService: ChatSessionsService) { }

    @Get()
    findAll(@Request() req) {
        return this.chatSessionsService.findAllByUser(req.user.id);
    }

    @Post()
    create(@Request() req, @Body() body: { title?: string }) {
        return this.chatSessionsService.create(req.user.id, body.title);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.chatSessionsService.findOne(id, req.user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Request() req, @Body() body: { title: string }) {
        return this.chatSessionsService.update(id, req.user.id, body.title);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.chatSessionsService.remove(id, req.user.id);
    }
}
