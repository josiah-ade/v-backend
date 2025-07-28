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
import {
  transformDto,
  transformSingleDto,
} from '@/utils/transformers/transform-dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { AvatarEntity } from '../avatar/entities/avatar.entity';
import { AddCreationReqDto } from './dto/add-creation.req.dto';
import { CreationResDto } from './dto/creation.res.dto';
import { DeleteCreationRes } from './dto/delete-creation.res.dto';
import { ListCreationReqDto } from './dto/list-creation.req.dto';
import { RenameCreationReqDto } from './dto/rename-creation.req.dto';
import { RenameCreationResDto } from './dto/rename-creation.res.dto';
import { CreationEntity } from './entities/creation.entity';
import { buildEmptyCreationResponse } from './helpers';

@Injectable()
export class CreationService {
  constructor(
    @InjectRepository(CreationEntity)
    private readonly creationRepository: Repository<CreationEntity>,
    @InjectRepository(AvatarEntity)
    private readonly avatarRepository: Repository<AvatarEntity>,
  ) {}

  async getCreations(
    reqDto: ListCreationReqDto,
    userId: Uuid,
  ): Promise<OffsetPaginatedDto<CreationResDto>> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    const query = this.creationRepository
      .createQueryBuilder('creation')
      .where('creation.userId = :userId', { userId })
      .orderBy('creation.createdAt', 'DESC');
    const [creations, metaDto] = await paginate<CreationEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });

    return new OffsetPaginatedDto(
      transformDto(CreationResDto, creations),
      metaDto,
    );
  }

  async getLatestCreation(userId: Uuid): Promise<CreationResDto> {
    if (!userId) {
      throw new ValidationException(ErrorCode.E002);
    }

    const latestCreation = await this.creationRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!latestCreation) {
      return buildEmptyCreationResponse('No creations found.');
    }

    return transformSingleDto(CreationResDto, latestCreation);
  }

  async addNewCreation(
    dto: AddCreationReqDto,
    userId: Uuid,
  ): Promise<CreationResDto> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    const isExist = await this.avatarRepository.findOne({
      where: { userId, secureUrl: dto.image },
    });

    if (!isExist) {
      throw new ValidationException(ErrorCode.A002);
    }

    const creation = new CreationEntity({
      userId: userId,
      image: dto.image,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });
    await this.creationRepository.save(creation);

    return transformSingleDto(CreationResDto, creation);
  }

  async renameCreation(
    dto: RenameCreationReqDto,
    userId: Uuid,
  ): Promise<RenameCreationResDto> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    const creation = await this.creationRepository.findOne({
      where: { userId, id: dto.id },
    });

    if (!creation) {
      throw new ValidationException(ErrorCode.I002);
    }

    creation.title = dto.title;
    creation.updatedBy = SYSTEM_USER_ID;

    await this.creationRepository.save(creation);

    return plainToInstance(RenameCreationResDto, {
      id: creation.id,
      title: creation.title,
    });
  }

  async deleteCreation(id: Uuid, userId: Uuid): Promise<DeleteCreationRes> {
    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!id) throw new ValidationException(ErrorCode.R000);

    const creation = await this.creationRepository.findOneBy({ id, userId });

    if (!creation) {
      throw new NotFoundAppException(ErrorCode.I002);
    }

    await this.creationRepository.remove(creation);

    return plainToInstance(
      DeleteCreationRes,
      buildSuccessMessage('Creation deleted successfully.'),
    );
  }
}
