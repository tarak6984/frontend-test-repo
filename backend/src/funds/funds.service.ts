import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class FundsService {
    constructor(private prisma: PrismaService) { }

    async create(createFundDto: CreateFundDto) {
        return this.prisma.fund.create({
            data: createFundDto,
        });
    }

    async findAll(user: { id: string; role: UserRole }) {
        if (user.role === UserRole.FUND_MANAGER) {
            return this.prisma.fund.findMany({
                where: {
                    managers: {
                        some: {
                            id: user.id,
                        },
                    },
                },
                include: {
                    _count: { select: { documents: true } },
                },
            });
        }
        return this.prisma.fund.findMany({
            include: {
                _count: { select: { documents: true } },
            },
        });
    }

    async findOne(id: string) {
        const fund = await this.prisma.fund.findUnique({
            where: { id },
            include: {
                documents: {
                    include: {
                        uploadedBy: { select: { name: true, email: true } },
                    },
                    orderBy: { periodEnd: 'desc' },
                },
                _count: { select: { documents: true } },
            },
        });
        if (!fund) {
            throw new NotFoundException(`Fund with ID ${id} not found`);
        }
        return fund;
    }

    async findOneWithStats(id: string) {
        const fund = await this.findOne(id);
        
        // Get documents grouped by year
        const documents = fund.documents;
        const documentsByYear: Record<string, any[]> = {};
        const statusCounts = {
            PENDING: 0,
            IN_REVIEW: 0,
            APPROVED: 0,
            REJECTED: 0,
            ARCHIVED: 0,
        };

        documents.forEach((doc: any) => {
            const year = new Date(doc.periodEnd).getFullYear().toString();
            if (!documentsByYear[year]) {
                documentsByYear[year] = [];
            }
            documentsByYear[year].push(doc);
            statusCounts[doc.status]++;
        });

        // Calculate compliance metrics
        const totalDocuments = documents.length;
        const approvedDocuments = statusCounts.APPROVED;
        const complianceRate = totalDocuments > 0 
            ? Math.round((approvedDocuments / totalDocuments) * 100) 
            : 0;

        return {
            ...fund,
            documentsByYear,
            statusCounts,
            metrics: {
                totalDocuments,
                approvedDocuments,
                complianceRate,
                pendingReview: statusCounts.PENDING + statusCounts.IN_REVIEW,
            },
        };
    }

    async update(id: string, updateFundDto: UpdateFundDto) {
        return this.prisma.fund.update({
            where: { id },
            data: updateFundDto,
        });
    }
}
