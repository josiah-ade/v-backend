import { Uuid } from '@/common/types/common.type';
import { StringField } from '@/decorators/field.decorators';

export class AddCreationReqDto {
  @StringField()
  id!: Uuid;

  @StringField()
  title!: string;

  @StringField()
  image!: string;
}
