// import { UserEntity } from '@/api/user/entities/user.entity';
// import { AbstractEntity } from '@/database/entities/abstract.entity';
// import {
//   Column,
//   DeleteDateColumn,
//   Entity,
//   JoinColumn,
//   ManyToOne,
//   PrimaryGeneratedColumn,
// } from 'typeorm';
// import { ProductEntity } from './product.entity';

// @Entity('review')
// export class ReviewEntity extends AbstractEntity {
//   constructor(data?: Partial<ReviewEntity>) {
//     super();
//     Object.assign(this, data);
//   }

//   @PrimaryGeneratedColumn('uuid', {
//     primaryKeyConstraintName: 'PK_review_id',
//   })
//   id!: string;

//   @Column({ type: 'uuid', name: 'user_id' })
//   userId!: string;

//   @ManyToOne(() => () => require('@/api/user/entities/user.entity').UserEntity, (user: UserEntity) => user.reviews, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({
//     name: 'user_id',
//     referencedColumnName: 'id',
//     foreignKeyConstraintName: 'FK_review_user_id',
//   })
//   user!: UserEntity;

//   @Column({ type: 'uuid', name: 'product_id' })
//   productId!: string;

//   @ManyToOne(() => ProductEntity, (product) => product.reviews, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({
//     name: 'product_id',
//     referencedColumnName: 'id',
//     foreignKeyConstraintName: 'FK_review_product_id',
//   })
//   product!: ProductEntity;

//   @Column({ name: 'store_id', type: 'uuid' })
//   storeId!: string;

//   @Column({ type: 'int', width: 1 })
//   rating!: number;

//   @Column({ type: 'text' })
//   comment!: string;

//   @DeleteDateColumn({
//     name: 'deleted_at',
//     type: 'timestamptz',
//     default: null,
//   })
//   deletedAt!: Date | null;
// }

import { type UserEntity } from '@/api/user/entities/user.entity'; // ✅ type-only
import { type ProductEntity } from './product.entity';            // ✅ type-only
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Uuid } from '@/common/types/common.type';

@Entity('review')
export class ReviewEntity extends AbstractEntity {
  constructor(data?: Partial<ReviewEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_review_id',
  })
  id!: Uuid;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: Uuid;

  @ManyToOne(
    () => require('@/api/user/entities/user.entity').UserEntity, // ✅ runtime safe
    (user: UserEntity) => user.reviews,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_review_user_id',
  })
  user!: UserEntity;

  @Column({ type: 'uuid', name: 'product_id' })
  productId!: Uuid;

  @ManyToOne(
    () => require('./product.entity').ProductEntity, // ✅ runtime safe
    (product: ProductEntity) => product.reviews,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_review_product_id',
  })
  product!: ProductEntity; // ✅ only type usage here

  @Column({ name: 'store_id', type: 'uuid' })
  storeId!: Uuid;

  @Column({ type: 'int', width: 1 })
  rating!: number;

  @Column({ type: 'text' })
  comment!: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt!: Date | null;
}
