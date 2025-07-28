import { SuccessResDto } from '@/common/dto/success.dto';
import { StringField } from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class textToImagePromptResDto extends SuccessResDto {
  @Expose()
  @StringField()
  secureUrl!: string;
}
