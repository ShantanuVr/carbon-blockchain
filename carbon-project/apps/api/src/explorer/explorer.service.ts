import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ExplorerService {
  constructor(private prisma: PrismaService) {}

  async getCredits() {
    const projects = await this.prisma.project.findMany({
      include: { evidence: true, classes: true, org: true },
    });
    const classes = await this.prisma.creditClass.findMany({
      include: { project: { include: { org: true } } },
    });
    const retirements = await this.prisma.retirement.findMany({
      include: { class: { include: { project: true } }, org: true },
    });

    return { projects, classes, retirements };
  }

  async getTokens() {
    const mints = await this.prisma.tokenMint.findMany({
      include: { class: { include: { project: true } } },
    });

    // Group by tokenId
    const tokensMap = new Map();
    for (const mint of mints) {
      const tokenId = mint.tokenId;
      if (!tokensMap.has(tokenId)) {
        tokensMap.set(tokenId, {
          tokenId,
          classId: mint.classId,
          totalSupply: 0,
          mints: [],
        });
      }
      tokensMap.get(tokenId).mints.push(mint);
      // Would calculate totalSupply from contract in production
    }

    return { tokens: Array.from(tokensMap.values()) };
  }

  async getAnchors() {
    const anchors = await this.prisma.evidenceAnchor.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return { anchors };
  }
}

