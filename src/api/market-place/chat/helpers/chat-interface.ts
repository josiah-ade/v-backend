export interface ChatListRaw {
  chatRoomId: string;
  bidId: string;
  amount: string;
  productId: string;
  productName: string;
  ownerId: string;
  ownerUsername: string;
  ownerLastSeen: Date;
  bidderId: string;
  bidderUsername: string;
  bidderLastSeen: Date;
  lastMessage: string | null;
  lastMessageCreatedAt: Date | null;
  unreadCount: string; 

}