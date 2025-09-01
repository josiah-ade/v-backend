import {
  BooleanField,
  NumberField,
  StringField,
} from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MessageResDto {
  @StringField()
  @Expose()
  id: string;

    @StringField()
  @Expose()
  chatRoomId: string;

    @StringField()
  @Expose()
  senderId: string;

  @StringField()
  @Expose()
  type: string;

  @NumberField()
  @Expose()
  amount: number;

  @NumberField()
  @Expose()
  bidAmount: number;

  @StringField()
  @Expose()
  content: string;

  @StringField()
  @Expose()
  createdAt: string;

  @BooleanField()
  @Expose()
  isMine: boolean;

  @BooleanField()
  @Expose()
  isRead: boolean;

  @StringField()
  @Expose()
  image: string | null;
}
