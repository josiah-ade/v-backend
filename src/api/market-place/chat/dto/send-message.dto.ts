import { Uuid } from '@/common/types/common.type';
import { StringField, UUIDField } from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SendMessageDto {
  @UUIDField()
  @Expose()
  chatRoomId: Uuid;

  @StringField()
  @Expose()
  content: string;
}
