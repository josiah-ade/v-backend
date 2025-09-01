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

import { type UserEntity } from '@/api/user/entities/user.entity'; // ✅ type-only import (no runtime dependency)
import { Uuid } from '@/common/types/common.type';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
    () => require('@/api/user/entities/user.entity').UserEntity,
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
    () =>
      require('@/api/market-place/product/entities/product.entity')
        .ProductEntity,
    (product: any) => product.reviews,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_review_product_id',
  })
  product!: import('./product.entity').ProductEntity;

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
