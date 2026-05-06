'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, User, Search, Store, MoreVertical, MessageSquare, ChevronLeft, Smile, Check, CheckCheck } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import PermissionGuard from '@/components/PermissionGuard';

// ─── Emoji picker data ────────────────────────────────────────────────────────
const EMOJI_CATS: Record<string, string[]> = {
  '😀': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😔','😪','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','😵','🤯','😎','🥸','🤓','😕','😟','🙁','☹️','😮','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💩','🤡','👻'],
  '👋': ['👋','🤚','🖐','✋','🖖','👌','🤌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🤲','🙏','💪','🫶','🤝','🫱','🫲'],
  '❤️': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','💯','🔥','✨','💫','⭐','🌟','🎉','🎊','🎈','🎁','🌈','☀️','🌙','❄️','⚡','🌊','🌸','🌺','🌻','🍀','🌹'],
  '😸': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦅','🦉','🐺','🐗','🦋','🐛','🐌','🐜','🦟','🦗','🐢','🐍','🦎','🦕','🐊','🐸','🐡','🐠','🐟','🐬','🐳','🐋','🦈'],
  '🍕': ['🍕','🍔','🌮','🌯','🍜','🍝','🍣','🍱','🍛','🍲','🍗','🥩','🥚','🧀','🥗','🥙','🥪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🍫','🍬','🍭','🍺','🍻','🥂','🍷','☕','🫖','🍵','🧃','🥤','🧋'],
  '⚽': ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🎱','🏓','🏸','🥊','🥋','🎯','🎮','🎲','🎭','🎨','🎬','🎤','🎧','🎵','🎶','🎸','🎹','🎺','🎻','🏆','🥇','🎖','🎗','🚀','⌛','📱','💻','📷','🔑','💡','🔥'],
  '🌍': ['🌍','🌎','🌏','🗺','🧭','🏔','⛰','🌋','🗻','🏕','🏖','🏜','🏝','🏞','🌅','🌄','🌠','🎇','🎆','🌇','🌆','🏙','🌃','🌌','🌁','🌉','🌁','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏗','🧱'],
  '✅': ['✅','❌','⭕','⚠️','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','💯','🆗','🆕','🆙','🆒','🆓','🔝','❓','❔','❕','❗','🔔','🔕','📢','📣','💬','💭','🗯','♻️','🚩','🏁','🔺','🔻','🔷','🔶','🔹','🔸','▶️','⏩','⏭','⏯','🔄'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatConvTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}

// ─── Read receipt icon ────────────────────────────────────────────────────────
function ReadStatus({ readAt }: { readAt: string | null }) {
  if (readAt) return <CheckCheck size={14} className="text-blue-400 flex-shrink-0" />;
  return <CheckCheck size={14} className="text-white/50 flex-shrink-0" />;
}

// ─── Typing animation ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white dark:bg-neutral-800 border border-primary/10 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md flex gap-1 items-center h-10">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function MessagesContent() {
  const { currentUser } = useAuth();
  const {
    conversations, sendMessage, openChat, markAsRead, closeChat,
    typingConvIds, onlineUserIds, emitTypingStart, emitTypingStop, loadMoreMessages,
    loadConversation, connectionStatus,
  } = useChat();

  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileViewList, setIsMobileViewList] = useState(true);
  const [showEmojis, setShowEmojis] = useState(false);
  const [activeEmojiCat, setActiveEmojiCat] = useState(Object.keys(EMOJI_CATS)[0]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();

  const activeConversation = conversations.find(c => c.id === activeConvId) ?? null;

  // Deep-link ?user_id=X
  useEffect(() => {
    const urlUserId = searchParams.get('user_id');
    if (urlUserId) {
      openChat(Number(urlUserId));
    }
    closeChat(); // hide floating chat when entering full page
  }, []);

  // When conversation_opened comes from context (sets activeFloatingChatId),
  // sync local active id
  useEffect(() => {
    if (conversations.length > 0 && activeConvId === null) return;
    const urlUserId = searchParams.get('user_id');
    if (!urlUserId) return;
    const match = conversations.find(c => c.contact.id === Number(urlUserId));
    if (match && activeConvId === null) {
      setActiveConvId(match.id);
      setIsMobileViewList(false);
    }
  }, [conversations]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length]);

  // Mark as read when switching to a conversation
  const selectChat = (convId: number) => {
    setActiveConvId(convId);
    markAsRead(convId);
    setIsMobileViewList(false);
    setShowEmojis(false);
    // Load messages from DB if not already in memory
    const conv = conversations.find(c => c.id === convId);
    if (!conv || conv.messages.length === 0) {
      loadConversation(convId);
    }
  };

  // Load more on scroll top
  const handleScroll = useCallback(() => {
    if (!messagesAreaRef.current || !activeConversation || isLoadingMore) return;
    if (messagesAreaRef.current.scrollTop < 60 && activeConversation.messages.length >= 50) {
      setIsLoadingMore(true);
      const firstId = activeConversation.messages[0]?.id;
      if (firstId) {
        loadMoreMessages(activeConversation.id, firstId);
        setTimeout(() => setIsLoadingMore(false), 1500);
      }
    }
  }, [activeConversation, isLoadingMore, loadMoreMessages]);

  // Typing with debounce
  const handleMessageChange = (val: string) => {
    setNewMessage(val);
    if (!activeConversation) return;
    emitTypingStart(activeConversation.id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTypingStop(activeConversation.id), 2000);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTypingStop(activeConversation.id);
    sendMessage(activeConversation.id, newMessage.trim());
    setNewMessage('');
    setShowEmojis(false);
  };

  const addEmoji = (emoji: string) => setNewMessage(p => p + emoji);

  const filtered = conversations.filter(c =>
    c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.contact.businessName ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isContactOnline = (contactId: number) => onlineUserIds.has(contactId);
  const isTyping = activeConversation ? typingConvIds.has(activeConversation.id) : false;

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-0 sm:py-8 h-[calc(100vh-4rem)] sm:h-[calc(100vh-6rem)] relative overflow-hidden">
      <div className="bg-white/5 dark:bg-black/5 border-none sm:border sm:border-primary/20 sm:rounded-3xl overflow-hidden flex h-full shadow-none sm:shadow-2xl backdrop-blur-md relative">

        {/* ── Sidebar ── */}
        <div className={`w-full md:w-80 border-r border-primary/10 flex flex-col absolute md:relative inset-0 z-20 transition-transform duration-300 bg-white dark:bg-neutral-900 md:bg-black/5 md:dark:bg-white/5 ${!isMobileViewList ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
          <div className="p-4 sm:p-6 border-b border-primary/10 bg-white/50 dark:bg-black/50 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold">Mensajes</h2>
              {connectionStatus === 'connected' && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> En línea
                </span>
              )}
              {connectionStatus === 'connecting' && (
                <span className="text-xs text-yellow-500 font-semibold">Conectando...</span>
              )}
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar chats..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-primary/20 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length > 0 ? filtered.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectChat(conv.id)}
                className={`w-full text-left p-4 border-b border-primary/5 transition-colors flex items-center gap-3 ${activeConvId === conv.id ? 'bg-primary/10 md:border-l-4 md:border-l-primary' : 'hover:bg-primary/5 border-l-4 border-l-transparent'}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center">
                      {conv.contact.avatarUrl
                        ? <img src={conv.contact.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                        : <User size={20} className="text-primary" />}
                    </div>
                  </div>
                  {isContactOnline(conv.contact.id) && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-black rounded-full" />
                  )}
                  {conv.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white dark:ring-black">
                      {conv.unread > 9 ? '9+' : conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`truncate font-bold text-sm ${conv.unread > 0 ? 'text-primary' : ''}`}>
                      {conv.contact.name}
                    </h3>
                    <span className="text-[10px] opacity-50 flex-shrink-0 ml-2">{formatConvTime(conv.lastMessageAt)}</span>
                  </div>
                  <p className={`text-xs truncate ${conv.unread > 0 ? 'font-bold opacity-100' : 'opacity-60'}`}>
                    {conv.lastMessage || 'Envía un mensaje'}
                  </p>
                </div>
              </button>
            )) : (
              <div className="p-8 text-center opacity-50 text-sm">
                {connectionStatus === 'connected' ? 'Sin conversaciones aún.' : 'Conectando al chat...'}
              </div>
            )}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div className={`flex-1 flex flex-col h-full absolute md:relative inset-0 z-30 transition-transform duration-300 bg-neutral-50 dark:bg-neutral-900 md:bg-neutral-50/50 md:dark:bg-neutral-900/50 ${isMobileViewList ? 'translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-primary/10 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button onClick={() => setIsMobileViewList(true)} className="md:hidden p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-primary">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="relative hidden sm:block">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center">
                        {activeConversation.contact.avatarUrl
                          ? <img src={activeConversation.contact.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          : <User size={18} className="text-primary" />}
                      </div>
                    </div>
                    {isContactOnline(activeConversation.contact.id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-black rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm md:text-base">{activeConversation.contact.name}</h3>
                    <div className="flex items-center text-xs gap-1">
                      {isTyping ? (
                        <span className="text-primary animate-pulse font-medium">Escribiendo...</span>
                      ) : isContactOnline(activeConversation.contact.id) ? (
                        <span className="text-emerald-500 font-medium">En línea</span>
                      ) : (
                        <span className="opacity-50 flex items-center gap-1">
                          {activeConversation.contact.businessName && <><Store size={10} /> {activeConversation.contact.businessName}</>}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors opacity-70">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Messages */}
              <div ref={messagesAreaRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
                {isLoadingMore && (
                  <div className="text-center py-2 text-xs opacity-50">Cargando mensajes anteriores...</div>
                )}
                {activeConversation.messages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUser?.id;
                  const prevMsg = activeConversation.messages[idx - 1];
                  const showDateDivider = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

                  return (
                    <div key={msg.id}>
                      {showDateDivider && (
                        <div className="text-center py-3">
                          <span className="text-[10px] font-medium px-3 py-1 bg-black/10 dark:bg-white/10 rounded-full opacity-60">
                            {new Date(msg.createdAt).toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white dark:bg-neutral-800 border border-primary/10 rounded-bl-sm'}`}>
                          <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/70' : 'text-neutral-400'}`}>
                            <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                            {isMe && <ReadStatus readAt={msg.readAt} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-primary/10 relative">
                {/* Emoji Picker */}
                {showEmojis && (
                  <div className="absolute bottom-full left-0 right-0 mx-3 mb-2 bg-white dark:bg-neutral-900 border border-primary/20 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {/* Category tabs */}
                    <div className="flex gap-1 p-2 border-b border-primary/10 overflow-x-auto scrollbar-hide">
                      {Object.keys(EMOJI_CATS).map(cat => (
                        <button key={cat} onClick={() => setActiveEmojiCat(cat)}
                          className={`text-xl p-1.5 rounded-lg transition-colors flex-shrink-0 ${activeEmojiCat === cat ? 'bg-primary/20' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                    {/* Emoji grid */}
                    <div className="grid grid-cols-8 gap-0.5 p-2 max-h-40 overflow-y-auto">
                      {EMOJI_CATS[activeEmojiCat].map(emoji => (
                        <button key={emoji} onClick={() => addEmoji(emoji)}
                          className="text-xl p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex gap-2 items-end bg-black/5 dark:bg-white/5 border border-primary/20 rounded-2xl p-1.5 sm:p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                  <button type="button" onClick={() => setShowEmojis(s => !s)}
                    className={`p-2 sm:p-2.5 rounded-xl transition-colors mb-0.5 ml-0.5 ${showEmojis ? 'bg-primary/20 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-500'}`}>
                    <Smile size={20} />
                  </button>
                  <textarea
                    value={newMessage}
                    onChange={e => handleMessageChange(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-transparent border-none resize-none max-h-32 min-h-[40px] py-2.5 text-sm px-1 focus:outline-none"
                    rows={1}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  />
                  <button type="submit" disabled={!newMessage.trim()}
                    className="p-2.5 sm:p-3 bg-primary text-white rounded-xl hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:hover:translate-y-0 mb-0.5 mr-0.5 shadow-md shadow-primary/30">
                    <Send size={18} />
                  </button>
                </form>
                <p className="text-center text-[10px] opacity-40 mt-1.5 hidden sm:block">Enter para enviar · Shift+Enter para nueva línea</p>
              </div>
            </>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center opacity-50">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-40" />
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
    <PermissionGuard require="messages:read" moduleName="Mensajes">
      <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-4rem)]">Cargando chats...</div>}>
        <MessagesContent />
      </Suspense>
    </PermissionGuard>
  );
}
