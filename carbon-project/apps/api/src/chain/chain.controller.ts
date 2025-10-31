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
    return this.chainService.mint(dto.classId, dto.toAddress || process.env.DEFAULT_MINT_ADDRESS || '0x0000000000000000000000000000000000000000', dto.amount || 0);
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

