'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '@/context/ChatContext';
import { X, Minus, Send, Smile, User } from 'lucide-react';

export default function FloatingChat() {
    const pathname = usePathname();
    const { activeFloatingChatId, isFloatingVisible, closeChat, minimizarChat, conversations, sendMessage, openChat } = useChat();
    const [newMessage, setNewMessage] = useState('');
    const [showEmojis, setShowEmojis] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations.find(c => c.contact.id === activeFloatingChatId);

    useEffect(() => {
        if (isFloatingVisible) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeConversation?.messages, isFloatingVisible]);

    const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

    // Never show on auth or messages pages
    const hiddenPaths = ['/messages', '/login', '/register'];
    if (hiddenPaths.some(p => pathname?.startsWith(p))) return null;

    if (!isFloatingVisible) {
        return (
            <button
                onClick={() => {
                    const idToOpen = activeFloatingChatId || conversations[0]?.contact?.id;
                    if (idToOpen) openChat(idToOpen);
                }}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 animate-in slide-in-from-bottom-5 fade-in"
            >
                <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    {totalUnread > 0 && (
                        <span className="absolute -top-2 -right-3 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-md ring-2 ring-primary">
                            {totalUnread > 9 ? '9+' : totalUnread}
                        </span>
                    )}
                </div>
            </button>
        );
    }

    if (!activeConversation) {
        return null;
    }

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        sendMessage(activeConversation.contact.id, newMessage);
        setNewMessage('');
        setShowEmojis(false);
    };

    const addEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-primary/20 z-50 flex flex-col h-[500px] max-h-[80vh] animate-in slide-in-from-bottom-5 fade-in duration-300">
            {/* Header */}
            <div className="bg-primary text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <User size={16} />
                    </div>
                    <div className="truncate">
                        <h4 className="font-bold text-sm truncate">{activeConversation.contact.name}</h4>
                        <p className="text-[10px] text-white/80 truncate opacity-90">{activeConversation.contact.storeName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={minimizarChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Minimizar">
                        <Minus size={16} />
                    </button>
                    <button onClick={closeChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Cerrar">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/5 dark:bg-white/5 relative">
                {activeConversation.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 px-4">
                        <p className="text-sm">Envía el primer mensaje para consultar sobre un producto o pedir ayuda.</p>
                    </div>
                ) : (
                    activeConversation.messages.map((msg) => {
                        const isMe = msg.sender === 'me';
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                    ? 'bg-primary text-white rounded-br-sm'
                                    : 'bg-white dark:bg-neutral-800 border border-primary/10 rounded-bl-sm text-neutral-800 dark:text-neutral-200'
                                    }`}>
                                    <p className="text-sm">{msg.text}</p>
                                    <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-neutral-500'}`}>
                                        {msg.time}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 bg-white dark:bg-neutral-900 border-t border-primary/10 relative">

                {/* Emoji Mock Picker popup */}
                {showEmojis && (
                    <div className="absolute bottom-full left-3 mb-2 bg-white dark:bg-neutral-800 border border-primary/20 p-2 rounded-2xl shadow-xl flex gap-1 animate-in zoom-in-95 duration-200">
                        {['😀', '🙌', '👍', '🔥', '🛍️', '✅'].map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => addEmoji(emoji)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-primary/10 rounded-xl transition-colors text-xl"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSend} className="flex gap-2 items-center bg-black/5 dark:bg-white/5 rounded-full p-1 border border-transparent focus-within:border-primary/30 transition-all">
                    <button
                        type="button"
                        onClick={() => setShowEmojis(!showEmojis)}
                        className="p-2 text-neutral-400 hover:text-primary transition-colors rounded-full"
                    >
                        <Smile size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mensaje..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm px-1 py-1"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-primary text-white rounded-full hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:hover:translate-y-0 mr-0.5"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
