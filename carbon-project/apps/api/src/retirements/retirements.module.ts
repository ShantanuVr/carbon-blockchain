import { Module } from '@nestjs/common';
import { RetirementsController } from './retirements.controller';
import { RetirementsService } from './retirements.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [RetirementsController],
  providers: [RetirementsService, PrismaService],
})
export class RetirementsModule {}

