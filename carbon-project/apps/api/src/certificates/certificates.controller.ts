import { Controller, Get, Param, Query } from '@nestjs/common';
import { RegistryAdapterService } from '../chain/registry-adapter.service';
import { UseJwtAuth } from '../common/jwt-auth.guard';

@Controller('certificates')
export class CertificatesController {
  constructor(private registryAdapter: RegistryAdapterService) {}

  @UseJwtAuth()
  @Get(':type/:id')
  async getCertificate(
    @Param('type') type: 'MINT' | 'TRANSFER' | 'RETIREMENT',
    @Param('id') id: string,
  ) {
    return this.registryAdapter.getCertificate(type, id);
  }
}

