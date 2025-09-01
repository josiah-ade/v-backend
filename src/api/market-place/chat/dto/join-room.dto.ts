import { Uuid } from '@/common/types/common.type';
import { UUIDField } from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class JoinRoomDto {
  @UUIDField()
  @Expose()
  chatRoomId: Uuid;

  @UUIDField()
  @Expose()
  userId: Uuid;
}
