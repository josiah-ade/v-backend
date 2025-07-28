import { Uuid } from '@/common/types/common.type';
import { ErrorCode } from '@/constants/error-code.constant';
import { ValidationException } from '@/exceptions/validation.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { sketchPromptResDto } from './dto/sketch-prompt.res.dto';
import { textToImagePromptResDto } from './dto/text-to-image-prompt.res.dto';
import { AiTextEntity } from './entities/ai.text.entity';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiTextEntity)
    private readonly aiRepository: Repository<AiTextEntity>,
  ) {}
  async textToImagePrompt(
    prompt: string,
    userId: Uuid,
  ): Promise<textToImagePromptResDto> {
    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!prompt || prompt.length < 10)
      throw new ValidationException(ErrorCode.AI001);

    return plainToInstance(textToImagePromptResDto, {
      secureUrl: '/browse/search-dress.png',
      status: 'success',
      message: 'image generated successfully',
    });
  }

  async sketchPrompt(
    file: Express.Multer.File,
    prompt: string,
    userId: Uuid,
  ): Promise<sketchPromptResDto> {
    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!file) throw new ValidationException(ErrorCode.A001);

    return plainToInstance(sketchPromptResDto, {
      secureUrl: '/browse/dress-sample/bow_knot_dress (1).png',
      status: 'success',
      message: 'image generated successfully',
    });
  }
}
