import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from '@carbon-classroom/shared-types';
import { UseJwtAuth } from '../common/jwt-auth.guard';
import { OrgAuthGuard, RequireOrgAuth } from '../common/org-auth.guard';

@Controller('transfers')
export class TransfersController {
  constructor(private transfersService: TransfersService) {}

  @UseJwtAuth()
  @UseGuards(OrgAuthGuard)
  @RequireOrgAuth('fromOrgId')
  @Post()
  async create(@Body() dto: CreateTransferDto) {
    return this.transfersService.create(dto);
  }

  @Get()
  async getAllTransfers() {
    return this.transfersService.getAllTransfers();
  }
}

