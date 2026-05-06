import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // userId -> Set of socketIds (supports multiple tabs)
  private onlineUsers = new Map<number, Set<string>>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  // ─── Connection lifecycle ────────────────────────────────────────────────

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth as any)?.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) throw new Error('No token');

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;

      // Track online
      if (!this.onlineUsers.has(payload.sub)) {
        this.onlineUsers.set(payload.sub, new Set());
      }
      this.onlineUsers.get(payload.sub).add(client.id);

      // Join all existing conversation rooms
      const conversations = await this.chatService.getConversationsForUser(payload.sub);
      for (const conv of conversations) {
        client.join(`conv_${conv.id}`);
      }

      // Tell everyone this user is now online
      this.server.emit('user_online', { userId: payload.sub });

      // Send the caller the list of currently online users
      const onlineList = Array.from(this.onlineUsers.keys());
      client.emit('online_users', onlineList);

    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as number;
    if (!userId) return;

    const sockets = this.onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.onlineUsers.delete(userId);
        this.server.emit('user_offline', { userId });
      }
    }
  }

  // ─── Load conversation list ───────────────────────────────────────────────

  @SubscribeMessage('get_conversations')
  async handleGetConversations(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId as number;
    const conversations = await this.chatService.getConversationsForUser(userId);
    client.emit('conversations_list', conversations);
  }

  // ─── Open / create a conversation ─────────────────────────────────────────

  @SubscribeMessage('open_conversation')
  async handleOpenConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: number },
  ) {
    const userId = client.data.userId as number;
    const recipientId = Number(data.recipientId);

    if (userId === recipientId) return;

    const conv = await this.chatService.getOrCreateConversation(userId, recipientId);
    const messages = await this.chatService.getMessages(conv.id, 50);

    // Join sender to room
    client.join(`conv_${conv.id}`);

    // If recipient is online, make them join too
    const recipientSockets = this.onlineUsers.get(recipientId);
    if (recipientSockets) {
      for (const sid of recipientSockets) {
        const recipientSocket = this.server.sockets.sockets.get(sid);
        if (recipientSocket) recipientSocket.join(`conv_${conv.id}`);
      }
    }

    const conversations = await this.chatService.getConversationsForUser(userId);
    const convSummary = conversations.find((c) => c.id === conv.id);

    client.emit('conversation_opened', {
      conversation: convSummary,
      messages,
    });
  }

  // ─── Load more messages (pagination) ──────────────────────────────────────

  @SubscribeMessage('load_more_messages')
  async handleLoadMore(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; beforeId: number },
  ) {
    const messages = await this.chatService.getMessages(data.conversationId, 30, data.beforeId);
    client.emit('more_messages', { conversationId: data.conversationId, messages });
  }

  // ─── Load messages for an existing conversation by ID ─────────────────────

  @SubscribeMessage('load_conversation')
  async handleLoadConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    // Make sure the socket is in the room
    client.join(`conv_${data.conversationId}`);
    const messages = await this.chatService.getMessages(data.conversationId, 50);
    client.emit('conversation_messages', {
      conversationId: data.conversationId,
      messages,
    });
  }

  // ─── Send message ─────────────────────────────────────────────────────────

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; content: string },
  ) {
    const userId = client.data.userId as number;
    if (!data.content?.trim()) return;

    // Stop typing on send
    client.to(`conv_${data.conversationId}`).emit('user_stop_typing', {
      conversationId: data.conversationId,
      userId,
    });

    const message = await this.chatService.saveMessage(
      data.conversationId,
      userId,
      data.content.trim(),
    );

    this.server.to(`conv_${data.conversationId}`).emit('new_message', {
      conversationId: data.conversationId,
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        conversationId: message.conversationId,
        readAt: message.readAt,
        createdAt: message.createdAt,
        sender: message.sender
          ? { id: message.sender.id, firstName: message.sender.firstName }
          : null,
      },
    });
  }

  // ─── Typing indicators ────────────────────────────────────────────────────

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    client.to(`conv_${data.conversationId}`).emit('user_typing', {
      conversationId: data.conversationId,
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    client.to(`conv_${data.conversationId}`).emit('user_stop_typing', {
      conversationId: data.conversationId,
      userId: client.data.userId,
    });
  }

  // ─── Mark as read ─────────────────────────────────────────────────────────

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    const userId = client.data.userId as number;
    const readAt = await this.chatService.markAsRead(data.conversationId, userId);

    // Notify sender their messages were read
    this.server.to(`conv_${data.conversationId}`).emit('messages_read', {
      conversationId: data.conversationId,
      readAt,
    });
  }
}
