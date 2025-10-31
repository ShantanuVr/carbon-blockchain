import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from '@carbon-classroom/shared-types';
import { UseJwtAuth } from '../common/jwt-auth.guard';

@Controller('classes')
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  @UseJwtAuth()
  @Post()
  async create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Get()
  async findAll(@Query('projectId') projectId?: string) {
    return this.classesService.findAll(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @UseJwtAuth()
  @Post(':id/finalize')
  async finalize(@Param('id') id: string) {
    return this.classesService.finalize(id);
  }
}

