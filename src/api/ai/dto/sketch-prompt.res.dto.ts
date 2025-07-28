import { Exclude } from 'class-transformer';
import { textToImagePromptResDto } from './text-to-image-prompt.res.dto';

@Exclude()
export class sketchPromptResDto extends textToImagePromptResDto {}
