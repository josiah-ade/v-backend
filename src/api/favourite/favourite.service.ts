import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import {
  NotFoundAppException,
  ValidationException,
} from '@/exceptions/validation.exception';
import { paginate } from '@/utils/offset-pagination';
import { buildSuccessMessage } from '@/utils/response-builder.utils';
import { transformDto } from '@/utils/transformers/transform-dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { ListUserReqDto } from '../user/dto/list-user.req.dto';
import { CreateFavouriteReqDto } from './dto/create-favourite.req.dto';
import { CreateFavouriteResDto } from './dto/create-favourite.res.dto';
import { DeleteFavouriteResDto } from './dto/delete-favourite.res.dto';
import { FavouriteResDto } from './dto/favourite.res.dto';
import { FavouriteEntity } from './entities/favourite.entity';

@Injectable()
export class FavouriteService {
  constructor(
    @InjectRepository(FavouriteEntity)
    private readonly favouriteRepository: Repository<FavouriteEntity>,
  ) {}

  async createFavourites(
    dto: CreateFavouriteReqDto,
    userId: Uuid,
  ): Promise<CreateFavouriteResDto> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    const isExist = await this.favouriteRepository.exists({
      where: {
        userId,
        creationId: dto.id,
      },
    });

    if (isExist) {
      throw new ValidationException(ErrorCode.I003);
    }

    const favorite = new FavouriteEntity({
      userId: userId,
      creationId: dto.id,
      title: dto.title,
      image: dto.image,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });
    await this.favouriteRepository.save(favorite);

    return plainToInstance(
      CreateFavouriteResDto,
      buildSuccessMessage('favourite added successfully'),
    );
  }

  async getFavourites(
    reqDto: ListUserReqDto,
    userId: Uuid,
  ): Promise<OffsetPaginatedDto<FavouriteResDto>> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    const query = this.favouriteRepository
      .createQueryBuilder('favourite')
      .where({ userId: userId })
      .orderBy('favourite.createdAt', 'DESC');
    const [favourites, metaDto] = await paginate<FavouriteEntity>(
      query,
      reqDto,
      {
        skipCount: false,
        takeAll: false,
      },
    );

    return new OffsetPaginatedDto(
      transformDto(FavouriteResDto, favourites),
      metaDto,
    );
  }

  async deleteFavourites(
    id: Uuid,
    userId: Uuid,
  ): Promise<DeleteFavouriteResDto> {
    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!id) throw new ValidationException(ErrorCode.R000);

    const favourite = await this.favouriteRepository.findOneBy({ id, userId });

    if (!favourite) {
      throw new NotFoundAppException(ErrorCode.I002);
    }

    await this.favouriteRepository.remove(favourite);

    return plainToInstance(
      DeleteFavouriteResDto,
      buildSuccessMessage('favourite deleted successfully.'),
    );
  }
}
