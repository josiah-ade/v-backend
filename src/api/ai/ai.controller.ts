import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth } from '@/decorators/http.decorators';
import { createMulterOptions } from '@/utils/upload/multer-options';
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { sketchPromptResDto } from './dto/sketch-prompt.res.dto';
import { textToImagePromptResDto } from './dto/text-to-image-prompt.res.dto';

@ApiTags('ai')
@Controller({
  path: 'ai',
  version: '1',
})
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('text-to-image')
  @ApiAuth({
    type: textToImagePromptResDto,
    summary: 'Generate image from text prompt',
  })
  async textToImagePrompt(
    @Body() prompt: string,
    @CurrentUser('id') userId: Uuid,
  ): Promise<textToImagePromptResDto> {
    return await this.aiService.textToImagePrompt(prompt, userId);
  }

  // Upload AI Sketch Prompt
  @UseInterceptors(
    FileInterceptor(
      'file',
      createMulterOptions({
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        maxFileSizeInMB: 2,
      }),
    ),
  )
  @Post('sketch-prompt')
  @ApiAuth({
    type: sketchPromptResDto,
    summary: 'Upload Avatar',
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body('prompt') prompt: string,
    @CurrentUser('id') userId: Uuid,
  ): Promise<sketchPromptResDto> {
    return this.aiService.sketchPrompt(file, prompt, userId);
  }
}
