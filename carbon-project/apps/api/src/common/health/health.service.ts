import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as fs from 'fs';
import { ethers } from 'ethers';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check() {
    const services: any = {};
    
    // Check DB
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      services.db = true;
    } catch {
      services.db = false;
    }

    // Check Chain
    try {
      const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      await provider.getBlockNumber();
      services.chain = true;
    } catch {
      services.chain = false;
    }

    // Check Evidence storage
    const filesDir = process.env.FILES_DIR || './var/evidence';
    services.evidence = fs.existsSync(filesDir);

    // Check IPFS (optional)
    try {
      const ipfsApi = process.env.IPFS_API || 'http://127.0.0.1:5001';
      const response = await fetch(`${ipfsApi}/api/v0/version`);
      services.ipfs = response.ok;
    } catch {
      services.ipfs = false;
    }

    return {
      ok: services.db && services.chain,
      services,
    };
  }
}

