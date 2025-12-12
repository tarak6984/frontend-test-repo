import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatSessionsService {
    constructor(private prisma: PrismaService) { }

    async findAllByUser(userId: string) {
        return this.prisma.chatSession.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { messages: true }
                }
            }
        });
    }

    async create(userId: string, title?: string) {
        return this.prisma.chatSession.create({
            data: {
                userId,
                title: title || 'New Chat'
            }
        });
    }

    async findOne(id: string, userId: string) {
        const session = await this.prisma.chatSession.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!session) {
            throw new NotFoundException('Chat session not found');
        }

        if (session.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return session;
    }

    async update(id: string, userId: string, title: string) {
        const session = await this.prisma.chatSession.findUnique({
            where: { id }
        });

        if (!session) {
            throw new NotFoundException('Chat session not found');
        }

        if (session.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return this.prisma.chatSession.update({
            where: { id },
            data: { title }
        });
    }

    async remove(id: string, userId: string) {
        const session = await this.prisma.chatSession.findUnique({
            where: { id }
        });

        if (!session) {
            throw new NotFoundException('Chat session not found');
        }

        if (session.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        await this.prisma.chatSession.delete({
            where: { id }
        });

        return { message: 'Session deleted successfully' };
    }
}
