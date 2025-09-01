import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.contoller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatRoomEntity } from './entities/chat.entity';
import { MessageEntity } from './entities/message.entity';
import { UserEntity } from '@/api/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoomEntity, MessageEntity, UserEntity])],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
