import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { RetirementsService } from './retirements.service';
import { CreateRetirementDto } from '@carbon-classroom/shared-types';
import { UseJwtAuth } from '../common/jwt-auth.guard';

@Controller('retirements')
export class RetirementsController {
  constructor(private retirementsService: RetirementsService) {}

  @UseJwtAuth()
  @Post()
  async create(@Body() dto: CreateRetirementDto) {
    return this.retirementsService.create(dto);
  }

  @Get()
  async findAll(@Query('orgId') orgId?: string) {
    return this.retirementsService.findAll(orgId);
  }

  @Get(':certificateId')
  async findOne(@Param('certificateId') certificateId: string) {
    return this.retirementsService.findOne(certificateId);
  }
}

