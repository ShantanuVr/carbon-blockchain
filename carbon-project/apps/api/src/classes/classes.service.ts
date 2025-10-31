import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateClassDto } from '@carbon-classroom/shared-types';
import { RegistryAdapterService } from '../chain/registry-adapter.service';

@Injectable()
export class ClassesService {
  constructor(
    private prisma: PrismaService,
    private registryAdapter: RegistryAdapterService,
  ) {}

  async create(dto: CreateClassDto) {
    const serialBase = 1;
    const serialTop = dto.quantity;

    return this.prisma.creditClass.create({
      data: {
        projectId: dto.projectId,
        vintage: dto.vintage,
        quantity: dto.quantity,
        serialBase,
        serialTop,
      },
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.creditClass.findMany({
      where: projectId ? { projectId } : undefined,
      include: { project: true, holdings: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.creditClass.findUnique({
      where: { id },
      include: { project: true, holdings: true },
    });
  }

  async finalize(id: string, orgWalletAddress?: string) {
    const creditClass = await this.prisma.creditClass.findUnique({
      where: { id },
      include: { project: { include: { org: true } } },
    });
    
    if (!creditClass) throw new Error('Class not found');
    if (creditClass.tokenId) throw new Error('Class already finalized and minted');

    // Use provided wallet address or default to the service wallet
    const walletAddress = orgWalletAddress || process.env.DEFAULT_MINT_ADDRESS || '0x0000000000000000000000000000000000000000';

    // Mint tokens on-chain via registry adapter
    const result = await this.registryAdapter.mintOnFinalize(id, walletAddress);

    return {
      message: 'Class finalized and tokens minted',
      classId: id,
      tokenId: result.tokenId,
      txHash: result.txHash,
      certificate: result.certificate,
    };
  }
}

