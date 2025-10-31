import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateClassDto } from '@carbon-classroom/shared-types';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

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

  async finalize(id: string) {
    // Create initial holding for issuer org
    const creditClass = await this.prisma.creditClass.findUnique({ where: { id } });
    if (!creditClass) throw new Error('Class not found');

    // This would normally get issuer org from project
    // For now, simplified
    return { message: 'Class finalized', classId: id };
  }
}

