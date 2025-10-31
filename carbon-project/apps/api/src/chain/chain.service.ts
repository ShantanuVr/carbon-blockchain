import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private creditContract: any;
  private anchorContract: any;

  constructor(private prisma: PrismaService) {
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
    const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    // Load contract addresses
    try {
      const addressesPath = path.join(process.cwd(), '../../contracts/addresses.json');
      if (fs.existsSync(addressesPath)) {
        const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
        // In real implementation, load ABIs and create contract instances
        this.creditContract = addresses.CarbonCredit1155;
        this.anchorContract = addresses.EvidenceAnchor;
      }
    } catch {
      // Addresses not deployed yet
    }
  }

  async mint(classId: string) {
    const creditClass = await this.prisma.creditClass.findUnique({ where: { id: classId } });
    if (!creditClass) throw new Error('Class not found');

    // Determine tokenId (simplified - would use mapping table in production)
    const tokenId = creditClass.tokenId || parseInt(classId.slice(-8), 16) % 2147483647;

    // Update class with tokenId
    await this.prisma.creditClass.update({
      where: { id: classId },
      data: { tokenId },
    });

    // In production: call contract.mintClass(wallet.address, tokenId, classId, creditClass.quantity)
    // For now, simulate
    const txHash = `0x${Buffer.from(`mint-${classId}-${Date.now()}`).toString('hex').slice(0, 64)}`;

    await this.prisma.tokenMint.create({
      data: {
        classId,
        tokenId,
        txHash,
        chainId: parseInt(process.env.CHAIN_ID || '31337'),
      },
    });

    return { txHash, tokenId };
  }

  async burn(classId: string, amount: number, fromWallet?: string) {
    const creditClass = await this.prisma.creditClass.findUnique({ where: { id: classId } });
    if (!creditClass || !creditClass.tokenId) throw new Error('Class not minted');

    // In production: call contract.burn(fromWallet || wallet.address, tokenId, amount)
    const txHash = `0x${Buffer.from(`burn-${classId}-${Date.now()}`).toString('hex').slice(0, 64)}`;

    return { txHash };
  }

  async anchor(hash: string, uri: string) {
    // Convert hex string to bytes32
    const hashBytes = ethers.zeroPadValue(hash, 32);

    // In production: call anchorContract.anchor(hashBytes, uri)
    const txHash = `0x${Buffer.from(`anchor-${hash}-${Date.now()}`).toString('hex').slice(0, 64)}`;

    // Store in DB
    await this.prisma.evidenceAnchor.upsert({
      where: { hash },
      update: { txHash, uri },
      create: { hash, uri, txHash, chainId: parseInt(process.env.CHAIN_ID || '31337') },
    });

    return { txHash };
  }
}

