import { Module } from '@nestjs/common';
import { HoldingsController } from './holdings.controller';
import { HoldingsService } from './holdings.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [HoldingsController],
  providers: [HoldingsService, PrismaService],
  exports: [HoldingsService],
})
export class HoldingsModule {}

