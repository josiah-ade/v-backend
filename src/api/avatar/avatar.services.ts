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
import cloudinary from '@/utils/upload/claudinary';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { UploadApiResponse } from 'cloudinary';
import { Repository } from 'typeorm';
import { ListUserReqDto } from '../user/dto/list-user.req.dto';
import { AvatarResDto } from './dto/avatar.res.dto';
import { DeleteAvatarRes } from './dto/delete-avatar.res.dto';
import { UploadAvatarResDto } from './dto/upload-avatar.res.dto';
import { AvatarEntity } from './entities/avatar.entity';

@Injectable()
export class AvatarService {
  constructor(
    @InjectRepository(AvatarEntity)
    private readonly avatarRepository: Repository<AvatarEntity>,
  ) {}

  async getAvatars(
    reqDto: ListUserReqDto,
    userId: Uuid,
  ): Promise<OffsetPaginatedDto<AvatarResDto>> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    const query = this.avatarRepository
      .createQueryBuilder('avatar')
      .where({ userId: userId })
      .orderBy('avatar.createdAt', 'DESC');
    const [avatars, metaDto] = await paginate<AvatarEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });

    return new OffsetPaginatedDto(transformDto(AvatarResDto, avatars), metaDto);
  }

  async uploadAvatar(
    file: Express.Multer.File,
    title: string,
    userId: Uuid,
  ): Promise<UploadAvatarResDto> {
    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!file) throw new ValidationException(ErrorCode.A001);

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'avatar' }, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        })
        .end(file.buffer);
    });

    try {
      const avatar = this.avatarRepository.create({
        userId,
        title,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      });
      await this.avatarRepository.save(avatar);

      return transformSingleDto(UploadAvatarResDto, avatar);
    } catch (error) {
      await cloudinary.uploader.destroy(result.public_id);
      throw new ValidationException(ErrorCode.V000);
    }
  }

  async deleteAvatar(id: Uuid, userId: Uuid): Promise<DeleteAvatarRes> {
    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!id) throw new ValidationException(ErrorCode.R000);

    const avatar = await this.avatarRepository.findOneBy({ id, userId });

    if (!avatar) {
      throw new NotFoundAppException(ErrorCode.I002);
    }

    await cloudinary.uploader.destroy(avatar.publicId);
    await this.avatarRepository.remove(avatar);

    return plainToInstance(
      DeleteAvatarRes,
      buildSuccessMessage('avatar deleted successfully.'),
    );
  }
}
