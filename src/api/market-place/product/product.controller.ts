import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth } from '@/decorators/http.decorators';
import { createMulterOptions } from '@/utils/upload/multer-options';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { GetProductReqDto } from './dto/create-product.req.dto';
import { CreateProductRes } from './dto/create-product.res.dto';
import { GetProductResDto } from './dto/get-product.res.dto';
import { ListProductsReqDto } from './dto/list-products.req.dto';
import { ProductsResDto } from './dto/product.res.dto';
import { ReviewsResDto } from './dto/review.res.dto';
import { IGetProductsPath } from './helpers';
import { ProductService } from './product.service';

@ApiTags('market/product')
@Controller({
  path: 'market/product',
  version: '1',
})
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('market')
  @ApiAuth({
    type: ProductsResDto,
    summary: 'Get Market Products',
  })
  async getMarketProducts(
    @Query() reqDto: ListProductsReqDto,
    @CurrentUser('id') userId: Uuid,
  ): Promise<OffsetPaginatedDto<ProductsResDto>> {
    return this.productService.getMarketProducts(reqDto, userId);
  }

  @Get('reviews')
  @ApiAuth({
    type: ReviewsResDto,
    summary: 'Get Reviews',
  })
  async getReviews(
    @Query() reqDto: ListProductsReqDto,
    @CurrentUser('id') userId: Uuid,
  ): Promise<OffsetPaginatedDto<ReviewsResDto>> {
    return this.productService.getReviews(reqDto, userId);
  }

  @Get('single/:id')
  @ApiAuth({
    type: GetProductResDto,
    summary: 'Get Single Product Detail',
  })
  @UseInterceptors()
  async getProduct(
    @Param('id') id: Uuid,
    @CurrentUser('id') userId: Uuid,
  ): Promise<GetProductResDto> {
    return this.productService.getProduct(id, userId);
  }

  @UseInterceptors(
    FileInterceptor(
      'file',
      createMulterOptions({
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        maxFileSizeInMB: 2,
      }),
    ),
  )
  @Post('create')
  @ApiAuth({
    type: CreateProductRes,
    summary: 'Upload New Product',
  })
  async uploadProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() reqDto: GetProductReqDto,
    @CurrentUser('id') userId: Uuid,
  ): Promise<CreateProductRes> {
    return this.productService.uploadProduct(file, reqDto, userId);
  }

  @Get(':path')
  @ApiAuth({
    type: ProductsResDto,
    summary: 'Get Products',
  })
  async getProducts(
    @Param('path') path: IGetProductsPath,
    @Query() reqDto: ListProductsReqDto,
    @CurrentUser('id') userId: Uuid,
  ): Promise<OffsetPaginatedDto<ProductsResDto>> {
    return this.productService.getProducts(path, reqDto, userId);
  }
}
