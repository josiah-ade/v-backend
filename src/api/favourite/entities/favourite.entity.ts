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
@Unique(['userId', 'image', 'title'])
export class FavouriteEntity extends AbstractEntity {
  constructor(data?: Partial<FavouriteEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_favourite_id',
  })
  id!: Uuid;

  @Column({ name: 'user_id' })
  userId!: Uuid;

  @Column({ name: 'style_id' })
  styleId!: Uuid;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_favourite_user_id',
  })
  @ManyToOne(() => UserEntity, (user) => user.favourites, {
    onDelete: 'CASCADE',
  })
  user: Relation<UserEntity>;

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
