import { EmailField, StringField } from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SocialResDto {
  @Expose()
  @EmailField()
  email!: string;

  @Expose()
  @StringField()
  fullName!: string;

  @Expose()
  @StringField()
  firstName!: string;

  @Expose()
  @StringField()
  lastName!: string;

  @Expose()
  @StringField()
  picture!: string;

  @Expose()
  @StringField()
  accessToken!: string;

  @Expose()
  @StringField()
  socialId: string;
}
