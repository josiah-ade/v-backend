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
import { CreateProductReviewReqDto } from './dto/create-product-review.req.dto';
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

  async getRelatedProducts(
    productId: Uuid,
    userId: Uuid,
  ): Promise<{
    sameUserProducts: ProductsResDto[];
    similarProducts: ProductsResDto[];
  }> {
    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!productId) throw new ValidationException(ErrorCode.I004);

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new ValidationException(ErrorCode.I002);

    // 1. Get products from the same user (exclude current product)
    const sameUserProducts = await this.productRepository
      .createQueryBuilder('p')
      .where('p.user_id = :userId', { userId: product.userId })
      .andWhere('p.id != :productId', { productId })
      .andWhere('p.status = :status', { status: ProductStatus.LISTED })
      .take(10)
      .getMany();

    // 2. Get products similar to the current product
    const similarProducts = await this.productRepository
      .createQueryBuilder('p')
      .where('p.id != :productId', { productId })
      .andWhere('p.status = :status', { status: ProductStatus.LISTED })
      .take(10)
      .getMany();

    return {
      sameUserProducts: transformDto(ProductsResDto, sameUserProducts),
      similarProducts: transformDto(ProductsResDto, similarProducts),
    };
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
    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!id) throw new ValidationException(ErrorCode.I004);

    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.user', 'user')
      .loadRelationCountAndMap('user.totalReviews', 'user.reviews')
      .where('product.id = :id', { id })
      .getOne();

    if (!product) throw new ValidationException(ErrorCode.I002);

    const dto: GetProductResDto = {
      id: product.id,
      userId: product.userId,
      image: product.image,
      title: product.title,
      description: product.description,
      styleType: product.styleType,
      fabricType: product.fabricType,
      clotheFit: product.clotheFit,
      condition: product.condition,
      color: product.color,
      size: product.size,
      price: Number(product.price),

      // extra user fields
      username: product.user?.username,
      userImage: product.user?.image ?? '',
      lastSeen: product.user?.lastSeen,
      totalReviews: (product.user as any)?.totalReviews ?? 0,
    };

    return dto;
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

  async getProductReviews(
    productId: Uuid,
    reqDto: ListProductsReqDto,
    userId: Uuid,
  ): Promise<OffsetPaginatedDto<ReviewsResDto>> {
    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!productId) throw new ValidationException(ErrorCode.I004);

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new ValidationException(ErrorCode.I002);

    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.product', 'product')
      .leftJoin('review.user', 'user')
      .addSelect('product.id', 'productId')
      .addSelect('user.username', 'userName')
      .addSelect('user.image', 'userImage')
      .where('review.productId = :productId', { productId });

    const [items, metaDto] = await paginateJoin<ReviewEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });

    return new OffsetPaginatedDto(transformDto(ReviewsResDto, items), metaDto);
  }

  async uploadProductReview(
    dto: CreateProductReviewReqDto,
    userId: Uuid,
  ): Promise<CreateProductRes> {
    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!dto.productId) throw new ValidationException(ErrorCode.I004);

    // check if product exists
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new ValidationException(ErrorCode.I002);
    }

    // check if user already reviewed (optional)
    const existingReview = await this.reviewRepository.findOne({
      where: { productId: dto.productId, userId },
    });
    if (existingReview) {
      throw new ValidationException(ErrorCode.I003);
    }

    const review = this.reviewRepository.create({
      productId: dto.productId,
      storeId: userId,
      userId,
      rating: Number(dto.rating,)
      comment: dto.comment,
    });

    await this.reviewRepository.save(review);

    return plainToInstance(
      CreateProductRes,
      buildSuccessMessage('Review added successfully.'),
    );
  }
}
