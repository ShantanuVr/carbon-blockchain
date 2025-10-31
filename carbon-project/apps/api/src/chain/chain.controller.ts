import { Controller, Post, Body } from '@nestjs/common';
import { ChainService } from './chain.service';
import { MintRequest, BurnRequest, AnchorRequest } from '@carbon-classroom/shared-types';
import { UseJwtAuth } from '../common/jwt-auth.guard';

@Controller('chain')
export class ChainController {
  constructor(private chainService: ChainService) {}

  @UseJwtAuth()
  @Post('mint')
  async mint(@Body() dto: MintRequest) {
    return this.chainService.mint(dto.classId);
  }

  @UseJwtAuth()
  @Post('burn')
  async burn(@Body() dto: BurnRequest) {
    return this.chainService.burn(dto.classId, dto.amount, dto.fromWallet);
  }

  @UseJwtAuth()
  @Post('anchor')
  async anchor(@Body() dto: AnchorRequest) {
    return this.chainService.anchor(dto.hash, dto.uri);
  }
}

