import { Uuid } from '@/common/types/common.type';
import { getCorsOrigin } from '@/config/app.config';
import { AllConfigType } from '@/config/config.type';
import { WsExceptionFilter } from '@/filters/websocket-exception.filter';
import {
  Inject,
  Injectable,
  Logger,
  UseFilters,
  UsePipes,
  ValidationPipe,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: getCorsOrigin(),
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket'],
  allowEIO3: true,
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  private activeUsers = new Map<string, Uuid>();

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  afterInit(server: Server) {
    const origins = this.configService.getOrThrow('app.corsOrigin', {
      infer: true,
    });
    this.logger.log('WebSocket Gateway initialized with origins:', origins);
  }

  // New connections
  async handleConnection(client: Socket) {
    try {
      this.logger.log(
        `Client connected: ${client.id} from ${client.handshake.address}`,
      );
      this.logger.log('Client origin:', client.handshake.headers.origin);
      this.logger.log(
        `Total connected clients: ${this.server.engine.clientsCount}`,
      );
    } catch (error) {
      this.logger.error('Error handling connection:', error);
    }
  }

  // Disconnections
  async handleDisconnect(client: Socket) {
    try {
      const userId = this.activeUsers.get(client.id);
      if (userId) {
        await this.chatService.updateLastSeen(userId);
        this.logger.log(`User ${userId} disconnected`);
        this.activeUsers.delete(client.id);
        this.server.emit('user:offline', {
          userId,
          lastSeen: new Date().toISOString(),
        });
      } else {
        this.logger.log(`Client disconnected: ${client.id}`);
      }
    } catch (error) {
      this.logger.error('Error handling disconnect:', error);
    }
  }

  // @SubscribeMessage('user:join')
  // async onUserJoin(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() userId: Uuid,
  // ) {
  //   try {
  //     if (!userId) {
  //       throw new WsException('User ID is required');
  //     }

  //     socket.data.userId = userId;
  //     await socket.join(userId);

  //     // keep track of active users
  //     this.activeUsers.set(socket.id, userId);

  //     this.server.emit('user:online', { userId });

  //     this.logger.log(`User ${userId} joined with socket ${socket.id}`);
  //   } catch (error) {
  //     this.logger.error('Error in user join:', error);
  //     throw new WsException('Failed to join user session');
  //   }
  // }

  @SubscribeMessage('user:join')
  async onUserJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userId: Uuid,
  ) {
    if (!userId) throw new WsException('User ID is required');

    socket.data.userId = userId;
    await socket.join(userId);

    // Track active users
    this.activeUsers.set(socket.id, userId);

    socket.broadcast.emit('user:online', { userId });

    const currentlyOnline = Array.from(this.activeUsers.values()).filter(
      (id) => id !== userId,
    );
    socket.emit('user:online:existing', currentlyOnline);

    this.logger.log(`User ${userId} joined with socket ${socket.id}`);
  }

  @SubscribeMessage('chat:activeRoom')
  async onActiveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() chatRoomId: Uuid,
  ) {
    socket.data.activeRoomId = chatRoomId;
    const userId = socket.data.userId;

    await this.chatService.markRead(chatRoomId, socket.data.userId);

    socket.to(chatRoomId).emit('chat:roomSeen', {
      chatRoomId,
      userId,
    });

    socket.emit('chat:roomSeen', {
      chatRoomId,
      userId,
    });

    this.logger.log(`User ${socket.data.userId} active in room ${chatRoomId}`);
  }

  @SubscribeMessage('chat:join')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async onChatJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: JoinRoomDto,
  ) {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        throw new WsException(
          'User not authenticated. Please join user session first.',
        );
      }

      if (!dto.chatRoomId) {
        throw new WsException('Chat room ID is required');
      }

      await this.chatService.ensureParticipant(dto.chatRoomId, userId);
      await socket.join(dto.chatRoomId);
      await this.chatService.markRead(dto.chatRoomId, userId);

      this.logger.log(`User ${userId} joined chat room ${dto.chatRoomId}`);
    } catch (error) {
      this.logger.error('Error joining chat:', error);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException('Failed to join chat room');
    }
  }

  @SubscribeMessage('chat:send')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async onChatSend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    try {
      const userId = socket.data.userId;

      if (!userId) {
        this.logger.warn(
          `No userId found in socket data for socket ${socket.id}`,
        );
        throw new WsException(
          'User not authenticated. Please join user session first.',
        );
      }

      if (!dto.chatRoomId) {
        throw new WsException('Chat room ID is required');
      }

      if (!dto.content || dto.content.trim().length === 0) {
        throw new WsException('Message content cannot be empty');
      }

      // Check if user is in the chat room
      const rooms = Array.from(socket.rooms);
      this.logger.log(`Socket ${socket.id} is in rooms:`, rooms);

      if (!rooms.includes(dto.chatRoomId)) {
        this.logger.warn(
          `User ${userId} not in chat room ${dto.chatRoomId}. Rooms: ${rooms}`,
        );
        // Auto-join the room if not already in it
        await this.chatService.ensureParticipant(dto.chatRoomId, userId);
        await socket.join(dto.chatRoomId);
        this.logger.log(`Auto-joined user ${userId} to room ${dto.chatRoomId}`);
      }

      const { message, recipients } = await this.chatService.sendMessage(
        userId,
        dto,
      );

      for (const recipient of recipients) {
        const isActive = this.isUserInRoom(dto.chatRoomId, recipient.id);
        if (isActive) {
          // If recipient is active, mark as read
          await this.chatService.markMessageAsRead(message.id as Uuid);
          message.isRead = true;
        }
      }

      const { isMine, ...rest } = message;
      socket.to(dto.chatRoomId).emit('chat:new', rest);
      socket.emit('chat:new', message);

      // Send acknowledgment back to sender
      socket.emit('chat:sent', { messageId: message.id, success: true });

      if (message.isRead) {
        socket.emit('chat:seen', {
          messageId: message.id,
          chatRoomId: dto.chatRoomId,
        });
      }
    } catch (error) {
      this.logger.error('Error sending message:', error);
      this.logger.error('Error stack:', error.stack);

      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException(`Failed to send message: ${error.message}`);
    }
  }

  @SubscribeMessage('chat:typing')
  async onTyping(
    @ConnectedSocket() socket: Socket,
    @MessageBody() chatRoomId: string,
  ) {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        throw new WsException('User not authenticated');
      }

      if (!chatRoomId) {
        throw new WsException('Chat room ID is required');
      }

      socket.to(chatRoomId).emit('chat:typing', { userId, chatRoomId });
    } catch (error) {
      this.logger.error('Error in typing event:', error);
      throw new WsException('Failed to process typing event');
    }
  }

  @SubscribeMessage('chat:stopTyping')
  async onStopTyping(
    @ConnectedSocket() socket: Socket,
    @MessageBody() chatRoomId: string,
  ) {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        throw new WsException('User not authenticated');
      }

      if (!chatRoomId) {
        throw new WsException('Chat room ID is required');
      }

      socket.to(chatRoomId).emit('chat:stopTyping', { userId, chatRoomId });
    } catch (error) {
      this.logger.error('Error in stop typing event:', error);
      throw new WsException('Failed to process stop typing event');
    }
  }

  async notifyUser(userId: Uuid, event: string, payload: any): Promise<void> {
    try {
      this.server.to(userId).emit(event, payload);
    } catch (error) {
      this.logger.error(`Error notifying user ${userId}:`, error);
      throw error;
    }
  }

  isUserInRoom(chatRoomId: string, userId: string): boolean {
    const room = this.server.sockets.adapter.rooms.get(chatRoomId);
    if (!room) return false;

    for (const socketId of room) {
      const socket = this.server.sockets.sockets.get(socketId);

      if (
        socket?.data?.userId === userId &&
        socket.data.activeRoomId === chatRoomId
      ) {
        return true;
      }
    }
    return false;
  }
}
