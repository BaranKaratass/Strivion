import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, User, Send, MessageCircle, MoreVertical, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyChats, subscribePrivateMessages, sendPrivateMessage, getOrCreateChatRoom } from '../services/chatService';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import type { ChatRoom, ChatMessage, UserProfile } from '../types';

export const Messages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [otherUsers, setOtherUsers] = useState<Record<string, UserProfile>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-start chat from navigation state
    useEffect(() => {
        if (user && location.state?.startChatWith) {
            const targetUid = location.state.startChatWith;
            getOrCreateChatRoom(user.uid, targetUid).then(chatId => {
                // Find existing room if it's already in the list, otherwise wait for listener
                const existing = rooms.find(r => r.id === chatId);
                if (existing) setSelectedRoom(existing);
                else {
                    // Temporarily set a dummy room to trigger selection
                    setSelectedRoom({ id: chatId, participants: [user.uid, targetUid], updatedAt: Date.now() } as ChatRoom);
                }
            });
            // Clear state so it doesn't re-trigger on refresh
            window.history.replaceState({}, document.title);
        }
    }, [user, location.state, rooms]);

    // Fetch rooms
    useEffect(() => {
        if (!user) return;
        const unsub = getMyChats(user.uid, (data) => {
            setRooms(data);
        });
        return () => unsub();
    }, [user]);

    // Fetch other user profile when room changes
    useEffect(() => {
        const fetchOtherUser = async () => {
            if (!selectedRoom || !user) return;
            const otherId = selectedRoom.participants.find(id => id !== user.uid);
            if (!otherId || otherUsers[otherId]) return;

            const snap = await getDoc(doc(db, 'users', otherId));
            if (snap.exists()) {
                setOtherUsers(prev => ({ ...prev, [otherId]: snap.data() as UserProfile }));
            }
        };
        fetchOtherUser();
    }, [selectedRoom, user]);

    // Subscribe to messages
    useEffect(() => {
        if (!selectedRoom || !user) {
            setMessages([]);
            return;
        }
        const unsub = subscribePrivateMessages(selectedRoom.id, (data) => {
            setMessages(data);
            
            // Mark as read
            const chatRef = doc(db, 'chats', selectedRoom.id);
            updateDoc(chatRef, {
                [`lastSeen.${user.uid}`]: Date.now()
            });
        });
        return () => unsub();
    }, [selectedRoom, user]);

    // Auto scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoom || !inputText.trim() || !user) return;

        const text = inputText;
        setInputText('');
        await sendPrivateMessage(
            selectedRoom.id, 
            user.uid, 
            user.displayName || 'Anonim', 
            user.photoURL || undefined, 
            text
        );
    };

    const getOtherUser = (room: ChatRoom) => {
        const otherId = room.participants.find(id => id !== user?.uid);
        return otherUsers[otherId || ''] || null;
    };

    return (
        <div className="flex h-screen bg-[#0a0a0c] text-slate-200 overflow-hidden font-sans">
            {/* Sidebar */}
            <div className={cn(
                "w-full md:w-80 flex flex-col border-r border-white/5 bg-white/[0.02]",
                selectedRoom ? "hidden md:flex" : "flex"
            )}>
                {/* Header */}
                <div className="p-6 border-b border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/')}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-white">Mesajlar</h1>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Sohbet ara..." 
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Rooms List */}
                <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
                    {rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-30">
                            <MessageCircle size={40} className="mb-3" />
                            <p className="text-sm">Henüz bir mesajlaşma yok.</p>
                        </div>
                    ) : (
                        rooms.map(room => {
                            const other = getOtherUser(room);
                            const active = selectedRoom?.id === room.id;
                            return (
                                <button
                                    key={room.id}
                                    onClick={() => setSelectedRoom(room)}
                                    className={cn(
                                        "w-full px-6 py-4 flex items-center gap-4 transition-all hover:bg-white/5",
                                        active && "bg-white/5 border-r-2 border-blue-500"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                                        {other?.avatarUrl ? (
                                            <img src={other.avatarUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-blue-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <p className="text-sm font-bold text-white truncate">
                                                {other?.displayName || 'Yükleniyor...'}
                                            </p>
                                            {room.lastMessageAt && (
                                                <span className="text-[10px] text-slate-500">
                                                    {new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">
                                            {room.lastMessage || 'Sohbeti başlatın'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col relative",
                !selectedRoom ? "hidden md:flex items-center justify-center bg-[#0a0a0c]" : "flex"
            )}>
                {selectedRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0a0a0c]/80 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setSelectedRoom(null)}
                                    className="md:hidden p-2 text-slate-400 hover:text-white"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                    {getOtherUser(selectedRoom)?.avatarUrl ? (
                                        <img src={getOtherUser(selectedRoom)!.avatarUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={18} className="text-blue-400" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white leading-none">
                                        {getOtherUser(selectedRoom)?.displayName || '...'}
                                    </h2>
                                    <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest mt-1">Çevrimiçi</p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent)]"
                        >
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === user?.uid;
                                const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex gap-3",
                                            isMe ? "flex-row-reverse" : "flex-row"
                                        )}
                                    >
                                        <div className={cn(
                                            "max-w-[70%] space-y-1.5",
                                            isMe ? "items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-lg border",
                                                isMe 
                                                    ? "bg-blue-600 text-white border-blue-500 rounded-tr-none" 
                                                    : "bg-white/5 text-slate-200 border-white/5 rounded-tl-none"
                                            )}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-slate-600 px-1">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/5 bg-[#0a0a0c]">
                            <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Mesaj gönder..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="p-3.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-20 disabled:grayscale transition-all shadow-xl shadow-blue-600/20"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-6 opacity-40">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <MessageCircle size={40} className="text-blue-400" />
                        </div>
                        <div className="text-center space-y-1">
                            <h2 className="text-xl font-bold text-white">Sohbet Seçin</h2>
                            <p className="text-sm max-w-xs">Arkadaşlarınla konuşmaya başlamak için soldaki menüden birini seç.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
