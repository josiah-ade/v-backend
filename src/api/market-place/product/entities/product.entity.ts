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
import { BidEntity } from '../../bid/entities/bid.entity';
import { ReviewEntity } from './review.entity';
import { ChatRoomEntity } from '../../chat/entities/chat.entity';

export enum ProductStatus {
  LISTED = 'Listed',
  SOLD = 'Sold',
  RESERVED = 'Reserved',
}

@Entity('product')
export class ProductEntity extends AbstractEntity {
  constructor(data?: Partial<ProductEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_product_id',
  })
  id!: Uuid;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: Uuid;

  @ManyToOne(() => UserEntity, (user) => user.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_product_user_id',
  })
  user!: Relation<UserEntity>;

  @Column()
  title!: string;

  @Column()
  image!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'style_type' })
  styleType!: string;

  @Column({ name: 'fabric_type' })
  fabricType!: string;

  @Column({ name: 'clothe_fit' })
  clotheFit!: string;

  @Column()
  condition!: string;

  @Column()
  size!: string;

  @Column()
  color!: string;

  @Column()
  location!: string;

  @Column('decimal')
  price!: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.LISTED,
  })
  status!: ProductStatus;

  @OneToMany(() => BidEntity, (bid) => bid.product)
  bids!: Relation<BidEntity[]>;

  @OneToMany(() => ReviewEntity, (review) => review.product)
  reviews!: Relation<ReviewEntity[]>;

  @OneToMany(() => ChatRoomEntity, (chatRoom) => chatRoom.product)
  chatRooms!: Relation<ChatRoomEntity[]>;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt!: Date | null;
}
