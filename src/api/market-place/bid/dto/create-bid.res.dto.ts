import { Uuid } from '@/common/types/common.type';
import { NumberField, StringField } from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CreateBidResDto {
  @Expose()
  @StringField()
  bidId: Uuid;

  @Expose()
  @StringField()
  chatRoomId: Uuid;

  @Expose()
  @StringField()
  productId: Uuid;

  @Expose()
  @NumberField()
  amount: number;
}
