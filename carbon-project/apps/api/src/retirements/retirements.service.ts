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
    // Validate: check if org has sufficient holdings
    const holding = await this.prisma.holding.findUnique({
      where: { orgId_classId: { orgId: dto.orgId, classId: dto.classId } },
    });

    const availableQuantity = holding?.quantity || 0;
    if (availableQuantity < dto.quantity) {
      throw new Error(`Insufficient holdings for retirement. Available: ${availableQuantity}, Requested: ${dto.quantity}`);
    }

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
      throw new Error('Insufficient credits available in serial range');
    }

    // Generate certificate ID
    const certificateId = `CERT-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    // Use transaction to ensure atomicity
    const retirement = await this.prisma.$transaction(async (tx) => {
      // Create retirement
      const retirementRecord = await tx.retirement.create({
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
      await tx.holding.updateMany({
        where: { orgId: dto.orgId, classId: dto.classId },
        data: { quantity: { decrement: dto.quantity } },
      });

      // Verify holdings didn't go negative
      const updatedHolding = await tx.holding.findUnique({
        where: { orgId_classId: { orgId: dto.orgId, classId: dto.classId } },
      });

      if (updatedHolding && updatedHolding.quantity < 0) {
        throw new Error('Retirement would result in negative holdings');
      }

      return retirementRecord;
    });

    // Burn tokens on-chain if wallet address provided (outside transaction)
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
