import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth } from '@/decorators/http.decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ListUserReqDto } from '../user/dto/list-user.req.dto';
import { CreateFavouriteReqDto } from './dto/create-favourite.req.dto';
import { CreateFavouriteResDto } from './dto/create-favourite.res.dto';
import { FavouriteResDto } from './dto/favourite.res.dto';
import { FavouriteService } from './favourite.services';
import { DeleteFavouriteResDto } from './dto/delete-favourite.res.dto';

@ApiTags('favourites')
@Controller({
  path: 'favourites',
  version: '1',
})
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  @Get()
  @ApiAuth({
    type: FavouriteResDto,
    summary: 'Get favorites',
  })
  async getFavourites(
    @Query() reqDto: ListUserReqDto,
    @CurrentUser('id') userId: Uuid,
  ): Promise<OffsetPaginatedDto<FavouriteResDto>> {
    return this.favouriteService.findAllById(reqDto, userId);
  }

  @Post('/create')
  @ApiAuth({
    type: CreateFavouriteResDto,
    summary: 'Add favorites',
  })
  async addFavourites(
    @Body() reqDto: CreateFavouriteReqDto,
    @CurrentUser('id') userId: Uuid,
  ): Promise<CreateFavouriteResDto> {
    return this.favouriteService.create(reqDto, userId);
  }

  @Delete('/delete/:id')
  @ApiAuth({
    summary: 'Delete favorite',
  })
  @ApiParam({ name: 'id', type: 'String' })
  async delete(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @CurrentUser('id') userId: Uuid,
  ): Promise<DeleteFavouriteResDto> {
    return this.favouriteService.delete(id,userId);
  }
}
