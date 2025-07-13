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
import { Injectable } from '@nestjs/common';
import assert from 'assert';
import { plainToInstance } from 'class-transformer';
import { ListUserReqDto } from '../user/dto/list-user.req.dto';
import { CreateFavouriteReqDto } from './dto/create-favourite.req.dto';
import { CreateFavouriteResDto } from './dto/create-favourite.res.dto';
import { DeleteFavouriteResDto } from './dto/delete-favourite.res.dto';
import { FavouriteResDto } from './dto/favourite.res.dto';
import { FavouriteEntity } from './entities/favourite.entity';

@Injectable()
export class FavouriteService {
  async create(
    dto: CreateFavouriteReqDto,
    userId: Uuid,
  ): Promise<CreateFavouriteResDto> {
    const isExist = await FavouriteEntity.exists({
      where: {
        userId,
        image: dto.image,
        title: dto.title,
      },
    });

    if (isExist) {
      throw new ValidationException(ErrorCode.F001);
    }

    const favorite = new FavouriteEntity({
      userId: userId,
      styleId: dto.id,
      title: dto.title,
      image: dto.image,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });
    await favorite.save();

    return plainToInstance(
      CreateFavouriteResDto,
      buildSuccessMessage('favourite added successfully'),
    );
  }

  async findAllById(
    reqDto: ListUserReqDto,
    userId: Uuid,
  ): Promise<OffsetPaginatedDto<FavouriteResDto>> {
    assert(userId, 'User ID is required');

    const query = FavouriteEntity.createQueryBuilder('favourite')
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
      plainToInstance(FavouriteResDto, favourites),
      metaDto,
    );
  }

  async delete(id: Uuid, userId: Uuid): Promise<DeleteFavouriteResDto> {
    assert(id, 'Post ID is required');
    assert(userId, 'User ID is required');

    const favourite = await FavouriteEntity.findOneBy({ id, userId });

    if (!favourite) {
      throw new NotFoundAppException(ErrorCode.F002);
    }

    await FavouriteEntity.remove(favourite);

    return plainToInstance(
      DeleteFavouriteResDto,
      buildSuccessMessage('favourite removed successfully.'),
    );
  }
}
