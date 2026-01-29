import { SubscriptionEntity } from '@/api/subscription/entities/subscription.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common/types/common.type';
import { PaymentProvider } from '@/constants/modules/payments/enums/payments';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('payment')
@Index('IDX_payment_reference', ['reference'], { unique: true })
export class PaymentEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: Uuid;

  /* ------------------ USER ------------------ */

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: Uuid;

  @ManyToOne(() => UserEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user?: Relation<UserEntity>;

  /* ---------------- SUBSCRIPTION (OPTIONAL) ---------------- */

  @Column({ name: 'subscription_id', type: 'uuid', nullable: true })
  subscriptionId?: Uuid | null;

  @ManyToOne(() => SubscriptionEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription?: Relation<SubscriptionEntity>;

  /* ---------------- PAYMENT CORE ---------------- */

  @Column()
  email!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ name: 'plan_code', nullable: true })
  planCode?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  fee!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: number;

  @Column({ length: 3 })
  currency!: string;

  @Column({ unique: true })
  reference!: string;

  @Column({ name: 'provider_reference', nullable: true })
  providerReference?: string;

  @Column({ type: 'enum', enum: PaymentProvider })
  provider!: PaymentProvider;

  @Column()
  channel!: string;

  @Column({ name: 'plan_type', nullable: true })
  planType!: string;

  @Column({
    name: 'plan_name',
    nullable: true,
  })
  planName!: string;

  @Column({
    name: 'plan_duration',
    nullable: true,
  })
  planDuration!: string;

  @Column()
  status!: string;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt?: Date;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  /* ---------------- PROVIDER DATA (JSONB) ---------------- */

  @Column({ type: 'jsonb', nullable: true })
  authorization?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  plan?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  log?: Record<string, any>;
}
