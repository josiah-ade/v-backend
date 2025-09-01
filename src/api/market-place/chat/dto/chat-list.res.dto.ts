import { NumberField, StringField } from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ChatListResDto {
  @Expose()
  chatRoomId: string;

  @Expose()
  bidId: string;

  @Expose()
  amount: number;

  @Expose()
  productId: string;

  @Expose()
  productName: string;

  @Expose()
  ownerLastSeen:string;

  @Expose()
  ownerId: string;

  @Expose()
  ownerUsername: string;

@Expose()
  bidderLastSeen:string;

  @Expose()
  bidderId: string;

  @Expose()
  bidderUsername: string;

  @Expose()
  lastMessage?: string | null;

  @Expose()
  lastMessageCreatedAt?: Date | null;
}
