import { Controller, Get, Query } from '@nestjs/common';
import { HoldingsService } from './holdings.service';

@Controller('holdings')
export class HoldingsController {
  constructor(private holdingsService: HoldingsService) {}

  @Get()
  async getHoldings(@Query('orgId') orgId?: string) {
    return this.holdingsService.getHoldings(orgId);
  }
}

