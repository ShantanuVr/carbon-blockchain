import { Module } from '@nestjs/common';
import { ExplorerController } from './explorer.controller';
import { ExplorerService } from './explorer.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [ExplorerController],
  providers: [ExplorerService, PrismaService],
})
export class ExplorerModule {}

