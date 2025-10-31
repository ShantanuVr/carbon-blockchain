import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTransferDto } from '@carbon-classroom/shared-types';

@Injectable()
export class TransfersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransferDto) {
    // Create transfer record
    const transfer = await this.prisma.transfer.create({
      data: {
        fromOrgId: dto.fromOrgId,
        toOrgId: dto.toOrgId,
        classId: dto.classId,
        quantity: dto.quantity,
      },
    });

    // Update holdings
    await this.prisma.holding.upsert({
      where: { orgId_classId: { orgId: dto.fromOrgId, classId: dto.classId } },
      update: { quantity: { decrement: dto.quantity } },
      create: { orgId: dto.fromOrgId, classId: dto.classId, quantity: -dto.quantity },
    });

    await this.prisma.holding.upsert({
      where: { orgId_classId: { orgId: dto.toOrgId, classId: dto.classId } },
      update: { quantity: { increment: dto.quantity } },
      create: { orgId: dto.toOrgId, classId: dto.classId, quantity: dto.quantity },
    });

    return transfer;
  }

  async getHoldings(orgId?: string) {
    return this.prisma.holding.findMany({
      where: orgId ? { orgId } : undefined,
      include: { class: { include: { project: true } } },
    });
  }

  async getAllTransfers() {
    return this.prisma.transfer.findMany({
      include: {
        fromOrg: true,
        toOrg: true,
        class: { include: { project: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

