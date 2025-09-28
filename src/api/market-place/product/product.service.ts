import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import { ValidationException } from '@/exceptions/validation.exception';
import { paginate, paginateJoin } from '@/utils/offset-pagination';
import { buildSuccessMessage } from '@/utils/response-builder.utils';
import { transformDto } from '@/utils/transformers/transform-dto';
import cloudinary from '@/utils/upload/claudinary';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { UploadApiResponse } from 'cloudinary';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { GetProductReqDto } from './dto/create-product.req.dto';
import { CreateProductRes } from './dto/create-product.res.dto';
import { GetProductResDto } from './dto/get-product.res.dto';
import { ListProductsReqDto } from './dto/list-products.req.dto';
import { ProductsResDto } from './dto/product.res.dto';
import { ReviewsResDto } from './dto/review.res.dto';
import { ProductEntity, ProductStatus } from './entities/product.entity';
import { ReviewEntity } from './entities/review.entity';
import { IGetProductsPath } from './helpers';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
  ) {}

  async getMarketProducts(
    reqDto: ListProductsReqDto,
    userId: Uuid,
  ): Promise<OffsetPaginatedDto<ProductsResDto>> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.status = :status', {
        status: ProductStatus.LISTED,
      });

    const [items, metaDto] = await paginate<ProductEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });

    return new OffsetPaginatedDto(transformDto(ProductsResDto, items), metaDto);
  }

  async getProducts(
    path: IGetProductsPath,
    reqDto: ListProductsReqDto,
    userId: Uuid,
  ): Promise<OffsetPaginatedDto<ProductsResDto>> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    let query: SelectQueryBuilder<ProductEntity>;

    switch (path) {
      case 'Listed':
        query = this.productRepository
          .createQueryBuilder('product')
          .where('product.userId = :userId', { userId })
          .andWhere('product.status = :status', {
            status: ProductStatus.LISTED,
          });
        break;

      case 'Sold':
        query = this.productRepository
          .createQueryBuilder('product')
          .where('product.userId = :userId', { userId })
          .andWhere('product.status = :status', { status: ProductStatus.SOLD });
        break;

      default:
        throw new ValidationException(ErrorCode.I002);
    }

    const [items, metaDto] = await paginate<ProductEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });

    return new OffsetPaginatedDto(transformDto(ProductsResDto, items), metaDto);
  }

  async getProduct(id: Uuid, userId: Uuid): Promise<GetProductResDto> {
    // if (!userId) throw new ValidationException(ErrorCode.E002);
    // if (!id) throw new ValidationException(ErrorCode.I004);

    // const product = await this.productRepository.findOneByOrFail({ id });

    // return product.toDto(GetProductResDto);

    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.user', 'user')
      .loadRelationCountAndMap('user.totalReviews', 'user.reviews')
      .where('product.id = :id', { id })
      .getOne();

    if (!product) throw new ValidationException(ErrorCode.I004);

    return product.toDto(GetProductResDto);
  }

  async uploadProduct(
    file: Express.Multer.File,
    reqDto: GetProductReqDto,
    userId: Uuid,
  ): Promise<CreateProductRes> {
    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!file) throw new ValidationException(ErrorCode.I005);

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'product' }, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        })
        .end(file.buffer);
    });

    try {
      const product = this.productRepository.create({
        userId,
        title: reqDto.title,
        styleType: reqDto.styleType,
        fabricType: reqDto.fabricType,
        description: reqDto.description,
        clotheFit: reqDto.clotheFit,
        condition: reqDto.condition,
        color: reqDto.color,
        size: reqDto.size,
        location: reqDto.location,
        price: reqDto.price,
        image: result.secure_url,
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      });
      await this.productRepository.save(product);

      return plainToInstance(
        CreateProductRes,
        buildSuccessMessage('product created successfully.'),
      );
    } catch (error) {
      await cloudinary.uploader.destroy(result.public_id);
      throw new ValidationException(ErrorCode.V000);
    }

    return;
  }

  async getReviews(
    reqDto: ListProductsReqDto,
    userId: Uuid,
  ): Promise<OffsetPaginatedDto<ReviewsResDto>> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.product', 'product')
      .leftJoin('review.user', 'user')
      .addSelect('product.id', 'productId')
      .addSelect('user.username', 'userName')
      .where('review.userId = :userId', { userId });

    const [items, metaDto] = await paginateJoin<ReviewEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });

    return new OffsetPaginatedDto(transformDto(ReviewsResDto, items), metaDto);
  }
}
