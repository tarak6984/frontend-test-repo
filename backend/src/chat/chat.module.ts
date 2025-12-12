import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatSessionsController } from './chat-sessions.controller';
import { ChatSessionsService } from './chat-sessions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ChatController, ChatSessionsController],
    providers: [ChatService, ChatSessionsService],
    exports: [ChatService, ChatSessionsService],
})
export class ChatModule { }
