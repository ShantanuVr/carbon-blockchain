import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTransferDto } from '@carbon-classroom/shared-types';
import { RegistryAdapterService } from '../chain/registry-adapter.service';

@Injectable()
export class TransfersService {
  constructor(
    private prisma: PrismaService,
    private registryAdapter: RegistryAdapterService,
  ) {}

  async create(dto: CreateTransferDto, fromWallet?: string, toWallet?: string) {
    // Validate: cannot transfer to self
    if (dto.fromOrgId === dto.toOrgId) {
      throw new Error('Cannot transfer credits to the same organization');
    }

    // Validate: check if sender has sufficient holdings
    const fromHolding = await this.prisma.holding.findUnique({
      where: { orgId_classId: { orgId: dto.fromOrgId, classId: dto.classId } },
    });

    const availableQuantity = fromHolding?.quantity || 0;
    if (availableQuantity < dto.quantity) {
      throw new Error(`Insufficient holdings. Available: ${availableQuantity}, Requested: ${dto.quantity}`);
    }

    // Use transaction to ensure atomicity
    const transfer = await this.prisma.$transaction(async (tx) => {
      // Create transfer record
      const transferRecord = await tx.transfer.create({
        data: {
          fromOrgId: dto.fromOrgId,
          toOrgId: dto.toOrgId,
          classId: dto.classId,
          quantity: dto.quantity,
        },
      });

      // Update holdings
      await tx.holding.upsert({
        where: { orgId_classId: { orgId: dto.fromOrgId, classId: dto.classId } },
        update: { quantity: { decrement: dto.quantity } },
        create: { orgId: dto.fromOrgId, classId: dto.classId, quantity: -dto.quantity },
      });

      await tx.holding.upsert({
        where: { orgId_classId: { orgId: dto.toOrgId, classId: dto.classId } },
        update: { quantity: { increment: dto.quantity } },
        create: { orgId: dto.toOrgId, classId: dto.classId, quantity: dto.quantity },
      });

      // Verify holdings didn't go negative (safety check)
      const updatedHolding = await tx.holding.findUnique({
        where: { orgId_classId: { orgId: dto.fromOrgId, classId: dto.classId } },
      });

      if (updatedHolding && updatedHolding.quantity < 0) {
        throw new Error('Transfer would result in negative holdings');
      }

      return transferRecord;
    });

    // Transfer tokens on-chain if wallets provided (outside transaction for now)
    // Note: On-chain transfer happens after DB transaction to avoid blocking
    if (fromWallet && toWallet) {
      try {
        const result = await this.registryAdapter.transferOnChain(
          transfer.id,
          fromWallet,
          toWallet,
        );
        return { ...transfer, chainTransferTx: result.txHash, certificate: result.certificate };
      } catch (error) {
        console.warn('On-chain transfer failed, keeping off-chain transfer:', error);
        // Continue with off-chain transfer only
      }
    }

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
