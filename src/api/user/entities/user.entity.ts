// import { AiTextEntity } from '@/api/ai/entities/ai.text.entity';
// import { AvatarEntity } from '@/api/avatar/entities/avatar.entity';
// import { CreationEntity } from '@/api/creation/entities/creation.entity';
// import { FavouriteEntity } from '@/api/favourite/entities/favourite.entity';
// import { BidEntity } from '@/api/market-place/bid/entities/bid.entity';
// import { MessageEntity } from '@/api/market-place/chat/entities/message.entity';
// import { ProductEntity } from '@/api/market-place/product/entities/product.entity';
// import { ReviewEntity } from '@/api/market-place/product/entities/review.entity';
// import { PostEntity } from '@/api/post/entities/post.entity';
// import { Uuid } from '@/common/types/common.type';
// import { AbstractEntity } from '@/database/entities/abstract.entity';
// import { hashPassword as hashPass } from '@/utils/password.util';
// import {
//   BeforeInsert,
//   BeforeUpdate,
//   Column,
//   DeleteDateColumn,
//   Entity,
//   Index,
//   OneToMany,
//   PrimaryGeneratedColumn,
//   Relation,
// } from 'typeorm';

// @Entity('user')
// export class UserEntity extends AbstractEntity {
//   constructor(data?: Partial<UserEntity>) {
//     super();
//     Object.assign(this, data);
//   }

//   @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_user_id' })
//   id!: Uuid;

//   @Column({ length: 50, nullable: true })
//   @Index('UQ_user_username', {
//     where: '"deleted_at" IS NULL',
//     unique: true,
//   })
//   username: string;

//   @Column()
//   @Index('UQ_user_email', { where: '"deleted_at" IS NULL', unique: true })
//   email!: string;

//   @Column()
//   password!: string;

//   @Column({ default: '' })
//   bio?: string;

//   @Column({ default: '' })
//   image?: string;

//   @Column({ name: 'last_seen', type: 'timestamptz', nullable: true })
//   lastSeen?: Date;

//   @DeleteDateColumn({
//     name: 'deleted_at',
//     type: 'timestamptz',
//     default: null,
//   })
//   deletedAt: Date;

//   @OneToMany(
//     () => require('./session.entity').SessionEntity,
//     (session: any) => session.user,
//   )
//   sessions?: import('./session.entity').SessionEntity[];

//   @OneToMany(() => PostEntity, (post) => post.user)
//   posts: Relation<PostEntity[]>;

//   @OneToMany(() => FavouriteEntity, (fav) => fav.user)
//   favourites: Relation<FavouriteEntity[]>;

//   @OneToMany(() => AvatarEntity, (avatar) => avatar.user)
//   avatars: Relation<AvatarEntity[]>;

//   @OneToMany(() => AiTextEntity, (ai) => ai.user)
//   ai_text: Relation<AiTextEntity[]>;

//   @OneToMany(() => CreationEntity, (creation) => creation.user)
//   creations: Relation<CreationEntity[]>;

//   @OneToMany(() => ProductEntity, (product) => product.user)
//   products!: Relation<ProductEntity[]>;

//   @OneToMany(() => BidEntity, (bid) => bid.user)
//   bids!: Relation<BidEntity[]>;

//   @OneToMany(() => ReviewEntity, (review) => review.product)
//   reviews!: Relation<ReviewEntity[]>;

//   @OneToMany(() => MessageEntity, (msg) => msg.sender)
//   messages!: Relation<MessageEntity[]>;

//   //   @OneToMany(() => import('@/api/market-place/chat/entities/message.entity').MessageEntity, (msg) => msg.sender)
//   // messages!: Relation<import('@/api/market-place/chat/entities/message.entity').MessageEntity[]>;

//   @BeforeInsert()
//   @BeforeUpdate()
//   async hashPassword() {
//     if (this.password) {
//       this.password = await hashPass(this.password);
//     }
//   }
// }


import { type ReviewEntity } from '@/api/market-place/product/entities/review.entity';
import { type PostEntity } from '@/api/post/entities/post.entity';
import { type FavouriteEntity } from '@/api/favourite/entities/favourite.entity';
import { type AvatarEntity } from '@/api/avatar/entities/avatar.entity';
import { type AiTextEntity } from '@/api/ai/entities/ai.text.entity';
import { type CreationEntity } from '@/api/creation/entities/creation.entity';
import { type ProductEntity } from '@/api/market-place/product/entities/product.entity';
import { type BidEntity } from '@/api/market-place/bid/entities/bid.entity';
import { type MessageEntity } from '@/api/market-place/chat/entities/message.entity';
import { type SessionEntity } from './session.entity'; // Adjust path if needed
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { hashPassword as hashPass } from '@/utils/password.util';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('user')
export class UserEntity extends AbstractEntity {
  constructor(data?: Partial<UserEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_user_id' })
  id!: string;

  @Column({ length: 50, nullable: true })
  @Index('UQ_user_username', { where: '"deleted_at" IS NULL', unique: true })
  username!: string;

  @Column()
  @Index('UQ_user_email', { where: '"deleted_at" IS NULL', unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: '' })
  bio?: string;

  @Column({ default: '' })
  image?: string;

  @Column({ name: 'last_seen', type: 'timestamptz', nullable: true })
  lastSeen?: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt!: Date;

  @OneToMany(
    () => () => require('@/api/market-place/product/entities/review.entity').ReviewEntity,
    (review: ReviewEntity) => review.user,
  )
  reviews!: Relation<ReviewEntity[]>;

  @OneToMany(
    () => () => require('@/api/post/entities/post.entity').PostEntity,
    (post: PostEntity) => post.user,
  )
  posts!: Relation<PostEntity[]>;

  @OneToMany(
    () => () => require('@/api/favourite/entities/favourite.entity').FavouriteEntity,
    (fav: FavouriteEntity) => fav.user,
  )
  favourites!: Relation<FavouriteEntity[]>;

  @OneToMany(
    () => () => require('@/api/avatar/entities/avatar.entity').AvatarEntity,
    (avatar: AvatarEntity) => avatar.user,
  )
  avatars!: Relation<AvatarEntity[]>;

  @OneToMany(
    () => () => require('@/api/ai/entities/ai.text.entity').AiTextEntity,
    (ai: AiTextEntity) => ai.user,
  )
  ai_text!: Relation<AiTextEntity[]>;

  @OneToMany(
    () => () => require('@/api/creation/entities/creation.entity').CreationEntity,
    (creation: CreationEntity) => creation.user,
  )
  creations!: Relation<CreationEntity[]>;

  @OneToMany(
    () => () => require('@/api/market-place/product/entities/product.entity').ProductEntity,
    (product: ProductEntity) => product.user,
  )
  products!: Relation<ProductEntity[]>;

  @OneToMany(
    () => () => require('@/api/market-place/bid/entities/bid.entity').BidEntity,
    (bid: BidEntity) => bid.user,
  )
  bids!: Relation<BidEntity[]>;

  @OneToMany(
    () => () => require('@/api/market-place/chat/entities/message.entity').MessageEntity,
    (msg: MessageEntity) => msg.sender,
  )
  messages!: Relation<MessageEntity[]>;

  @OneToMany(
    () => () => require('./session.entity').SessionEntity,
    (session: SessionEntity) => session.user,
  )
  sessions?: Relation<SessionEntity[]>;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hashPass(this.password);
    }
  }
}