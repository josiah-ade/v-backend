import { BooleanField, StringField } from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SuccessResDto {
  @Expose()
  @BooleanField()
  success!: boolean;

  @Expose()
  @StringField()
  message!: string;
}

export class SuccessResponse<T> {
  @Expose()
  @BooleanField()
  success!: boolean;

  @Expose()
  data!: T;
}
