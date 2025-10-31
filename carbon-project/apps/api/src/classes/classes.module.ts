import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { PrismaService } from '../common/prisma.service';
import { ChainModule } from '../chain/chain.module';

@Module({
  imports: [ChainModule],
  controllers: [ClassesController],
  providers: [ClassesService, PrismaService],
})
export class ClassesModule {}

