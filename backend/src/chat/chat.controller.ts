import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { ChatCompletionDto } from './dto/chat.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly prisma: PrismaService,
    ) { }

    @Post('completions')
    async createCompletion(@Body() request: ChatCompletionDto, @Req() req: any) {
        return this.chatService.createChatCompletion({
            ...request,
            userId: req.user.id
        });
    }

    @Get('models')
    async getModels() {
        const models = await this.chatService.getAvailableModels();
        return { models };
    }

    @Get('documents')
    async getUserDocuments(@Req() req: any) {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Get documents based on user role
        let documents;
        if (userRole === 'ADMIN' || userRole === 'AUDITOR' || userRole === 'COMPLIANCE_OFFICER') {
            // These roles can see all documents
            documents = await this.prisma.document.findMany({
                select: {
                    id: true,
                    title: true,
                    type: true,
                    status: true,
                    periodStart: true,
                    periodEnd: true,
                    fund: {
                        select: {
                            name: true,
                            code: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 50, // Limit to recent 50 documents
            });
        } else {
            // Fund managers see only their fund's documents
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { managedFunds: true },
            });

            const fundIds = user?.managedFunds.map(f => f.id) || [];

            documents = await this.prisma.document.findMany({
                where: {
                    fundId: { in: fundIds },
                },
                select: {
                    id: true,
                    title: true,
                    type: true,
                    status: true,
                    periodStart: true,
                    periodEnd: true,
                    fund: {
                        select: {
                            name: true,
                            code: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
        }

        return { documents };
    }
}
