import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common/types/common.type';
import { SubscriptionStatus } from '@/constants/modules/subscritions/enums/subscription';
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
import { SubscriptionPlanEntity } from './subscription-plan.entity';

@Entity('subscription')
@Index('IDX_subscription_user_active', ['userId'], {
  unique: true,
  where: `"status" = 'ACTIVE'`,
})
export class SubscriptionEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_subscription_id',
  })
  id!: Uuid;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: Uuid;

  @ManyToOne(() => UserEntity, (user) => user.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: Uuid;

  @ManyToOne(() => SubscriptionPlanEntity, (plan) => plan.subscriptions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'plan_id' })
  plan!: Relation<SubscriptionPlanEntity>;

  @Column({
    name: 'plan_code',
  })
  planCode!: string;

  @Column({
    name: 'plan_name',
  })
  planName!: string;

  @Column({
    name: 'plan_duration',
  })
  planDuration!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'timestamptz' })
  endDate!: Date;

  @Column({ default: false })
  autoRenew!: boolean;

  @Column({ name: 'expired_at', type: 'timestamptz', nullable: true })
  expiredAt!: Date;
}
