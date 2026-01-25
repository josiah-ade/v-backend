import { Uuid } from '@/common/types/common.type';
import { SubscriptionStatus } from '@/constants/modules/subscritions/enums/subscription';
import {
  BooleanField,
  DateField,
  StringField,
} from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SubscriptionResDto {
  @Expose()
  @StringField()
  id!: Uuid;

  @Expose()
  @StringField()
  userId!: Uuid;

  @Expose()
  @StringField()
  planCode!: string;

  @Expose()
  @StringField()
  planType!: string;

  @Expose()
  @StringField({ enum: SubscriptionStatus })
  status!: SubscriptionStatus;

  @Expose()
  @DateField()
  startDate!: Date;

  @Expose()
  @DateField()
  endDate!: Date;

  @Expose()
  @BooleanField()
  autoRenew!: boolean;

  // Optional: derived helper for frontend
  @Expose()
  @BooleanField()
  isActive!: boolean;
}
