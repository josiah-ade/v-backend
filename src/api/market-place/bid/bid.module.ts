import { UserEntity } from '@/api/user/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from '../chat/chat.module';
import { ChatRoomEntity } from '../chat/entities/chat.entity';
import { MessageEntity } from '../chat/entities/message.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { BidEntity } from './entities/bid.entity';
 
@Module({
  imports: [
    TypeOrmModule.forFeature([
      BidEntity,
      ProductEntity,
      ChatRoomEntity,
      UserEntity,
      MessageEntity,
    ]),
    ChatModule,
  ],
  controllers: [BidController],
  providers: [BidService],
  exports: [BidService],
})
export class BidModule {}
