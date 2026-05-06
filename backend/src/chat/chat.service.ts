import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messagesRepo: Repository<Message>,
  ) {}

  // ─── Get or create a 1-to-1 conversation ─────────────────────────────────

  async getOrCreateConversation(userAId: number, userBId: number): Promise<Conversation> {
    // Sort IDs so (A,B) and (B,A) always map to the same row
    const [lowId, highId] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];

    let conv = await this.conversationsRepo.findOne({
      where: { participantAId: lowId, participantBId: highId },
    });

    if (!conv) {
      conv = this.conversationsRepo.create({
        participantAId: lowId,
        participantBId: highId,
      });
      conv = await this.conversationsRepo.save(conv);
    }

    return this.conversationsRepo.findOne({
      where: { id: conv.id },
    });
  }

  // ─── Save a message ───────────────────────────────────────────────────────

  async saveMessage(conversationId: number, senderId: number, content: string): Promise<Message> {
    const msg = this.messagesRepo.create({ conversationId, senderId, content });
    const saved = await this.messagesRepo.save(msg);

    // Bump conversation updatedAt so it sorts correctly
    await this.conversationsRepo.update(conversationId, { updatedAt: new Date() });

    return this.messagesRepo.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });
  }

  // ─── Paginated messages for a conversation ────────────────────────────────

  async getMessages(conversationId: number, limit = 50, beforeId?: number): Promise<Message[]> {
    const query = this.messagesRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .where('msg.conversationId = :conversationId', { conversationId })
      .orderBy('msg.createdAt', 'DESC')
      .take(limit);

    if (beforeId) {
      query.andWhere('msg.id < :beforeId', { beforeId });
    }

    const msgs = await query.getMany();
    return msgs.reverse(); // oldest first
  }

  // ─── All conversations for a user ─────────────────────────────────────────

  async getConversationsForUser(userId: number) {
    const conversations = await this.conversationsRepo.find({
      where: [{ participantAId: userId }, { participantBId: userId }],
      order: { updatedAt: 'DESC' },
    });

    const result = [];
    for (const conv of conversations) {
      const lastMsg = await this.messagesRepo.findOne({
        where: { conversationId: conv.id },
        order: { createdAt: 'DESC' },
        relations: ['sender'],
      });

      const unreadCount = await this.messagesRepo.count({
        where: {
          conversationId: conv.id,
          readAt: IsNull(),
          senderId: Not(userId),
        },
      });

      const contact = conv.participantAId === userId ? conv.participantB : conv.participantA;

      result.push({
        id: conv.id,
        contact: this.formatContact(contact),
        lastMessage: lastMsg?.content ?? '',
        lastMessageAt: lastMsg?.createdAt ?? conv.createdAt,
        unread: unreadCount,
        updatedAt: conv.updatedAt,
      });
    }

    return result;
  }

  // ─── Mark messages as read ────────────────────────────────────────────────

  async markAsRead(conversationId: number, readerId: number): Promise<Date> {
    const readAt = new Date();
    await this.messagesRepo
      .createQueryBuilder()
      .update(Message)
      .set({ readAt })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :readerId', { readerId })
      .andWhere('readAt IS NULL')
      .execute();

    return readAt;
  }

  // ─── Format contact from User entity ─────────────────────────────────────

  formatContact(user: any) {
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      businessName: user.businessName ?? null,
      avatarUrl: user.avatarUrl ?? null,
    };
  }
}
