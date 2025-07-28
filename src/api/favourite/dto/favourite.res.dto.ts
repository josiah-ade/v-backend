import { StringField, UUIDField } from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FavouriteResDto {
  @UUIDField()
  @Expose() 
  id: string;

  @StringField()
  @Expose()
  title: string;

  @StringField()
  @Expose()
  image: string;
}
