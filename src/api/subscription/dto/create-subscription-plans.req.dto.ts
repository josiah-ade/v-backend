import {
  BooleanField,
  NumberField,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import {
  BillingCycle,
  SubscriptionDuration,
} from '../entities/subscription-plan.entity';

export class CreateSubscriptionPlanReqDto {
  @StringField()
  country!: string;

  @StringField()
  title!: string;

  @BooleanField({ default: false })
  recurring!: boolean;

  @NumberField()
  price!: number;

  @StringField()
  description!: string;

  @BooleanField({ default: false })
  popular!: boolean;

  @StringField({ each: true })
  options!: string[];

  @BooleanField({ default: false })
  isOneTime!: boolean;

  @NumberField({ default: 0 })
  sortOrder!: number;

  @StringFieldOptional({ nullable: true })
  code?: string;

  @StringFieldOptional({ nullable: true })
  currency?: string;

  @StringFieldOptional({
    enum: SubscriptionDuration,
    nullable: true,
  })
  duration?: SubscriptionDuration;

  @StringFieldOptional({
    enum: BillingCycle,
    nullable: true,
  })
  billingCycle?: BillingCycle;
}
