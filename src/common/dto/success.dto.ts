import { StringField } from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SuccessResDto {
  @Expose()
  @StringField()
  status!: string;

  @Expose()
  @StringField()
  message!: string;
}
