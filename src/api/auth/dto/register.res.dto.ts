import { NumberField, StringField } from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RegisterResDto {
  @Expose()
  @StringField()
  userId!: string;

  @Expose()
  @StringField()
  accessToken!: string;

  @Expose()
  @NumberField()
  tokenExpires!: number;
}
