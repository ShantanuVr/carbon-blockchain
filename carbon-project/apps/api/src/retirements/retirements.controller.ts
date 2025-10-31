import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RetirementsService } from './retirements.service';
import { CreateRetirementDto } from '@carbon-classroom/shared-types';
import { UseJwtAuth } from '../common/jwt-auth.guard';
import { OrgAuthGuard, RequireOrgAuth } from '../common/org-auth.guard';

@Controller('retirements')
export class RetirementsController {
  constructor(private retirementsService: RetirementsService) {}

  @UseJwtAuth()
  @UseGuards(OrgAuthGuard)
  @RequireOrgAuth('orgId')
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

