import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller';
import { ChainModule } from '../chain/chain.module';

@Module({
  imports: [ChainModule],
  controllers: [CertificatesController],
})
export class CertificatesModule {}

