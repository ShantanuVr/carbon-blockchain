import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class HoldingsService {
  constructor(private prisma: PrismaService) {}

  async getHoldings(orgId?: string) {
    return this.prisma.holding.findMany({
      where: orgId ? { orgId } : undefined,
      include: { class: { include: { project: true } } },
    });
  }
}

