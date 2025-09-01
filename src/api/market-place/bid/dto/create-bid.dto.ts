import { Uuid } from '@/common/types/common.type';
import { StringField, NumberField } from '@/decorators/field.decorators';

export class CreateBidDto {
  @StringField()
  productId: Uuid;

  @StringField()
  message: string;

  @NumberField()
  amount: number;
}
