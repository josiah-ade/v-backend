import { Uuid } from '@/common/types/common.type';
import { NumberField, StringField } from '@/decorators/field.decorators';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class BidUserResDto {
  @Expose()
  @StringField()
  id!: Uuid;

  @Expose()
  @StringField()
  username!: string;
}

@Exclude()
export class GetBidsResDto {
  @Expose()
  @StringField()
  id!: Uuid;

  @Expose()
  @NumberField()
  amount!: number;

  @Expose()
  @StringField()
  createdAt!: Date;

  @Expose()
  @Type(() => BidUserResDto)
  user!: BidUserResDto;
}
