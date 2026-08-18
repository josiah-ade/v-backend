import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { SuccessResDto, SuccessResponse } from '@/common/dto/success.dto';
import { Uuid } from '@/common/types/common.type';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import { ValidationException } from '@/exceptions/validation.exception';
import { paginate } from '@/utils/offset-pagination';
import { transformSingleDto } from '@/utils/transformers/transform-dto';
import cloudinary from '@/utils/upload/claudinary';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { UploadApiResponse } from 'cloudinary';
import { Repository } from 'typeorm/repository/Repository';
import { UserEntity } from '../user/entities/user.entity';
import { CreateCVRequestDto } from './dto/create-resume.res.dto';
import { CreateTemplateImageResDto } from './dto/create-template-image.res.dto';
import { GetResumeResDto } from './dto/get-resume.res.dto';
import { ListResumeReqDto } from './dto/list-resume.req.dto';
import { SaveResumeResDto } from './dto/save-resume.res.dto';
import { ResumeEntity } from './entities/resume.entity';

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(ResumeEntity)
    private readonly resumeRepository: Repository<ResumeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async saveResume(
    userId: Uuid,
    dto: CreateCVRequestDto,
  ): Promise<SuccessResDto> {
    if (!userId) {
      throw new ValidationException(ErrorCode.R000);
    }

    // console.log(dto.cvData);

    const user = await this.userRepository.findOneByOrFail({ id: userId });

    let resume: ResumeEntity;

    const { cvId, ...resumeData } = dto.cvData;

    if (cvId) {
      resume = await this.resumeRepository.findOne({
        where: {
          id: cvId,
          userId,
        },
      });

      if (!resume) {
        throw new ValidationException(ErrorCode.R001);
      }

      Object.assign(resume, resumeData);

      await this.resumeRepository.save(resume);
    } else {
      resume = this.resumeRepository.create({
        ...resumeData,
        userId,
        user,
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      });

      await this.resumeRepository.save(resume);
    }

    return transformSingleDto(SaveResumeResDto, {
      cvId: resume.id,
    });
  }

  async fetchResume(
    userId: Uuid,
    cvId: Uuid,
  ): Promise<SuccessResponse<GetResumeResDto>> {
    if (!userId) {
      throw new ValidationException(ErrorCode.R000);
    }

    const resume = await this.resumeRepository.findOne({
      where: {
        id: cvId,
        userId,
      },
    });

    if (!resume) {
      throw new ValidationException(ErrorCode.R001);
    }

    const {
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
      id,
      userId: _userId,
      ...filteredResume
    } = resume;

    const finalData = {
      cvId: id,
      ...filteredResume,
    };

    return transformSingleDto(
      GetResumeResDto,
      {
        cvData: finalData,
      },
      undefined,
      false,
    );
  }

  async findAll(
    reqDto: ListResumeReqDto,
  ): Promise<OffsetPaginatedDto<CreateCVRequestDto>> {
    const query = this.resumeRepository
      .createQueryBuilder('resume')
      .orderBy('resume.createdAt', 'DESC');

    const [resume, metaDto] = await paginate<ResumeEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });

    return new OffsetPaginatedDto(
      plainToInstance(CreateCVRequestDto, resume),
      metaDto,
    );
  }

  async findOne(id: Uuid): Promise<SuccessResponse<GetResumeResDto>> {
    const resume = await this.resumeRepository.findOneBy({ id });

    if (!resume) {
      throw new ValidationException(ErrorCode.R001);
    }

    return transformSingleDto(GetResumeResDto, resume, undefined, false);
  }

  async deleteAll(): Promise<SuccessResDto> {
    await this.resumeRepository.clear();
    return transformSingleDto(SuccessResDto, {
      success: true,
      message: 'All resumes deleted successfully',
    });
  }

  async uploadTemplateImage(
    file: Express.Multer.File,
    id: Uuid,
    userId: Uuid,
  ): Promise<SuccessResponse<CreateTemplateImageResDto>> {
    // console.log(userId, file, id);

    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!file) throw new ValidationException(ErrorCode.I005);

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'resume/template' }, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        })
        .end(file.buffer);
    });

    return transformSingleDto(CreateTemplateImageResDto, {
      imageUrl: result.secure_url,
    });
  }
}
