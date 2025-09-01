import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common/types/common.type';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne, 
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { ProductEntity } from '../../product/entities/product.entity';
import { ChatRoomEntity } from '../../chat/entities/chat.entity';

export enum BidStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

@Entity('bid')
export class BidEntity extends AbstractEntity {
  constructor(data?: Partial<BidEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_bid_id' })
  id!: Uuid;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: Uuid;

  @ManyToOne(() => ChatRoomEntity, (room) => room.bids, { nullable: true })
  @JoinColumn({
    name: 'chat_room_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_bid_chat_room_id',
  })
  chatRoom?: Relation<ChatRoomEntity>;
  
  @ManyToOne(() => UserEntity, (user) => user.bids, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_bid_user_id',
  })
  user!: Relation<UserEntity>;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: Uuid;

  @ManyToOne(() => ProductEntity, (product) => product.bids, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_bid_product_id',
  })
  product!: Relation<ProductEntity>;

  @Column('decimal')
  amount!: number;

  @Column({
    type: 'enum',
    enum: BidStatus,
    default: BidStatus.PENDING,
  })
  status!: BidStatus;
}
