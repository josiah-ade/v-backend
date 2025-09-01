import {
  NumberField,
  StringField,
  UUIDField,
} from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GetProductResDto {
  @UUIDField()
  @Expose()
  id: string;

  @UUIDField()
  @Expose()
  userId: string;

  @StringField()
  @Expose()
  image: string;

  @StringField()
  @Expose()
  title: string;

  @StringField()
  @Expose()
  description: string;

  @StringField()
  @Expose()
  styleType: string;

  @StringField()
  @Expose()
  fabricType: string;

  @StringField()
  @Expose()
  clotheFit: string;

  @StringField()
  @Expose()
  condition: string;

  @StringField()
  @Expose()
  color: string;

  @StringField()
  @Expose()
  size: string;

  @NumberField()
  @Expose()
  price: number;
}
