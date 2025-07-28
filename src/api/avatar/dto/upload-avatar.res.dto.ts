import { StringField } from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UploadAvatarResDto {
  @StringField()
  @Expose()
  id: string;

  @StringField()
  @Expose()
  title: string;

  @StringField()
  @Expose({ name: 'publicId' })
  public_id: string;

  @StringField()
  @Expose({ name: 'secureUrl' })
  secure_url: string;
}
