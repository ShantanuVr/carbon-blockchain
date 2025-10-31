import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateProjectDto } from '@carbon-classroom/shared-types';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, orgId: string) {
    return this.prisma.project.create({
      data: {
        code: dto.code,
        type: dto.type,
        metadata: dto.metadata || {},
        orgId: orgId,
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: { evidence: true, classes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { evidence: true, classes: true },
    });
  }

  async uploadEvidence(projectId: string, file: any) {
    if (!file) {
      throw new Error('File is required');
    }
    const filesDir = process.env.FILES_DIR || './var/evidence';
    await fs.mkdir(filesDir, { recursive: true });

    const buffer = file.buffer;
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    
    const filePath = path.join(filesDir, `${sha256}.${file.originalname.split('.').pop()}`);
    await fs.writeFile(filePath, buffer);

    const uri = filePath;

    return this.prisma.evidenceArtifact.create({
      data: {
        projectId,
        sha256,
        bytes: buffer.length,
        uri,
      },
    });
  }
}

