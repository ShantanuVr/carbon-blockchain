import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ChainService } from './chain.service';
import { ethers } from 'ethers';

/**
 * Registry Adapter Service
 * Bridges the off-chain registry (database) with on-chain smart contracts
 * Ensures consistency between registry state and blockchain state
 */
@Injectable()
export class RegistryAdapterService {
  constructor(
    private prisma: PrismaService,
    private chainService: ChainService,
  ) {}

  /**
   * Mint tokens on-chain when a credit class is finalized
   * This bridges the registry (credit class creation) to blockchain (token minting)
   */
  async mintOnFinalize(classId: string, orgWalletAddress: string) {
    // Validate wallet address
    if (orgWalletAddress && !ethers.isAddress(orgWalletAddress)) {
      throw new Error(`Invalid Ethereum address: ${orgWalletAddress}`);
    }

    const creditClass = await this.prisma.creditClass.findUnique({
      where: { id: classId },
      include: { project: { include: { org: true } } },
    });

    if (!creditClass) {
      throw new Error('Credit class not found');
    }

    if (creditClass.tokenId) {
      throw new Error('Credit class already minted on-chain');
    }

    const walletAddress = orgWalletAddress || process.env.DEFAULT_MINT_ADDRESS || '0x0000000000000000000000000000000000000000';
    
    // Validate default address too
    if (!ethers.isAddress(walletAddress)) {
      throw new Error(`Invalid default mint address: ${walletAddress}`);
    }

    // Mint tokens on blockchain
    const { txHash, tokenId } = await this.chainService.mint(
      classId,
      walletAddress,
      creditClass.quantity,
    );

    // Update credit class with tokenId
    await this.prisma.creditClass.update({
      where: { id: classId },
      data: { tokenId },
    });

    // Create initial holding for issuer org
    const project = creditClass.project;
    await this.prisma.holding.upsert({
      where: {
        orgId_classId: {
          orgId: project.orgId,
          classId: classId,
        },
      },
      update: { quantity: { increment: creditClass.quantity } },
      create: {
        orgId: project.orgId,
        classId: classId,
        quantity: creditClass.quantity,
      },
    });

    return {
      classId,
      tokenId,
      txHash,
      quantity: creditClass.quantity,
      certificate: await this.generateMintCertificate(classId, txHash, tokenId),
    };
  }

  /**
   * Transfer tokens on-chain when credits are transferred in registry
   */
  async transferOnChain(
    transferId: string,
    fromWallet: string,
    toWallet: string,
  ) {
    // Validate wallet addresses
    if (!ethers.isAddress(fromWallet)) {
      throw new Error(`Invalid from wallet address: ${fromWallet}`);
    }
    if (!ethers.isAddress(toWallet)) {
      throw new Error(`Invalid to wallet address: ${toWallet}`);
    }

    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
      include: { class: true },
    });

    if (!transfer || !transfer.class.tokenId) {
      throw new Error('Transfer or token mapping not found');
    }

    // Transfer tokens on blockchain
    const txHash = await this.chainService.transfer(
      transfer.class.tokenId,
      fromWallet,
      toWallet,
      transfer.quantity,
    );

    // Update transfer with chain transaction
    await this.prisma.transfer.update({
      where: { id: transferId },
      data: { chainTransferTx: txHash },
    });

    return {
      transferId,
      txHash,
      certificate: await this.generateTransferCertificate(transferId, txHash),
    };
  }

  /**
   * Burn tokens on-chain when credits are retired in registry
   */
  async burnOnRetirement(
    retirementId: string,
    walletAddress: string,
  ) {
    // Validate wallet address
    if (!ethers.isAddress(walletAddress)) {
      throw new Error(`Invalid wallet address: ${walletAddress}`);
    }

    const retirement = await this.prisma.retirement.findUnique({
      where: { id: retirementId },
      include: { class: true },
    });

    if (!retirement || !retirement.class.tokenId) {
      throw new Error('Retirement or token mapping not found');
    }

    // Burn tokens on blockchain
    const txHash = await this.chainService.burn(
      retirement.classId,
      retirement.quantity,
      walletAddress,
    );

    // Update retirement with burn transaction
    await this.prisma.retirement.update({
      where: { id: retirementId },
      data: { chainBurnTx: txHash },
    });

    return {
      retirementId,
      certificateId: retirement.certificateId,
      txHash,
      certificate: await this.generateRetirementCertificate(retirementId, txHash),
    };
  }

  /**
   * Generate mint certificate
   */
  private async generateMintCertificate(
    classId: string,
    txHash: string,
    tokenId: number,
  ) {
    const creditClass = await this.prisma.creditClass.findUnique({
      where: { id: classId },
      include: { project: { include: { org: true } } },
    });

    if (!creditClass) {
      throw new Error(`Credit class ${classId} not found for certificate generation`);
    }

    if (!creditClass.project) {
      throw new Error(`Project not found for credit class ${classId}`);
    }

    return {
      type: 'MINT',
      certificateId: `MINT-${classId.slice(-12).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      classId,
      tokenId,
      project: {
        code: creditClass.project.code,
        type: creditClass.project.type,
      },
      quantity: creditClass.quantity,
      serialRange: {
        start: creditClass.serialBase,
        end: creditClass.serialTop,
      },
      blockchain: {
        txHash,
        chainId: parseInt(process.env.CHAIN_ID || '31337'),
      },
    };
  }

  /**
   * Generate transfer certificate
   */
  private async generateTransferCertificate(transferId: string, txHash: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        fromOrg: true,
        toOrg: true,
        class: { include: { project: true } },
      },
    });

    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found for certificate generation`);
    }

    if (!transfer.fromOrg || !transfer.toOrg) {
      throw new Error(`Organization data missing for transfer ${transferId}`);
    }

    if (!transfer.class || !transfer.class.project) {
      throw new Error(`Class or project data missing for transfer ${transferId}`);
    }

    return {
      type: 'TRANSFER',
      certificateId: `XFER-${transferId.slice(-12).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      transferId,
      from: {
        orgId: transfer.fromOrgId,
        orgName: transfer.fromOrg.name,
      },
      to: {
        orgId: transfer.toOrgId,
        orgName: transfer.toOrg.name,
      },
      class: {
        id: transfer.classId,
        projectCode: transfer.class.project.code,
      },
      quantity: transfer.quantity,
      blockchain: {
        txHash,
        chainId: parseInt(process.env.CHAIN_ID || '31337'),
      },
    };
  }

  /**
   * Generate retirement certificate (enhanced with blockchain proof)
   */
  private async generateRetirementCertificate(
    retirementId: string,
    txHash: string,
  ) {
    const retirement = await this.prisma.retirement.findUnique({
      where: { id: retirementId },
      include: {
        org: true,
        class: { include: { project: true } },
      },
    });

    if (!retirement) {
      throw new Error(`Retirement ${retirementId} not found for certificate generation`);
    }

    if (!retirement.org) {
      throw new Error(`Organization data missing for retirement ${retirementId}`);
    }

    if (!retirement.class || !retirement.class.project) {
      throw new Error(`Class or project data missing for retirement ${retirementId}`);
    }

    return {
      type: 'RETIREMENT',
      certificateId: retirement.certificateId,
      timestamp: retirement.createdAt.toISOString(),
      retirementId,
      org: {
        id: retirement.orgId,
        name: retirement.org.name,
      },
      class: {
        id: retirement.classId,
        projectCode: retirement.class.project.code,
      },
      quantity: retirement.quantity,
      serialRange: {
        start: retirement.serialStart,
        end: retirement.serialEnd,
      },
      purposeHash: retirement.purposeHash,
      beneficiaryHash: retirement.beneficiaryHash,
      blockchain: {
        burnTxHash: txHash,
        chainId: parseInt(process.env.CHAIN_ID || '31337'),
      },
    };
  }

  /**
   * Get certificate for any action type
   */
  async getCertificate(type: 'MINT' | 'TRANSFER' | 'RETIREMENT', id: string) {
    if (type === 'MINT') {
      const mint = await this.prisma.tokenMint.findFirst({
        where: { classId: id },
        include: { class: { include: { project: { include: { org: true } } } } },
      });
      if (!mint) throw new Error('Mint not found');
      return this.generateMintCertificate(id, mint.txHash, mint.tokenId);
    } else if (type === 'TRANSFER') {
      const transfer = await this.prisma.transfer.findUnique({
        where: { id },
      });
      if (!transfer?.chainTransferTx) {
        throw new Error('Transfer not found or not on-chain');
      }
      return this.generateTransferCertificate(id, transfer.chainTransferTx);
    } else if (type === 'RETIREMENT') {
      const retirement = await this.prisma.retirement.findUnique({
        where: { certificateId: id },
      });
      if (!retirement?.chainBurnTx) {
        throw new Error('Retirement not found or not burned on-chain');
      }
      return this.generateRetirementCertificate(retirement.id, retirement.chainBurnTx);
    }
    throw new Error('Invalid certificate type');
  }
}

