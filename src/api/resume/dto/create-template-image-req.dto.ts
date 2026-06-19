import { Uuid } from '@/common/types/common.type';
import { StringField } from '@/decorators/field.decorators';
export class CreateTemplateImageReqDto {
  @StringField()
  id!: Uuid;
}
