import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth } from '@/decorators/http.decorators';
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { AvatarService } from './avatar.services';
import { AvatarResDto } from './dto/avatar.res.dto';
import { DeleteAvatarRes } from './dto/delete-avatar.res.dto';
import { ListAvatarReqDto } from './dto/list-avatar.req.dto';
import { UploadAvatarResDto } from './dto/upload-avatar.res.dto';

@ApiTags('avatar')
@Controller({
  path: 'avatar',
  version: '1',
})
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  // Fetch Avatars
  @Get()
  @ApiAuth({
    type: AvatarResDto,
    summary: 'Get Avatars',
  })
  async getAvatars(
    @Query() reqDto: ListAvatarReqDto,
    @CurrentUser('id') userId: Uuid,
  ): Promise<OffsetPaginatedDto<AvatarResDto>> {
    return this.avatarService.getAvatars(reqDto, userId);
  }

  // Upload Avatar
  @UseInterceptors(
    FileInterceptor(
      'file',
      createMulterOptions({
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        maxFileSizeInMB: 2,
      }),
    ),
  )
  @Post('upload')
  @ApiAuth({
    type: UploadAvatarResDto,
    summary: 'Upload Avatar',
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @CurrentUser('id') userId: Uuid,
  ): Promise<UploadAvatarResDto> {
    return this.avatarService.uploadAvatar(file, title, userId);
  }

  // Delete Avatar
  @Delete('/delete/:id')
  @ApiAuth({
    summary: 'Delete avatar',
  })
  @ApiParam({ name: 'id', type: 'String' })
  async delete(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @CurrentUser('id') userId: Uuid,
  ): Promise<DeleteAvatarRes> {
    return this.avatarService.deleteAvatar(id, userId);
  }
}
