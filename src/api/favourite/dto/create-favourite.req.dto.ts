import { Uuid } from '@/common/types/common.type';
import { StringField } from '@/decorators/field.decorators';

export class CreateFavouriteReqDto {
  @StringField()
  id!: Uuid;

  @StringField()
  title!: string;

  @StringField()
  image!: string;
}
