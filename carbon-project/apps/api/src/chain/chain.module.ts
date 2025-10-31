import { Module } from '@nestjs/common';
import { ChainController } from './chain.controller';
import { ChainService } from './chain.service';
import { RegistryAdapterService } from './registry-adapter.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [ChainController],
  providers: [ChainService, RegistryAdapterService, PrismaService],
  exports: [ChainService, RegistryAdapterService],
})
export class ChainModule {}

