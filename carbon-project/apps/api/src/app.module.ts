import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { ClassesModule } from './classes/classes.module';
import { TransfersModule } from './transfers/transfers.module';
import { HoldingsModule } from './holdings/holdings.module';
import { RetirementsModule } from './retirements/retirements.module';
import { ChainModule } from './chain/chain.module';
import { ExplorerModule } from './explorer/explorer.module';
import { CertificatesModule } from './certificates/certificates.module';
import { HealthModule } from './common/health/health.module';

@Module({
  imports: [
    AuthModule,
    ProjectsModule,
    ClassesModule,
    TransfersModule,
    HoldingsModule,
    RetirementsModule,
    ChainModule,
    ExplorerModule,
    CertificatesModule,
    HealthModule,
  ],
})
export class AppModule {}

