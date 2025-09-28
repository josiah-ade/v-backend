// import {
//   NumberField,
//   StringField,
//   UUIDField,
// } from '@/decorators/field.decorators';
// import { Exclude, Expose } from 'class-transformer';

// @Exclude()
// export class GetProductResDto {
//   @UUIDField()
//   @Expose()
//   id: string;

//   @UUIDField()
//   @Expose()
//   userId: string;

//   @StringField()
//   @Expose()
//   image: string;

//   @StringField()
//   @Expose()
//   title: string;

//   @StringField()
//   @Expose()
//   description: string;

//   @StringField()
//   @Expose()
//   styleType: string;

//   @StringField()
//   @Expose()
//   fabricType: string;

//   @StringField()
//   @Expose()
//   clotheFit: string;

//   @StringField()
//   @Expose()
//   condition: string;

//   @StringField()
//   @Expose()
//   color: string;

//   @StringField()
//   @Expose()
//   size: string;

//   @NumberField()
//   @Expose()
//   price: number;
// }

import {
  NumberField,
  StringField,
  UUIDField,
} from '@/decorators/field.decorators';
import { Exclude, Expose, Transform } from 'class-transformer';

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

  // --- Extra user fields ---
  @StringField()
  @Expose()
  @Transform(({ obj }) => obj.username) // Remove .user
  username: string;

  @StringField({ nullable: true })
  @Expose()
  @Transform(({ obj }) => obj.userImage) // Remove .user
  userImage: string;

  @Expose()
  @Transform(({ obj }) => obj.lastSeen) // Remove .user
  lastSeen: Date;

  @NumberField()
  @Expose()
  @Transform(({ obj }) => obj.totalReviews ?? 0)
  totalReviews: number;
}
