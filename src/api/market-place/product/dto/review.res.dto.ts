import {
  DateField,
  NumberField,
  StringField,
  UUIDField,
} from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ReviewsResDto {
  @UUIDField()
  @Expose()
  id: string;

  @StringField()
  @Expose()
  userName: string;

  @StringField()
  @Expose()
  userImage: string;

  @StringField()
  @Expose()
  productId: string;

  @NumberField()
  @Expose()
  rating: number;

  @StringField()
  @Expose()
  comment: string;

  @DateField()
  @Expose()
  createdAt: Date;
}
