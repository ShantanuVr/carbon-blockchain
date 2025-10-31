import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from '@carbon-classroom/shared-types';
import { UseJwtAuth } from '../common/jwt-auth.guard';

@Controller('transfers')
export class TransfersController {
  constructor(private transfersService: TransfersService) {}

  @UseJwtAuth()
  @Post()
  async create(@Body() dto: CreateTransferDto) {
    return this.transfersService.create(dto);
  }

  @Get()
  async getAllTransfers() {
    return this.transfersService.getAllTransfers();
  }
}

