// import { UserEntity } from '@/api/user/entities/user.entity';
// import { Uuid } from '@/common/types/common.type';
// import { AbstractEntity } from '@/database/entities/abstract.entity';
// import {
//   Entity,
//   JoinColumn,
//   ManyToOne,
//   OneToMany,
//   OneToOne,
//   PrimaryGeneratedColumn,
//   Relation,
// } from 'typeorm';
// import { MessageEntity } from './message.entity';
// import { ProductEntity } from '../../product/entities/product.entity';
// import { BidEntity } from '../../bid/entities/bid.entity';

// @Entity('chat_room')
// export class ChatRoomEntity extends AbstractEntity {
//   constructor(data?: Partial<ChatRoomEntity>) {
//     super();
//     Object.assign(this, data);
//   }

//   @PrimaryGeneratedColumn('uuid', {
//     primaryKeyConstraintName: 'PK_chat_room_id',
//   })
//   id!: Uuid;

//   @ManyToOne(() => ProductEntity, (product) => product.chatRooms, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({
//     name: 'product_id',
//     referencedColumnName: 'id',
//     foreignKeyConstraintName: 'FK_chat_room_product_id',
//   })
//   product!: Relation<ProductEntity>;

//   @ManyToOne(() => UserEntity)
//   @JoinColumn({ name: 'owner_id' })
//   owner!: UserEntity;

//   @ManyToOne(() => UserEntity)
//   @JoinColumn({ name: 'bidder_id' })
//   bidder!: UserEntity;

//   @OneToMany(() => MessageEntity, (msg) => msg.chatRoom)
//   messages!: Relation<MessageEntity[]>;

//   @OneToOne(() => MessageEntity, { nullable: true })
//   @JoinColumn({ name: 'last_message_id' })
//   lastMessage?: Relation<MessageEntity>;

//   @OneToMany(() => BidEntity, (bid) => bid.chatRoom)
//   bids!: Relation<BidEntity[]>;
// }


import { type UserEntity } from '@/api/user/entities/user.entity'; 
import { type ProductEntity } from '../../product/entities/product.entity'; 
import { type MessageEntity } from './message.entity'; 
import { type BidEntity } from '../../bid/entities/bid.entity'; 
import { Uuid } from '@/common/types/common.type';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('chat_room')
export class ChatRoomEntity extends AbstractEntity {
  constructor(data?: Partial<ChatRoomEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_chat_room_id',
  })
  id!: Uuid;

  @ManyToOne(
    () => require('../../product/entities/product.entity').ProductEntity, 
    (product: ProductEntity) => product.chatRooms,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_chat_room_product_id',
  })
  product!: Relation<ProductEntity>;

  @ManyToOne(
    () => require('@/api/user/entities/user.entity').UserEntity, 
  )
  @JoinColumn({ name: 'owner_id' })
  owner!: UserEntity;

  @ManyToOne(
    () => require('@/api/user/entities/user.entity').UserEntity, 
  )
  @JoinColumn({ name: 'bidder_id' })
  bidder!: UserEntity;

  @OneToMany(
    () => require('./message.entity').MessageEntity, 
    (msg: MessageEntity) => msg.chatRoom,
  )
  messages!: Relation<MessageEntity[]>;

  @OneToOne(() => require('./message.entity').MessageEntity, { nullable: true }) 
  @JoinColumn({ name: 'last_message_id' })
  lastMessage?: Relation<MessageEntity>;

  @OneToMany(
    () => require('../../bid/entities/bid.entity').BidEntity, 
    (bid: BidEntity) => bid.chatRoom,
  )
  bids!: Relation<BidEntity[]>;
}
