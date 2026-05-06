'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { X, Minus, Send, Smile, User, CheckCheck } from 'lucide-react';

const QUICK_EMOJIS = ['😀','😂','🥰','😍','🔥','👍','❤️','🎉','😎','🙏','💪','✨','😅','🤔','💯','🚀'];

function formatTime(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function FloatingChat() {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const {
    activeFloatingChatId, isFloatingVisible, closeChat, minimizarChat,
    conversations, sendMessage, openChat, typingConvIds, onlineUserIds,
    emitTypingStart, emitTypingStop, markAsRead,
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeConversation = conversations.find(c => c.id === activeFloatingChatId) ?? null;
  const isTyping = activeConversation ? typingConvIds.has(activeConversation.id) : false;
  const isOnline = activeConversation ? onlineUserIds.has(activeConversation.contact.id) : false;
  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

  useEffect(() => {
    if (isFloatingVisible && activeConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      markAsRead(activeConversation.id);
    }
  }, [activeConversation?.messages.length, isFloatingVisible]);

  const hiddenPaths = ['/messages', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
  if (hiddenPaths.some(p => pathname?.startsWith(p))) return null;

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTypingStop(activeConversation.id);
    sendMessage(activeConversation.id, newMessage.trim());
    setNewMessage('');
    setShowEmojis(false);
  };

  const handleChange = (val: string) => {
    setNewMessage(val);
    if (!activeConversation) return;
    emitTypingStart(activeConversation.id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTypingStop(activeConversation.id), 2000);
  };

  // ── Minimized bubble ────────────────────────────────────────────────────────
  if (!isFloatingVisible) {
    return (
      <button
        onClick={() => {
          const toOpen = activeFloatingChatId ?? conversations[0]?.id;
          if (toOpen) {
            const conv = conversations.find(c => c.id === toOpen);
            if (conv) { openChat(conv.contact.id); }
          }
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

  if (!activeConversation) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-primary/20 z-50 flex flex-col h-[500px] max-h-[80vh] animate-in slide-in-from-bottom-5 fade-in duration-300">
      {/* Header */}
      <div className="bg-primary text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {activeConversation.contact.avatarUrl
                ? <img src={activeConversation.contact.avatarUrl} alt="" className="w-full h-full object-cover" />
                : <User size={16} />}
            </div>
            {isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border border-primary rounded-full" />}
          </div>
          <div className="truncate">
            <h4 className="font-bold text-sm truncate">{activeConversation.contact.name}</h4>
            <p className="text-[10px] text-white/80">
              {isTyping ? <span className="animate-pulse">Escribiendo...</span>
                : isOnline ? 'En línea'
                : activeConversation.contact.businessName ?? 'Emprendedor'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={minimizarChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Minimizar"><Minus size={16} /></button>
          <button onClick={closeChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Cerrar"><X size={16} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-black/5 dark:bg-white/5">
        {activeConversation.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center opacity-50 px-4">
            <p className="text-sm">Envía un mensaje para iniciar la conversación.</p>
          </div>
        ) : (
          activeConversation.messages.map(msg => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white dark:bg-neutral-800 border border-primary/10 rounded-bl-sm'}`}>
                  <p className="text-sm break-words">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-0.5 ${isMe ? 'text-white/60' : 'text-neutral-400'}`}>
                    <span className="text-[9px]">{formatTime(msg.createdAt)}</span>
                    {isMe && (msg.readAt
                      ? <CheckCheck size={12} className="text-blue-300" />
                      : <CheckCheck size={12} className="text-white/40" />)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-neutral-800 border border-primary/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker */}
      {showEmojis && (
        <div className="absolute bottom-16 left-3 bg-white dark:bg-neutral-800 border border-primary/20 p-2 rounded-2xl shadow-xl grid grid-cols-8 gap-0.5 animate-in zoom-in-95 duration-150">
          {QUICK_EMOJIS.map(emoji => (
            <button key={emoji} onClick={() => setNewMessage(p => p + emoji)}
              className="w-8 h-8 flex items-center justify-center hover:bg-primary/10 rounded-xl transition-colors text-lg">
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white dark:bg-neutral-900 border-t border-primary/10">
        <form onSubmit={handleSend} className="flex gap-2 items-center bg-black/5 dark:bg-white/5 rounded-full p-1 border border-transparent focus-within:border-primary/30 transition-all">
          <button type="button" onClick={() => setShowEmojis(s => !s)} className={`p-2 rounded-full transition-colors ${showEmojis ? 'text-primary bg-primary/10' : 'text-neutral-400 hover:text-primary'}`}>
            <Smile size={18} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
            placeholder="Mensaje..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm px-1 py-1"
          />
          <button type="submit" disabled={!newMessage.trim()}
            className="p-2 bg-primary text-white rounded-full hover:-translate-y-0.5 transition-transform disabled:opacity-40 mr-0.5">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
