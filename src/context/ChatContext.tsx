'use client';

import React, {
  createContext, useContext, useState, useCallback,
  useEffect, useRef, ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { TokenStorage } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChatMessage = {
  id: number;
  content: string;
  senderId: number;
  conversationId: number;
  readAt: string | null;
  createdAt: string;
};

export type ConversationContact = {
  id: number;
  name: string;
  businessName: string | null;
  avatarUrl: string | null;
};

export type Conversation = {
  id: number;
  contact: ConversationContact;
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  updatedAt: string;
};

interface ChatContextType {
  conversations: Conversation[];
  activeFloatingChatId: number | null;
  isFloatingVisible: boolean;
  typingConvIds: Set<number>;
  onlineUserIds: Set<number>;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  openChat: (recipientUserId: number | string) => void;
  closeChat: () => void;
  minimizarChat: () => void;
  sendMessage: (conversationId: number, content: string) => void;
  markAsRead: (conversationId: number) => void;
  loadMoreMessages: (conversationId: number, beforeId: number) => void;
  loadConversation: (conversationId: number) => void;
  emitTypingStart: (conversationId: number) => void;
  emitTypingStop: (conversationId: number) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');

export function ChatProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeFloatingChatId, setActiveFloatingChatId] = useState<number | null>(null);
  const [isFloatingVisible, setIsFloatingVisible] = useState(false);
  const [typingConvIds, setTypingConvIds] = useState<Set<number>>(new Set());
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Pending open request while socket is still connecting
  const pendingOpenRef = useRef<number | null>(null);

  // ─── Socket lifecycle ───────────────────────────────────────────────────

  useEffect(() => {
    if (!currentUser) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnectionStatus('disconnected');
      setConversations([]);
      setOnlineUserIds(new Set());
      return;
    }

    const token = TokenStorage.getAccess();
    if (!token) return;

    const socket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;
    setConnectionStatus('connecting');

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('get_conversations');
      // Dispatch any pending open request
      if (pendingOpenRef.current !== null) {
        socket.emit('open_conversation', { recipientId: pendingOpenRef.current });
        pendingOpenRef.current = null;
      }
    });

    socket.on('disconnect', () => setConnectionStatus('disconnected'));

    // ── Conversations list ──────────────────────────────────────────────
    socket.on('conversations_list', (data: Omit<Conversation, 'messages'>[]) => {
      setConversations(prev => {
        // Merge: keep existing messages, update metadata
        return data.map(incoming => {
          const existing = prev.find(c => c.id === incoming.id);
          return { ...incoming, messages: existing?.messages ?? [] };
        });
      });
    });

    // ── Conversation opened (deep-link / first open) ───────────────────
    socket.on('conversation_opened', ({ conversation, messages }: {
      conversation: Omit<Conversation, 'messages'>;
      messages: ChatMessage[];
    }) => {
      setConversations(prev => {
        const exists = prev.find(c => c.id === conversation.id);
        if (exists) {
          return prev.map(c => c.id === conversation.id ? { ...c, ...conversation, messages } : c);
        }
        return [{ ...conversation, messages }, ...prev];
      });
      setActiveFloatingChatId(conversation.id);
      setIsFloatingVisible(true);
    });

    // ── New incoming message ────────────────────────────────────────────
    socket.on('new_message', ({ conversationId, message }: { conversationId: number; message: ChatMessage }) => {
      setConversations(prev => {
        const updated = prev.map(c => {
          if (c.id !== conversationId) return c;
          const isActive = c.id === activeFloatingChatId;
          return {
            ...c,
            messages: [...c.messages, message],
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            unread: isActive ? 0 : c.unread + 1,
          };
        });
        // Move updated conv to top
        const conv = updated.find(c => c.id === conversationId);
        if (!conv) return prev;
        return [conv, ...updated.filter(c => c.id !== conversationId)];
      });
    });

    // ── Read receipts ──────────────────────────────────────────────────
    socket.on('messages_read', ({ conversationId, readAt }: { conversationId: number; readAt: string }) => {
      setConversations(prev => prev.map(c => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: c.messages.map(m => ({ ...m, readAt: m.readAt ?? readAt })),
        };
      }));
    });

    // ── Load messages for a conversation by ID (used by messages page) ───
    socket.on('conversation_messages', ({ conversationId, messages }: { conversationId: number; messages: ChatMessage[] }) => {
      setConversations(prev => prev.map(c =>
        c.id === conversationId ? { ...c, messages } : c,
      ));
    });

    // ── Paginated history ──────────────────────────────────────────────
    socket.on('more_messages', ({ conversationId, messages }: { conversationId: number; messages: ChatMessage[] }) => {
      setConversations(prev => prev.map(c => {
        if (c.id !== conversationId) return c;
        return { ...c, messages: [...messages, ...c.messages] };
      }));
    });

    // ── Typing indicators ──────────────────────────────────────────────
    socket.on('user_typing', ({ conversationId }: { conversationId: number }) => {
      setTypingConvIds(prev => new Set([...prev, conversationId]));
    });
    socket.on('user_stop_typing', ({ conversationId }: { conversationId: number }) => {
      setTypingConvIds(prev => { const s = new Set(prev); s.delete(conversationId); return s; });
    });

    // ── Online / Offline ───────────────────────────────────────────────
    socket.on('online_users', (userIds: number[]) => setOnlineUserIds(new Set(userIds)));
    socket.on('user_online', ({ userId }: { userId: number }) => {
      setOnlineUserIds(prev => new Set([...prev, userId]));
    });
    socket.on('user_offline', ({ userId }: { userId: number }) => {
      setOnlineUserIds(prev => { const s = new Set(prev); s.delete(userId); return s; });
    });

    return () => { socket.disconnect(); };
  }, [currentUser]);

  // ─── Actions ────────────────────────────────────────────────────────────

  const openChat = useCallback((recipientUserId: number | string) => {
    const recipientId = Number(recipientUserId);
    const socket = socketRef.current;

    if (!socket || !socket.connected) {
      // Queue it for when socket connects
      pendingOpenRef.current = recipientId;
      return;
    }

    // Check if conversation already exists locally
    const existing = conversations.find(
      c => c.contact.id === recipientId,
    );

    if (existing) {
      setActiveFloatingChatId(existing.id);
      setIsFloatingVisible(true);
      // Load messages if empty
      if (existing.messages.length === 0) {
        socket.emit('open_conversation', { recipientId });
      }
      return;
    }

    socket.emit('open_conversation', { recipientId });
  }, [conversations]);

  const closeChat = useCallback(() => {
    setActiveFloatingChatId(null);
    setIsFloatingVisible(false);
  }, []);

  const minimizarChat = useCallback(() => {
    setIsFloatingVisible(false);
  }, []);

  const sendMessage = useCallback((conversationId: number, content: string) => {
    if (!content.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', { conversationId, content });
  }, []);

  const markAsRead = useCallback((conversationId: number) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, unread: 0 } : c,
    ));
    socketRef.current?.emit('mark_read', { conversationId });
  }, []);

  const loadConversation = useCallback((conversationId: number) => {
    socketRef.current?.emit('load_conversation', { conversationId });
  }, []);

  const loadMoreMessages = useCallback((conversationId: number, beforeId: number) => {
    socketRef.current?.emit('load_more_messages', { conversationId, beforeId });
  }, []);

  const emitTypingStart = useCallback((conversationId: number) => {
    socketRef.current?.emit('typing_start', { conversationId });
  }, []);

  const emitTypingStop = useCallback((conversationId: number) => {
    socketRef.current?.emit('typing_stop', { conversationId });
  }, []);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeFloatingChatId,
      isFloatingVisible,
      typingConvIds,
      onlineUserIds,
      connectionStatus,
      openChat,
      closeChat,
      minimizarChat,
      sendMessage,
      markAsRead,
      loadMoreMessages,
      loadConversation,
      emitTypingStart,
      emitTypingStop,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
}
