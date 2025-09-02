import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth } from '@/decorators/http.decorators';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatListResDto } from './dto/chat-list.res.dto';
import { ListMessagesReqDto } from './dto/list-messages.req.dto';
import { MessageResDto } from './dto/message-res.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('market/chat-rooms')
@Controller({
  path: 'market/chat-rooms',
  version: '1',
})
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/chats')
  @ApiAuth({
    type: ChatListResDto,
    summary: 'Get chat List',
  })
  async listChats(
    @Query() reqDto: ListMessagesReqDto,
    @CurrentUser('id') userId: Uuid,
  ): Promise<OffsetPaginatedDto<ChatListResDto>> {
    return this.chatService.listChats(userId, reqDto);
  }

  @Get(':id/messages')
  @ApiAuth({
    type: MessageResDto,
    summary: 'Get chat messages',
  })
  async listMessages(
    @Param('id') chatRoomId: Uuid,
    @Query() reqDto: ListMessagesReqDto,
    @CurrentUser('id') userId: Uuid,
  ): Promise<OffsetPaginatedDto<MessageResDto>> {
    return this.chatService.listMessages(chatRoomId, userId, reqDto);
  }

  // @Post(':id/messages')
  // @ApiAuth({
  //   type: MessageResDto,
  //   summary: 'Send message in chat',
  // })
  // async sendMessage(
  //   @Body() dto: SendMessageDto,
  //   @CurrentUser('id') senderId: Uuid,
  // ): Promise<MessageResDto> {
  //   return this.chatService.sendMessage(senderId, dto);
  // }
}
