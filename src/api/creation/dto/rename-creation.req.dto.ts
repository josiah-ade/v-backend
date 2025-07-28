import { Uuid } from '@/common/types/common.type';
import { StringField } from '@/decorators/field.decorators';

export class RenameCreationReqDto {
  @StringField()
  id!: Uuid;

  @StringField()
  title!: string;
}
