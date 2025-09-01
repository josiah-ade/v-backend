import {
  NumberField,
  StringField,
  UUIDField,
} from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductsResDto {
  @UUIDField()
  @Expose()
  id: string;

  @StringField()
  @Expose()
  image: string;

  @StringField()
  @Expose()
  title: string;

  @StringField()
  @Expose()
  location: string;

  @NumberField()
  @Expose()
  price: number;
}
