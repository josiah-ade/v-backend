import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { SuccessResDto, SuccessResponse } from '@/common/dto/success.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@/decorators/http.decorators';
import { createMulterOptions } from '@/utils/upload/multer-options';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { CreateCVRequestDto } from './dto/create-resume.res.dto';
import { CreateTemplateImageReqDto } from './dto/create-template-image-req.dto';
import { CreateTemplateImageResDto } from './dto/create-template-image.res.dto';
import { GetResumeResDto } from './dto/get-resume.res.dto';
import { ListResumeReqDto } from './dto/list-resume.req.dto';
import { SaveResumeResDto } from './dto/save-resume.res.dto';
import { ResumeService } from './resume.service';

@ApiTags('resume')
@Controller({
  path: 'resume',
  version: '1',
})
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @ApiAuth({
    type: SuccessResDto,
    summary: 'Save Resume',
  })
  @Post('save')
  async saveResume(
    @CurrentUser('userId') userId: Uuid,
    @Body() dto: CreateCVRequestDto,
  ): Promise<SuccessResDto> {
    return await this.resumeService.saveResume(userId, dto);
  }

  @ApiAuth({
    type: SuccessResponse<GetResumeResDto>,
    summary: 'Fetch Resume',
  })
  @Get('fetch/:id')
  async fetchResume(
    @CurrentUser('userId') userId: Uuid,
    @Param('id', ParseUUIDPipe) id: Uuid,
  ): Promise<SuccessResponse<GetResumeResDto>> {
    return await this.resumeService.fetchResume(userId, id);
  }

  @Get('all')
  @ApiPublic({
    type: SaveResumeResDto,
    summary: 'List resumes',
    isPaginated: true,
  })
  async findAllResumes(
    @Query() reqDto: ListResumeReqDto,
  ): Promise<OffsetPaginatedDto<CreateCVRequestDto>> {
    return await this.resumeService.findAll(reqDto);
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
  @Post('image-template/upload')
  @ApiAuth({
    type: SuccessResponse<CreateTemplateImageResDto>,
    summary: 'Upload Template Image',
  })
  async uploadTemplateImage(
    @CurrentUser('userId') userId: Uuid,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateTemplateImageReqDto,
  ): Promise<SuccessResponse<CreateTemplateImageResDto>> {
    return this.resumeService.uploadTemplateImage(file, dto.id, userId);
  }
}
