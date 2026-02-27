'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_USERS } from '@/lib/mockData';

export type Message = {
    id: number;
    text: string;
    sender: 'me' | 'them';
    time: string;
};

export type Conversation = {
    contact: {
        id: string;
        name: string;
        storeName: string;
        rating: number;
    };
    lastMessage: string;
    time: string;
    unread: number;
    messages: Message[];
};

// Initial data identical to what was hardcoded in messages/page.tsx
const initialConversations: Conversation[] = [
    {
        contact: MOCK_USERS[1], // Ana García
        lastMessage: "¡Perfecto! Te lo envío el martes.",
        time: "10:30 AM",
        unread: 0,
        messages: [
            { id: 1, text: "Hola Ana, estaba viendo tu producto de diseño.", sender: 'me', time: "10:00 AM" },
            { id: 2, text: "¡Hola! Claro, ¿qué dudas tienes?", sender: 'them', time: "10:05 AM" },
            { id: 3, text: "¿El logo incluye manual de marca?", sender: 'me', time: "10:12 AM" },
            { id: 4, text: "Sí, todos los paquetes de logo incluyen el manual Básico en PDF.", sender: 'them', time: "10:15 AM" },
            { id: 5, text: "Me parece excelente, haré la compra.", sender: 'me', time: "10:25 AM" },
            { id: 6, text: "¡Perfecto! Te lo envío el martes.", sender: 'them', time: "10:30 AM" }
        ]
    },
    {
        contact: MOCK_USERS[2], // Carlos Mendoza
        lastMessage: "¿Me confirmas tu dirección?",
        time: "Ayer",
        unread: 1,
        messages: [
            { id: 1, text: "Hola Carlos, quiero un pastel para el sábado.", sender: 'me', time: "Ayer" },
            { id: 2, text: "Claro, ¿de qué sabor te gustaría?", sender: 'them', time: "Ayer" },
            { id: 3, text: "Chocolate con Fresas por favor.", sender: 'me', time: "Ayer" },
            { id: 4, text: "Anotado. ¿Me confirmas tu dirección?", sender: 'them', time: "Ayer" }
        ]
    }
];

interface ChatContextType {
    conversations: Conversation[];
    activeFloatingChatId: string | null;
    isFloatingVisible: boolean;
    openChat: (userId: string) => void;
    closeChat: () => void;
    minimizarChat: () => void;
    sendMessage: (userId: string, text: string) => void;
    markAsRead: (userId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [activeFloatingChatId, setActiveFloatingChatId] = useState<string | null>(null);
    const [isFloatingVisible, setIsFloatingVisible] = useState(false);

    const openChat = (userId: string) => {
        // Ensure conversation exists or create empty one
        setCurrentConversationOrCreate(userId);

        setActiveFloatingChatId(userId);
        setIsFloatingVisible(true);
        markAsRead(userId);
    };

    const closeChat = () => {
        setActiveFloatingChatId(null);
        setIsFloatingVisible(false);
    };

    const minimizarChat = () => {
        setIsFloatingVisible(false);
        // We keep the activeFloatingChatId so clicking a minimzed bubble could reopen it, 
        // but for now closing simply hides it.
    };

    const markAsRead = (userId: string) => {
        setConversations(prev => prev.map(conv => {
            if (conv.contact.id === userId) {
                return { ...conv, unread: 0 };
            }
            return conv;
        }));
    };

    const setCurrentConversationOrCreate = (userId: string) => {
        setConversations(prev => {
            const exists = prev.find(c => c.contact.id === userId);
            if (exists) return prev;

            const user = MOCK_USERS.find(u => u.id === userId);
            if (!user) return prev; // Fallback, shouldn't hit if legit user

            const newChat: Conversation = {
                contact: user,
                lastMessage: "",
                time: "Ahora",
                unread: 0,
                messages: []
            };
            return [newChat, ...prev];
        });
    };

    const sendMessage = (userId: string, text: string) => {
        if (!text.trim()) return;

        setConversations(prev => {
            const updated = prev.map(conv => {
                if (conv.contact.id === userId) {
                    return {
                        ...conv,
                        lastMessage: text,
                        time: "Ahora",
                        messages: [
                            ...conv.messages,
                            {
                                id: Date.now(),
                                text: text,
                                sender: 'me' as 'me' | 'them',
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                        ]
                    };
                }
                return conv;
            });

            // Move updated chat to the top
            const chatToMove = updated.find(c => c.contact.id === userId);
            const others = updated.filter(c => c.contact.id !== userId);
            return chatToMove ? [chatToMove, ...others] : prev;
        });
    };

    return (
        <ChatContext.Provider value={{
            conversations,
            activeFloatingChatId,
            isFloatingVisible,
            openChat,
            closeChat,
            minimizarChat,
            sendMessage,
            markAsRead
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
