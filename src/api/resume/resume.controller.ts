import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { SuccessResDto, SuccessResponse } from '@/common/dto/success.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@/decorators/http.decorators';
import { createMulterOptions } from '@/utils/upload/multer-options';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateCVRequestDto } from './dto/create-resume.res.dto';
import { CreateTemplateImageReqDto } from './dto/create-template-image-req.dto';
import { CreateTemplateImageResDto } from './dto/create-template-image.res.dto';
import { ExportResumeDto } from './dto/export-resume.req';
import { GetResumeResDto } from './dto/get-resume.res.dto';
import { ListResumeReqDto } from './dto/list-resume.req.dto';
import { SaveResumeResDto } from './dto/save-resume.res.dto';
import { ResumeService } from './resume.service';
import { ResumeExportService } from './resumeExport.service';

@ApiTags('resume')
@Controller({
  path: 'resume',
  version: '1',
})
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly resumeExportService: ResumeExportService,
  ) {}

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

  @Post('download')
  @ApiAuth({
    type: SaveResumeResDto,
    summary: 'Download resume',
  })
  async downloadResumePdf(
    @Res() res: Response,
    @CurrentUser('userId') userId: Uuid,
    @Body() dto: ExportResumeDto,
  ): Promise<void> {
    switch (dto.type) {
      case 'pdf':
        return await this.resumeExportService.exportPdf(
          userId,
          dto.resumeId,
          res,
        );
    }
  }

  @Get('export/fetch/:id')
  @ApiPublic({
    type: SuccessResponse<GetResumeResDto>,
    summary: 'Fetch Export Resume',
  })
  async fetchExportedResume(
    @Param('id', ParseUUIDPipe) id: Uuid,
  ): Promise<SuccessResponse<GetResumeResDto>> {
    return await this.resumeExportService.fetchExportedResume(id);
  }

  // Get all resumes for the current user

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

  @Get(':id')
  @ApiPublic({
    type: SaveResumeResDto,
    summary: 'List resumes',
    isPaginated: true,
  })
  async findResumes(
    @Param('id', ParseUUIDPipe) id: Uuid,
  ): Promise<SuccessResponse<GetResumeResDto>> {
    return await this.resumeService.findOne(id);
  }

  @Delete('all')
  @ApiPublic({
    type: SaveResumeResDto,
    summary: 'Delete all resumes',
  })
  async deleteAllResumes(): Promise<SuccessResDto> {
    return await this.resumeService.deleteAll();
  }
}
