import { FavouriteEntity } from '@/api/favourite/entities/favourite.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common/types/common.type';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('creation')
export class CreationEntity extends AbstractEntity {
  constructor(data?: Partial<CreationEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_creation_id',
  })
  id!: Uuid;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: Uuid;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_creation_user_id',
  })
  @ManyToOne(() => UserEntity, (user) => user.creations, {
    onDelete: 'CASCADE',
  })
  user: Relation<UserEntity>;

  @OneToMany(() => FavouriteEntity, (favourite) => favourite.creation)
  favourites: Relation<FavouriteEntity[]>;

  @Column({ default: 'Untitled' })
  title?: string;

  @Column({ nullable: true })
  content?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ enum: ['avatar', 'content'], default: 'avatar' })
  type!: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt: Date;
}
