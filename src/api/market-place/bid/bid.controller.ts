import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth } from '@/decorators/http.decorators';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { CreateBidResDto } from './dto/create-bid.res.dto';
import { ListBidsReqDto } from './dto/list-bid.req.dto';
import { GetBidsResDto } from './dto/get-bids.res.dto';

@ApiTags('market/bid')
@Controller({
  path: 'market/bid',
  version: '1',
})
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @ApiAuth({
    type: CreateBidResDto,
    summary: 'Place a Bid',
  })
  async createBid(
    @CurrentUser('id') userId: Uuid,
    @Body() dto: CreateBidDto,
  ): Promise<CreateBidResDto> {
    return this.bidService.createBid(userId, dto);
  }

  @Get('product/:id')
  @ApiAuth({
    type: GetBidsResDto,
    summary: 'Get Bids for a Product',
  })
  async getBidsForProduct(
    @Param('id') productId: Uuid,
    @CurrentUser('id') userId: Uuid,
    @Query() reqDto: ListBidsReqDto,
  ): Promise<OffsetPaginatedDto<GetBidsResDto>> {
    return this.bidService.getBidsForProduct(userId, productId, reqDto);
  }
}
