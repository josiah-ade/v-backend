import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common/types/common.type';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { ChatRoomEntity } from './chat.entity';

export enum MessageType {
  TEXT = 'TEXT',
  BID = 'BID',
}

@Entity('message')
export class MessageEntity extends AbstractEntity {
  constructor(data?: Partial<MessageEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_message_id',
  })
  id!: Uuid;

  @Column({ name: 'chat_room_id', type: 'uuid' })
  chatRoomId!: Uuid;

  @ManyToOne(() => ChatRoomEntity, (room) => room.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'chat_room_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_message_chat_room_id',
  })
  chatRoom!: Relation<ChatRoomEntity>;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId!: Uuid;

  @ManyToOne(() => UserEntity, (user) => user.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'sender_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_message_sender_id',
  })
  sender!: Relation<UserEntity>;

  @Column('text')
  content!: string;

  @Column({ name: 'is_read', default: false })
  isRead!: boolean;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  image?: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ type: 'decimal', nullable: true })
  bidAmount?: number;
}
