import { CreationEntity } from '@/api/creation/entities/creation.entity';
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
  Unique,
} from 'typeorm';

@Entity('favourite')
@Unique(['creationId'])
export class FavouriteEntity extends AbstractEntity {
  constructor(data?: Partial<FavouriteEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_favourite_id',
  })
  id!: Uuid;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: Uuid;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_favourite_user_id',
  })
  @ManyToOne(() => UserEntity, (user) => user.favourites, {
    onDelete: 'CASCADE',
  })
  user: Relation<UserEntity>;

  @Column({ name: 'creation_id', type: 'uuid' })
  creationId!: string;

  @JoinColumn({
    name: 'creation_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_favourite_creation_id',
  })
  @ManyToOne(() => CreationEntity, {
    onDelete: 'CASCADE',
  })
  creation: Relation<CreationEntity>;

  @Column()
  title!: string;

  @Column()
  image!: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt: Date;
}
