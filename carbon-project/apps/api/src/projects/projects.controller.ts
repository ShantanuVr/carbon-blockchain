import { Controller, Get, Post, Param, Body, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from '@carbon-classroom/shared-types';
import { UseJwtAuth } from '../common/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @UseJwtAuth()
  @Post()
  async create(@Body() dto: CreateProjectDto, @Request() req: any) {
    // Get orgId from authenticated user
    const orgId = req.user?.orgId;
    if (!orgId) {
      throw new Error('User organization not found');
    }
    return this.projectsService.create(dto, orgId);
  }

  @Get('list')
  async findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @UseJwtAuth()
  @Post(':id/evidence')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEvidence(@Param('id') projectId: string, @UploadedFile() file: any) {
    if (!file) {
      throw new Error('File is required');
    }
    return this.projectsService.uploadEvidence(projectId, file);
  }
}
