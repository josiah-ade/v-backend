import {
  BooleanField,
  NumberField,
  StringField,
} from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';
import {
  BillingCycle,
  SubscriptionDuration,
} from '../entities/subscription-plan.entity';

@Exclude()
export class SubscriptionPlanResDto {
  @Expose()
  @StringField()
  id!: string;

  @Expose()
  @StringField()
  country!: string;

  @Expose()
  @StringField()
  title!: string;

  @Expose()
  @BooleanField()
  recurring!: boolean;

  @Expose()
  @NumberField()
  price!: number;

  @Expose()
  @NumberField()
  sortOrder!: number;

  @Expose()
  @StringField()
  description!: string;

  @Expose()
  @BooleanField()
  popular!: boolean;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  options!: string[];

  @Expose()
  @StringField({ nullable: true })
  code?: string;

  @Expose()
  @StringField({ nullable: true })
  currency?: string;

  @Expose()
  @StringField({ enum: SubscriptionDuration, nullable: true })
  duration?: SubscriptionDuration;

  @Expose()
  @StringField({ enum: BillingCycle, nullable: true })
  billingCycle?: BillingCycle;

}
