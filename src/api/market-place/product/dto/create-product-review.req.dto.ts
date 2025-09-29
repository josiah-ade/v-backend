import { Uuid } from '@/common/types/common.type';
import { NumberField, StringField } from '@/decorators/field.decorators';

export class CreateProductReviewReqDto {
  @StringField()
  productId: Uuid;

  @StringField()
  comment: string;

  @StringField()
  rating: string;
}
