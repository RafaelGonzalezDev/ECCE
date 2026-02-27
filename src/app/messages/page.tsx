'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, User, Search, Store, MoreVertical, MessageSquare, ChevronLeft, Smile } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

function MessagesContent() {
    const { conversations, sendMessage, openChat, markAsRead, closeChat } = useChat();
    const [localActiveChatId, setLocalActiveChatId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileViewList, setIsMobileViewList] = useState(true);
    const [showEmojis, setShowEmojis] = useState(false);

    const MOCK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '✨', '💯'];
    const addEmoji = (e: React.MouseEvent, emoji: string) => {
        e.preventDefault();
        setNewMessage(prev => prev + emoji);
    };

    // Auto scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();

    // Check if we came from a deep link (e.g. ?user_id=123)
    useEffect(() => {
        const urlUserId = searchParams.get('user_id');
        if (urlUserId) {
            // Open it in the global context so it's initialized
            openChat(urlUserId);
            setLocalActiveChatId(urlUserId);
            setIsMobileViewList(false); // jump straight to chat on mobile
        }
    }, [searchParams, openChat]);

    // Close floating chat when entering messages page
    useEffect(() => {
        closeChat();
    }, []);

    const activeConversation = conversations.find(c => c.contact.id === localActiveChatId);

    const selectChat = (userId: string) => {
        setLocalActiveChatId(userId);
        markAsRead(userId);
        setIsMobileViewList(false);
    };

    const handleBackToList = () => {
        setIsMobileViewList(true);
    };

    // Auto-scroll logic
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeConversation?.messages]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        sendMessage(activeConversation.contact.id, newMessage);
        setNewMessage('');
    };

    const filteredContacts = conversations.filter(c =>
        c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contact.storeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-0 sm:py-8 h-[calc(100vh-4rem)] sm:h-[calc(100vh-6rem)] relative overflow-hidden">
            <div className="bg-white/5 dark:bg-black/5 border-none sm:border sm:border-primary/20 sm:rounded-3xl overflow-hidden flex h-full shadow-none sm:shadow-2xl backdrop-blur-md relative">

                {/* Contacts Sidebar */}
                <div className={`w-full md:w-80 border-r border-primary/10 flex flex-col absolute md:relative inset-0 z-20 transition-transform duration-300 bg-white dark:bg-neutral-900 md:bg-black/5 md:dark:bg-white/5 ${!isMobileViewList ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                    <div className="p-4 sm:p-6 border-b border-primary/10 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                        <h2 className="text-2xl font-extrabold mb-4">Mensajes</h2>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar chats..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/5 dark:bg-white/5 border border-primary/20 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredContacts.length > 0 ? filteredContacts.map((conv) => (
                            <button
                                key={conv.contact.id}
                                onClick={() => selectChat(conv.contact.id)}
                                className={`w-full text-left p-4 border-b border-primary/5 transition-colors flex items-center gap-3 ${localActiveChatId === conv.contact.id ? 'bg-primary/10 md:border-l-4 md:border-l-primary' : 'hover:bg-primary/5 border-l-4 border-l-transparent'}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center">
                                            <User size={20} className="text-primary" />
                                        </div>
                                    </div>
                                    {conv.unread > 0 && (
                                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white dark:ring-black">
                                            {conv.unread}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`truncate font-bold text-sm ${conv.unread > 0 ? 'text-primary' : ''}`}>
                                            {conv.contact.name}
                                        </h3>
                                        <span className="text-xs opacity-60 flex-shrink-0 ml-2">{conv.time}</span>
                                    </div>
                                    <p className={`text-xs truncate ${conv.unread > 0 ? 'font-bold opacity-100' : 'opacity-70'}`}>
                                        {conv.lastMessage || "Envía un mensaje"}
                                    </p>
                                </div>
                            </button>
                        )) : (
                            <div className="p-8 text-center opacity-50">
                                No se encontraron conversaciones.
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Chat Area */}
                <div className={`flex-1 flex flex-col h-full absolute md:relative inset-0 z-30 transition-transform duration-300 bg-neutral-50 dark:bg-neutral-900 md:bg-neutral-50/50 md:dark:bg-neutral-900/50 ${isMobileViewList ? 'translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-3 sm:p-4 border-b border-primary/10 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                        onClick={handleBackToList}
                                        className="md:hidden p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-primary"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5 hidden sm:block">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center">
                                            <User size={18} className="text-primary" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm md:text-base">{activeConversation.contact.name}</h3>
                                        <div className="flex items-center text-xs opacity-70 gap-1 text-primary cursor-pointer hover:underline">
                                            <Store size={12} /> {activeConversation.contact.storeName}
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors opacity-70">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                                <div className="text-center pb-2">
                                    <span className="text-[10px] sm:text-xs font-medium px-3 py-1 bg-black/10 dark:bg-white/10 rounded-full opacity-60">
                                        Hoy
                                    </span>
                                </div>

                                {activeConversation.messages.map((msg) => {
                                    const isMe = msg.sender === 'me';
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 sm:px-5 py-2 sm:py-3 shadow-md ${isMe
                                                ? 'bg-primary text-white rounded-br-sm'
                                                : 'bg-white dark:bg-neutral-800 border border-primary/10 rounded-bl-sm'
                                                }`}>
                                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                                <p className={`text-[9px] sm:text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-neutral-500  dark:text-neutral-400'}`}>
                                                    {msg.time}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} className="h-1 pb-4" />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 sm:p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-primary/10 mb-safe md:mb-0">
                                {/* Emoji Picker Popover */}
                                {showEmojis && (
                                    <div className="absolute bottom-20 right-4 sm:right-6 bg-white dark:bg-neutral-800 border border-primary/20 rounded-2xl p-2 shadow-2xl flex gap-1 z-50 animate-in fade-in slide-in-from-bottom-2">
                                        {MOCK_EMOJIS.map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={(e) => addEmoji(e, emoji)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-xl"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex gap-2 items-end bg-black/5 dark:bg-white/5 border border-primary/20 rounded-2xl p-1.5 sm:p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojis(!showEmojis)}
                                        className={`p-2 sm:p-2.5 rounded-xl transition-colors mb-0.5 sm:mb-0.5 ml-0.5 ${showEmojis ? 'bg-primary/20 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-500'}`}
                                        title="Emojis"
                                    >
                                        <Smile size={20} />
                                    </button>
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe un mensaje..."
                                        className="flex-1 bg-transparent border-none resize-none max-h-32 min-h-[40px] sm:min-h-[44px] py-2.5 sm:py-3 text-sm px-1 focus:outline-none"
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="p-2.5 sm:p-3 bg-primary text-white rounded-xl hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed mb-0.5 sm:mb-0.5 mr-0.5 shadow-md shadow-primary/30"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                                <p className="text-center text-[10px] opacity-50 mt-2 hidden sm:block">Presiona Enter para enviar. Shift + Enter para salto de línea.</p>
                            </div>
                        </>
                    ) : (
                        <div className="hidden md:flex flex-1 items-center justify-center bg-neutral-50/50 dark:bg-neutral-900/50">
                            <div className="text-center opacity-60">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Selecciona un chat</p>
                                <p className="text-sm">Para comenzar a enviar mensajes</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando chats...</div>}>
            <MessagesContent />
        </Suspense>
    );
}
