import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// Contract ABIs (simplified - in production, use full ABIs from artifacts)
const CARBON_CREDIT_ABI = [
  'function mintClass(address to, uint256 tokenId, string memory classId, uint256 amount) external',
  'function mint(address to, uint256 tokenId, uint256 amount) external',
  'function burn(address from, uint256 tokenId, uint256 amount) external',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external',
  'function getTokenId(string memory classId) external view returns (uint256)',
  'function balanceOf(address account, uint256 id) external view returns (uint256)',
];

const EVIDENCE_ANCHOR_ABI = [
  'function anchor(bytes32 hash, string memory uri) external',
];

@Injectable()
export class ChainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private creditContract: ethers.Contract | null = null;
  private anchorContract: ethers.Contract | null = null;
  private contractAddresses: { CarbonCredit1155?: string; EvidenceAnchor?: string } = {};

  constructor(private prisma: PrismaService) {
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
    const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    // Load contract addresses
    this.loadContractAddresses();
    this.initContracts();
  }

  private loadContractAddresses() {
    try {
      // Try multiple possible paths
      const possiblePaths = [
        path.join(process.cwd(), '../contracts/addresses.json'),
        path.join(process.cwd(), '../../contracts/addresses.json'),
        path.join(__dirname, '../../../contracts/addresses.json'),
      ];

      for (const addrPath of possiblePaths) {
        if (fs.existsSync(addrPath)) {
          const addresses = JSON.parse(fs.readFileSync(addrPath, 'utf8'));
          this.contractAddresses = {
            CarbonCredit1155: addresses.CarbonCredit1155,
            EvidenceAnchor: addresses.EvidenceAnchor,
          };
          console.log('✅ Loaded contract addresses:', this.contractAddresses);
          return;
        }
      }

      console.warn('⚠️  Contract addresses not found. Using mock mode.');
    } catch (error) {
      console.warn('⚠️  Could not load contract addresses:', error);
    }
  }

  private initContracts() {
    if (this.contractAddresses.CarbonCredit1155) {
      this.creditContract = new ethers.Contract(
        this.contractAddresses.CarbonCredit1155,
        CARBON_CREDIT_ABI,
        this.wallet,
      );
    }

    if (this.contractAddresses.EvidenceAnchor) {
      this.anchorContract = new ethers.Contract(
        this.contractAddresses.EvidenceAnchor,
        EVIDENCE_ANCHOR_ABI,
        this.wallet,
      );
    }
  }

  /**
   * Mint tokens on-chain for a credit class
   */
  async mint(classId: string, toAddress: string, amount: number): Promise<{ txHash: string; tokenId: number }> {
    const creditClass = await this.prisma.creditClass.findUnique({ where: { id: classId } });
    if (!creditClass) throw new Error('Class not found');

    // Determine tokenId (use existing or generate new)
    let tokenId = creditClass.tokenId;
    if (!tokenId) {
      // Generate deterministic tokenId from classId hash
      const hash = ethers.keccak256(ethers.toUtf8Bytes(classId));
      tokenId = Number(ethers.getBigInt(hash) % BigInt(2147483647));
    }

    if (!this.creditContract) {
      // Mock mode - simulate transaction
      console.log('⚠️  Mock mode: Simulating mint transaction');
      const mockTxHash = `0x${Buffer.from(`mint-${classId}-${Date.now()}`).toString('hex').slice(0, 64)}`;
      
      await this.prisma.tokenMint.create({
        data: {
          classId,
          tokenId,
          txHash: mockTxHash,
          chainId: parseInt(process.env.CHAIN_ID || '31337'),
        },
      });

      return { txHash: mockTxHash, tokenId };
    }

    try {
      // Check if token already exists
      const existingTokenId = await this.creditContract.getTokenId(classId);
      
      if (existingTokenId !== 0n) {
        // Token exists, mint more
        const tx = await this.creditContract.mint(toAddress, existingTokenId, amount);
        await tx.wait();
        return { txHash: tx.hash, tokenId: Number(existingTokenId) };
      } else {
        // New token, use mintClass
        const tx = await this.creditContract.mintClass(toAddress, tokenId, classId, amount);
        await tx.wait();
        return { txHash: tx.hash, tokenId };
      }
    } catch (error: any) {
      console.error('❌ Mint transaction failed:', error);
      throw new Error(`Mint failed: ${error.message}`);
    }
  }

  /**
   * Transfer tokens on-chain
   */
  async transfer(tokenId: number, fromAddress: string, toAddress: string, amount: number): Promise<string> {
    if (!this.creditContract) {
      // Mock mode
      console.log('⚠️  Mock mode: Simulating transfer transaction');
      return `0x${Buffer.from(`transfer-${tokenId}-${Date.now()}`).toString('hex').slice(0, 64)}`;
    }

    try {
      const tx = await this.creditContract.safeTransferFrom(
        fromAddress,
        toAddress,
        tokenId,
        amount,
        '0x',
      );
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error('❌ Transfer transaction failed:', error);
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  /**
   * Burn tokens on-chain (retirement)
   */
  async burn(classId: string, amount: number, fromAddress: string): Promise<string> {
    const creditClass = await this.prisma.creditClass.findUnique({ where: { id: classId } });
    if (!creditClass || !creditClass.tokenId) {
      throw new Error('Class not found or not minted');
    }

    if (!this.creditContract) {
      // Mock mode
      console.log('⚠️  Mock mode: Simulating burn transaction');
      return `0x${Buffer.from(`burn-${classId}-${Date.now()}`).toString('hex').slice(0, 64)}`;
    }

    try {
      const tx = await this.creditContract.burn(fromAddress, creditClass.tokenId, amount);
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error('❌ Burn transaction failed:', error);
      throw new Error(`Burn failed: ${error.message}`);
    }
  }

  /**
   * Anchor evidence hash on-chain
   */
  async anchor(hash: string, uri: string): Promise<string> {
    // Convert hex string to bytes32
    const hashBytes = ethers.zeroPadValue(hash.startsWith('0x') ? hash : `0x${hash}`, 32);

    if (!this.anchorContract) {
      // Mock mode
      console.log('⚠️  Mock mode: Simulating anchor transaction');
      const mockTxHash = `0x${Buffer.from(`anchor-${hash}-${Date.now()}`).toString('hex').slice(0, 64)}`;
      
      await this.prisma.evidenceAnchor.upsert({
        where: { hash },
        update: { txHash: mockTxHash, uri },
        create: {
          hash,
          uri,
          txHash: mockTxHash,
          chainId: parseInt(process.env.CHAIN_ID || '31337'),
        },
      });

      return mockTxHash;
    }

    try {
      const tx = await this.anchorContract.anchor(hashBytes, uri);
      await tx.wait();

      // Store in DB
      await this.prisma.evidenceAnchor.upsert({
        where: { hash },
        update: { txHash: tx.hash, uri },
        create: {
          hash,
          uri,
          txHash: tx.hash,
          chainId: parseInt(process.env.CHAIN_ID || '31337'),
        },
      });

      return tx.hash;
    } catch (error: any) {
      console.error('❌ Anchor transaction failed:', error);
      throw new Error(`Anchor failed: ${error.message}`);
    }
  }

  /**
   * Get token balance for an address
   */
  async getBalance(address: string, tokenId: number): Promise<number> {
    if (!this.creditContract) {
      return 0; // Mock mode
    }

    try {
      const balance = await this.creditContract.balanceOf(address, tokenId);
      return Number(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  /**
   * Check if contracts are deployed
   */
  isConnected(): boolean {
    return this.creditContract !== null && this.anchorContract !== null;
  }
}
