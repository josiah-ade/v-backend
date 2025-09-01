import { NumberField, StringField } from '@/decorators/field.decorators';

export class GetProductReqDto {
  @StringField()
  title: string;

  @StringField()
  description: string;

  @StringField()
  styleType: string;

  @StringField()
  fabricType: string;

  @StringField()
  clotheFit: string;

  @StringField()
  condition: string;

  @StringField()
  color: string;

  @StringField()
  size: string;

  @StringField()
  location: string;

  @NumberField()
  price: number;
}
