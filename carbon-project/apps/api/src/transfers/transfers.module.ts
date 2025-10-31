import { Module } from '@nestjs/common';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { PrismaService } from '../common/prisma.service';
import { ChainModule } from '../chain/chain.module';

@Module({
  imports: [ChainModule],
  controllers: [TransfersController],
  providers: [TransfersService, PrismaService],
})
export class TransfersModule {}

