import { Module } from '@nestjs/common';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [TransfersController],
  providers: [TransfersService, PrismaService],
})
export class TransfersModule {}

