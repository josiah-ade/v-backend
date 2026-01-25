import { Uuid } from '@/common/types/common.type';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SubscriptionDuration {
  WEEK = 'week',
  MONTH = 'month',
}

export enum BillingCycle {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity('subscription_plan')
export class SubscriptionPlanEntity extends AbstractEntity {
  constructor(data?: Partial<SubscriptionPlanEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_subscription_plan_id',
  })
  id!: Uuid;

  @Column()
  @Index('IDX_subscription_plan_country')
  country!: string;

  @Column()
  title!: string;

  @Column({ default: false })
  recurring!: boolean;

  @Column({ type: 'numeric' })
  price!: number;

  @Column({ type: 'text' })
  description!: string;

  @Column({ default: false })
  popular!: boolean;

  @Column({ default: false })
  isOneTime!: boolean;

  @Column({ type: 'text', array: true })
  options!: string[];

  @Column({ name: 'send_invoices', default: false })
  sendInvoices!: boolean;

  @Column({ name: 'send_sms', default: false })
  sendSms!: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  currency?: string;

  @Column({
    type: 'enum',
    enum: SubscriptionDuration,
    nullable: true,
  })
  duration?: SubscriptionDuration;

  @Column({
    name: 'billing_cycle',
    type: 'enum',
    enum: BillingCycle,
    nullable: true,
  })
  billingCycle?: BillingCycle;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt!: Date;
}
