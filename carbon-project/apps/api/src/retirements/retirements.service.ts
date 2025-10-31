import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRetirementDto } from '@carbon-classroom/shared-types';
import { RegistryAdapterService } from '../chain/registry-adapter.service';
import * as crypto from 'crypto';

@Injectable()
export class RetirementsService {
  constructor(
    private prisma: PrismaService,
    private registryAdapter: RegistryAdapterService,
  ) {}

  async create(dto: CreateRetirementDto) {
    // Get class to determine serial range
    const creditClass = await this.prisma.creditClass.findUnique({
      where: { id: dto.classId },
      include: { retirements: true },
    });

    if (!creditClass) throw new Error('Class not found');

    // Calculate next available serial range
    const lastRetirement = creditClass.retirements[creditClass.retirements.length - 1];
    const serialStart = lastRetirement ? lastRetirement.serialEnd + 1 : creditClass.serialBase;
    const serialEnd = serialStart + dto.quantity - 1;

    if (serialEnd > creditClass.serialTop) {
      throw new Error('Insufficient credits available');
    }

    // Generate certificate ID
    const certificateId = `CERT-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    // Create retirement
    const retirement = await this.prisma.retirement.create({
      data: {
        orgId: dto.orgId,
        classId: dto.classId,
        quantity: dto.quantity,
        serialStart,
        serialEnd,
        purposeHash: dto.purposeHash,
        beneficiaryHash: dto.beneficiaryHash,
        certificateId,
      },
    });

    // Decrement holdings
    await this.prisma.holding.updateMany({
      where: { orgId: dto.orgId, classId: dto.classId },
      data: { quantity: { decrement: dto.quantity } },
    });

    // Burn tokens on-chain if wallet address provided
    if (dto.walletAddress) {
      try {
        const result = await this.registryAdapter.burnOnRetirement(
          retirement.id,
          dto.walletAddress,
        );
        return {
          ...retirement,
          chainBurnTx: result.txHash,
          certificate: result.certificate,
        };
      } catch (error) {
        console.warn('On-chain burn failed, keeping off-chain retirement:', error);
        // Continue with off-chain retirement only
      }
    }

    return retirement;
  }

  async findAll(orgId?: string) {
    return this.prisma.retirement.findMany({
      where: orgId ? { orgId } : undefined,
      include: { class: { include: { project: true } }, org: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(certificateId: string) {
    return this.prisma.retirement.findUnique({
      where: { certificateId },
      include: { class: { include: { project: true } }, org: true },
    });
  }
}

