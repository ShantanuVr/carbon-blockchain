import { Module } from '@nestjs/common';
import { ChainController } from './chain.controller';
import { ChainService } from './chain.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [ChainController],
  providers: [ChainService, PrismaService],
})
export class ChainModule {}

