import { PaymentProvider } from '@/constants/modules/payments/enums/payments';
import { NumberField, StringField } from '@/decorators/field.decorators';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class PaymentResDto {
  /* ---------------- IDS ---------------- */

  @Expose()
  @StringField()
  id!: string;

  @Expose()
  @StringField({ nullable: true })
  userId?: string;

  @Expose()
  @StringField({ nullable: true })
  subscriptionId?: string;

  /* ---------------- CUSTOMER ---------------- */

  @Expose()
  @StringField()
  email!: string;

  @Expose()
  @StringField()
  fullName!: string;

  /* ---------------- PLAN / REFERENCE ---------------- */

  @Expose()
  @StringField({ nullable: true })
  planCode?: string;

  @Expose()
  @StringField()
  reference!: string;

  @Expose()
  @StringField({ nullable: true })
  providerReference?: string;

  /* ---------------- MONEY ---------------- */

  // Stored in NAIRA (numeric)
  @Expose()
  @NumberField()
  amount!: number;

  @Expose()
  @NumberField()
  fee!: number;

  @Expose()
  @StringField()
  currency!: string;

  /* ---------------- PROVIDER ---------------- */

  @Expose()
  @StringField({ enum: PaymentProvider })
  provider!: PaymentProvider;

  @Expose()
  @StringField()
  channel!: string;

  @Expose()
  @StringField()
  planType!: string;

  @Expose()
  @StringField()
  status!: string;

  /* ---------------- META ---------------- */

  @Expose()
  @Type(() => Date)
  paidAt?: Date;

  @Expose()
  @StringField({ nullable: true })
  ipAddress?: string;

  /* ---------------- RAW PROVIDER DATA ---------------- */

  @Expose()
  authorization?: Record<string, any>;

  @Expose()
  plan?: Record<string, any>;

  @Expose()
  log?: Record<string, any>;

  /* ---------------- AUDIT ---------------- */

  @Expose()
  @Type(() => Date)
  createdAt!: Date;

  @Expose()
  @Type(() => Date)
  updatedAt!: Date;
}
