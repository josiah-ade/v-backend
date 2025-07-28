// src/api/avatar/entities/avatar.entity.ts

import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common/types/common.type';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('avatar')
export class AvatarEntity extends AbstractEntity {
  constructor(data?: Partial<AvatarEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_avatar_id',
  })
  id!: Uuid;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: Uuid;

  @ManyToOne(() => UserEntity, (user) => user.avatars, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_avatar_user_id',
  })
  user: Relation<UserEntity>;

  @Column({ nullable: true })
  title!: string;

  @Column({ name: 'secure_url' })
  secureUrl!: string;

  @Column({ name: 'public_id' })
  publicId!: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt: Date;
}
