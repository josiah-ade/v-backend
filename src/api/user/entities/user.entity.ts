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

import { Uuid } from '@/common/types/common.type';
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

// Import related entities normally
import { AiTextEntity } from '@/api/ai/entities/ai.text.entity';
import { AvatarEntity } from '@/api/avatar/entities/avatar.entity';
import { CreationEntity } from '@/api/creation/entities/creation.entity';
import { FavouriteEntity } from '@/api/favourite/entities/favourite.entity';
import { BidEntity } from '@/api/market-place/bid/entities/bid.entity';
import { MessageEntity } from '@/api/market-place/chat/entities/message.entity';
import { ProductEntity } from '@/api/market-place/product/entities/product.entity';
import { ReviewEntity } from '@/api/market-place/product/entities/review.entity';
import { PostEntity } from '@/api/post/entities/post.entity';
import { SessionEntity } from './session.entity';

@Entity('user')
export class UserEntity extends AbstractEntity {
  constructor(data?: Partial<UserEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_user_id' })
  id!: Uuid;

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

  // --- Relations ---
  @OneToMany(() => ReviewEntity, (review) => review.user)
  reviews!: Relation<ReviewEntity[]>;

  @OneToMany(() => PostEntity, (post) => post.user)
  posts!: Relation<PostEntity[]>;

  @OneToMany(() => FavouriteEntity, (fav) => fav.user)
  favourites!: Relation<FavouriteEntity[]>;

  @OneToMany(() => AvatarEntity, (avatar) => avatar.user)
  avatars!: Relation<AvatarEntity[]>;

  @OneToMany(() => AiTextEntity, (ai) => ai.user)
  ai_text!: Relation<AiTextEntity[]>;

  @OneToMany(() => CreationEntity, (creation) => creation.user)
  creations!: Relation<CreationEntity[]>;

  @OneToMany(() => ProductEntity, (product) => product.user)
  products!: Relation<ProductEntity[]>;

  @OneToMany(() => BidEntity, (bid) => bid.user)
  bids!: Relation<BidEntity[]>;

  @OneToMany(() => MessageEntity, (msg) => msg.sender)
  messages!: Relation<MessageEntity[]>;

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions?: Relation<SessionEntity[]>;

  // --- Hooks ---
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hashPass(this.password);
    }
  }
}
