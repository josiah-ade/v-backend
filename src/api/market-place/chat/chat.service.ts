import { UserEntity } from '@/api/user/entities/user.entity';
import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import { ValidationException } from '@/exceptions/validation.exception';
import { paginateJoin } from '@/utils/offset-pagination';
import {
  transformDto,
  transformSingleDto,
} from '@/utils/transformers/transform-dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { BidEntity } from '../bid/entities/bid.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { ChatListResDto } from './dto/chat-list.res.dto';
import { ListMessagesReqDto } from './dto/list-messages.req.dto';
import { MessageResDto } from './dto/message-res.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatRoomEntity } from './entities/chat.entity';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoomEntity)
    private readonly chatRoomRepo: Repository<ChatRoomEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
   
  ) {}

  async ensureParticipant(chatRoomId: Uuid, userId: Uuid) {
    const room = await this.chatRoomRepo.findOne({
      where: { id: chatRoomId },
      relations: ['product.user', 'bids', 'bids.user'],
    });

    if (!room) throw new NotFoundException('Chat room not found');

    const ownerId = room.product.userId;
    const bidderId = room.bids[0]?.userId;

    if (![ownerId, bidderId].includes(userId)) {
      throw new ForbiddenException('Not a participant');
    }

    return room;
  }

  async getParticipants(chatRoomId: Uuid) {
    const chatRoom = await this.chatRoomRepo.findOne({
      where: { id: chatRoomId },
      relations: ['owner', 'bidder'],
    });

    if (!chatRoom) {
      throw new Error(`ChatRoom ${chatRoomId} not found`);
    }

    return [chatRoom.owner, chatRoom.bidder];
  }

  async listChats(
    userId: Uuid,
    reqDto: ListMessagesReqDto,
  ): Promise<OffsetPaginatedDto<ChatListResDto>> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    const query = this.chatRoomRepo
      .createQueryBuilder('chat_room')
      .leftJoin(
        (qb) =>
          qb
            .subQuery()
            .select('b.id', 'id')
            .addSelect('b.chat_room_id', 'chatRoomId')
            .addSelect('b.amount', 'amount')
            .addSelect('b.product_id', 'productId')
            .from(BidEntity, 'b')
            .distinctOn(['b.chat_room_id'])
            .orderBy('b.chat_room_id')
            .addOrderBy('b.created_at', 'DESC'),
        'bid',
        'bid."chatRoomId" = chat_room.id',
      )
      .leftJoin(ProductEntity, 'product', 'product.id = bid."productId"')
      .leftJoin('chat_room.owner', 'owner')
      .leftJoin('chat_room.bidder', 'bidder')
      .leftJoin('chat_room.lastMessage', 'lastMessage')
      .select([
        'chat_room.id AS "chatRoomId"',
        'bid.id AS "bidId"',
        'bid.amount AS "amount"',
        'product.id AS "productId"',
        'product.title AS "productName"',
        'owner.id AS "ownerId"',
        'owner.username AS "ownerUsername"',
        'owner.lastSeen AS "ownerLastSeen"',
        'bidder.id AS "bidderId"',
        'bidder.username AS "bidderUsername"',
        'bidder.lastSeen AS "bidderLastSeen"',
        'lastMessage.content AS "lastMessage"',
        'lastMessage.createdAt AS "lastMessageCreatedAt"',
      ])
      .where('chat_room.owner_id = :userId OR chat_room.bidder_id = :userId', {
        userId,
      })
      .orderBy('lastMessage.createdAt', 'DESC', 'NULLS LAST');

    const [items, metaDto] = await paginateJoin(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });

    return new OffsetPaginatedDto(transformDto(ChatListResDto, items), metaDto);
  }

  async listMessages(
    chatRoomId: Uuid,
    userId: Uuid,
    reqDto: ListMessagesReqDto,
  ): Promise<OffsetPaginatedDto<MessageResDto>> {
    if (!userId) throw new ValidationException(ErrorCode.E002);
    const room = await this.ensureParticipant(chatRoomId, userId);

    const query = this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.chatRoomId = :chatRoomId', { chatRoomId })
      .orderBy('message.createdAt', 'ASC');

    const [items, metaDto] = await paginateJoin<MessageEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });

    const enriched = items.map((msg: any) => ({
      id: msg.message_id,
      type: msg.message_type,
      content: msg.message_content,
      createdAt: msg.message_created_at,
      isRead: msg.message_is_read,
      image: msg.message_image_url,
      isMine: msg.sender_id === userId,
      sender: msg.sender_id,
      ...(msg.message_type === 'BID' && {
        amount: room.product.price,
        bidAmount: msg.message_bidAmount,
      }),
    }));

    return new OffsetPaginatedDto(
      transformDto(MessageResDto, enriched),
      metaDto,
    );
  }

  // async sendMessage(
  //   senderId: Uuid,
  //   dto: SendMessageDto,
  // ): Promise<{ message: MessageResDto; recipients: UserEntity[] }> {
  //   await this.ensureParticipant(dto.chatRoomId, senderId);

  //   if (!senderId) {
  //     throw new Error('Sender ID is required');
  //   }

  //   const message = this.messageRepo.create({
  //     chatRoomId: dto.chatRoomId,
  //     senderId,
  //     content: dto.content,
  //     isRead: false,
  //     createdBy: SYSTEM_USER_ID,
  //     updatedBy: SYSTEM_USER_ID,
  //   });

  //   const saved = await this.messageRepo.save(message);

  //   const participants = await this.getParticipants(dto.chatRoomId);
  //   const recipients = participants.filter((p) => p.id !== senderId);

  //   await this.chatRoomRepo.update(dto.chatRoomId, {
  //     lastMessage: message,
  //   });

  //   const savedAddition = {
  //     ...saved,
  //     isMine: saved.senderId === senderId,
  //   };

  //   return {
  //     message: transformSingleDto(MessageResDto, savedAddition),
  //     recipients,
  //   };
  // }

  async sendMessage(
    senderId: Uuid,
    dto: SendMessageDto,
  ): Promise<{ message: MessageResDto; recipients: UserEntity[] }> {
    await this.ensureParticipant(dto.chatRoomId, senderId);

    if (!senderId) {
      throw new Error('Sender ID is required');
    }

    const message = this.messageRepo.create({
      chatRoomId: dto.chatRoomId,
      senderId,
      content: dto.content,
      isRead: false,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });

    const saved = await this.messageRepo.save(message);

    const participants = await this.getParticipants(dto.chatRoomId);
    const recipients = participants.filter((p) => p.id !== senderId);

    await this.chatRoomRepo.update(dto.chatRoomId, { lastMessage: saved });

    const messageDto = transformSingleDto(MessageResDto, {
      ...saved,
      isMine: saved.senderId === senderId,
    });

    return { message: messageDto, recipients };
  }

  async markMessageAsRead(messageId: Uuid): Promise<MessageEntity> {
    await this.messageRepo.update(messageId, { isRead: true });
    return this.messageRepo.findOne({ where: { id: messageId } });
  }

  async markRead(chatRoomId: Uuid, userId: Uuid) {
    await this.messageRepo.update(
      { chatRoomId, senderId: Not(userId) },
      { isRead: true },
    );
  }

  async updateLastSeen(userId: Uuid) {
    await this.userRepo.update(userId, { lastSeen: new Date() });
  }
}
