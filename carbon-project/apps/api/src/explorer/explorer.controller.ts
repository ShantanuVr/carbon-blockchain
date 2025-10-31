import { Controller, Get } from '@nestjs/common';
import { ExplorerService } from './explorer.service';

@Controller('explorer')
export class ExplorerController {
  constructor(private explorerService: ExplorerService) {}

  @Get('credits')
  async getCredits() {
    return this.explorerService.getCredits();
  }

  @Get('tokens')
  async getTokens() {
    return this.explorerService.getTokens();
  }

  @Get('anchors')
  async getAnchors() {
    return this.explorerService.getAnchors();
  }
}

