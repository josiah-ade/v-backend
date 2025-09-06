import { UserEntity } from '@/api/user/entities/user.entity';
import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import { ValidationException } from '@/exceptions/validation.exception';
import { formatNaira } from '@/utils/currency';
import { paginateJoin } from '@/utils/offset-pagination';
import {
  transformDto,
  transformSingleDto,
} from '@/utils/transformers/transform-dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from '../chat/chat.service';
import { ChatRoomEntity } from '../chat/entities/chat.entity';
import { MessageEntity, MessageType } from '../chat/entities/message.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { CreateBidDto } from './dto/create-bid.dto';
import { CreateBidResDto } from './dto/create-bid.res.dto';
import { GetBidsResDto } from './dto/get-bids.res.dto';
import { ListBidsReqDto } from './dto/list-bid.req.dto';
import { BidEntity } from './entities/bid.entity';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(BidEntity)
    private readonly bidRepo: Repository<BidEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,

    @InjectRepository(ChatRoomEntity)
    private readonly chatRepo: Repository<ChatRoomEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,

    private readonly chatService: ChatService,

    private readonly chatGateway: ChatGateway,
  ) {}

  async createBid(userId: Uuid, dto: CreateBidDto): Promise<CreateBidResDto> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new ValidationException(ErrorCode.E002);

    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
      relations: ['user'],
    });
    if (!product) throw new ValidationException(ErrorCode.I002);

    // Making sure user who posted the product cannot bid on it
    if (product.userId === userId)
      throw new ValidationException(ErrorCode.BI002);

    // Check if bid exist
    const existingBid = await this.bidRepo.findOne({
      where: {
        user: { id: userId },
        product: { id: dto.productId },
        amount: dto.amount,
      },
    });

    if (existingBid) {
      throw new ValidationException(ErrorCode.BI001);
    }

    // Create bid
    const bid = this.bidRepo.create({
      user,
      product,
      amount: dto.amount,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });
    await this.bidRepo.save(bid);

    // Ensure chat room exists
    let chatRoom = await this.chatRepo.findOne({
      where: {
        product: { id: product.id },
        owner: { id: product.user.id },
        bidder: { id: user.id },
      },
    });
    if (!chatRoom) {
      chatRoom = this.chatRepo.create({
        product,
        owner: product.user,
        bidder: user,
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      });
      await this.chatRepo.save(chatRoom);
    }

    bid.chatRoom = chatRoom;
    await this.bidRepo.save(bid);

    // Create initial message
    const message = this.messageRepo.create({
      chatRoom,
      sender: user,
      type: MessageType.BID,
      bidAmount: dto.amount,
      content:
        dto.message || `Hey, can I get this for ${formatNaira(dto.amount)}?`,
      image: product.image,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });
    await this.messageRepo.save(message);

    chatRoom.lastMessage = message;
    await this.chatRepo.save(chatRoom);

    // Notify product owner
    const chatListItem = await this.chatService.getChatListItem(
      chatRoom.id,
      product.user.id,
    );

    await this.chatGateway.notifyUser(
      product.user.id,
      'chat-list:new',
      chatListItem,
    );

    await this.chatGateway.notifyUser(product.user.id, 'bid:new', {
      productId: product.id,
      bidAmount: Number(dto.amount),
      bidder: user.username,
      chatRoomId: chatRoom.id,
    });

    const response = {
      bidId: bid.id,
      chatRoomId: chatRoom.id,
      amount: bid.amount,
      productId: product.id,
    };

    return transformSingleDto(CreateBidResDto, response);
  }

  async getBidsForProduct(
    userId: Uuid,
    productId: Uuid,
    reqDto: ListBidsReqDto,
  ): Promise<OffsetPaginatedDto<GetBidsResDto>> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new ValidationException(ErrorCode.I002);

    const query = this.bidRepo
      .createQueryBuilder('bid')
      .leftJoin('bid.user', 'user')
      .addSelect(['user.id', 'user.username'])
      .where('bid.productId = :productId', { productId })
      .orderBy('bid.createdAt', 'DESC');

    const [items, metaDto] = await paginateJoin<BidEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });

    return new OffsetPaginatedDto(transformDto(GetBidsResDto, items), metaDto);
  }
}
