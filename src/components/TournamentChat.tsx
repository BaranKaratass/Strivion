import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MessageSquare, X, Crown, Megaphone, Reply, Pin } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import type { ChatMessage } from '../types';

interface TournamentChatProps {
    tournamentId: string;
    ownerId: string;
    onClose?: () => void;
}

export const TournamentChat: React.FC<TournamentChatProps> = ({ tournamentId, ownerId, onClose }) => {
    const { user } = useAuth();
    const { messages, sendMessage, loading } = useChat('tournament', tournamentId);
    const [inputText, setInputText] = useState('');
    const [isAnnouncement, setIsAnnouncement] = useState(false);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const isOwner = user?.uid === ownerId;
    const latestAnnouncement = [...messages].reverse().find(m => m.isAnnouncement);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        
        const text = inputText;
        const currentReply = replyTo;
        const currentAnnounce = isAnnouncement;
        
        setInputText('');
        setReplyTo(null);
        setIsAnnouncement(false);

        await sendMessage(text, {
            isAnnouncement: currentAnnounce,
            replyTo: currentReply ? {
                id: currentReply.id,
                name: currentReply.senderName,
                text: currentReply.text
            } : undefined
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c]/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 relative z-30">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                        <MessageSquare size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">Turnuva Sohbeti</h3>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Canlı Yayın</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Pinned Announcement Bar */}
            <AnimatePresence>
                {latestAnnouncement && (
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="bg-amber-500/10 border-b border-amber-500/20 p-3 flex items-center gap-3 relative z-20"
                    >
                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                            <Megaphone size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Duyuru</p>
                            <p className="text-xs text-slate-300 truncate font-medium">{latestAnnouncement.text}</p>
                        </div>
                        <Pin size={12} className="text-amber-500/50" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-20">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30 text-center">
                        <MessageSquare size={32} className="text-slate-600" />
                        <p className="text-xs font-medium">Sohbeti başlatmak için yazın!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg, idx) => {
                            const isMe = msg.senderId === user?.uid;
                            const msgIsOwner = msg.senderId === ownerId;
                            const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: isMe ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                        "flex gap-3 group",
                                        isMe ? "flex-row-reverse" : "flex-row",
                                        msg.isAnnouncement && "justify-center !flex-row !my-8"
                                    )}
                                >
                                    {/* Announcement Centered Layout */}
                                    {msg.isAnnouncement ? (
                                        <div className="flex flex-col items-center max-w-[90%] w-full space-y-3">
                                            <div className="flex items-center gap-4 w-full">
                                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-amber-500/50" />
                                                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                                                    <Megaphone size={12} className="text-amber-400" />
                                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">RESMİ DUYURU</span>
                                                </div>
                                                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-amber-500/50" />
                                            </div>
                                            <div className="px-6 py-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center shadow-[0_0_20px_rgba(251,191,36,0.05)]">
                                                <p className="text-sm text-amber-200 font-bold leading-relaxed">{msg.text}</p>
                                                <p className="text-[10px] text-amber-500/60 mt-2 uppercase font-medium tracking-wider">
                                                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Avatar */}
                                            <div className="w-8 h-8 flex-shrink-0 mt-1">
                                                {showAvatar ? (
                                                    <div className={cn(
                                                        "w-full h-full rounded-lg border overflow-hidden shadow-lg transition-transform hover:scale-110 cursor-pointer",
                                                        msgIsOwner ? "border-amber-400/50 shadow-amber-500/20" : "border-white/10"
                                                    )}>
                                                        {msg.senderAvatar ? (
                                                            <img src={msg.senderAvatar} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className={cn("w-full h-full flex items-center justify-center", msgIsOwner ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400")}>
                                                                <User size={14} />
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : <div className="w-8" />}
                                            </div>

                                            {/* Bubble Container */}
                                            <div className={cn(
                                                "max-w-[75%] space-y-1 relative",
                                                isMe ? "items-end" : "items-start flex flex-col"
                                            )}>
                                                {showAvatar && (
                                                    <div className="flex items-center gap-1.5 px-1">
                                                        <span className={cn(
                                                            "text-[10px] font-bold tracking-tight",
                                                            msgIsOwner ? "text-amber-400" : isMe ? "text-blue-400" : "text-slate-500"
                                                        )}>
                                                            {msg.senderName}
                                                        </span>
                                                        {msgIsOwner && (
                                                            <div className="p-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                                <Crown size={8} />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Reply Content */}
                                                {msg.replyToId && (
                                                    <div className={cn(
                                                        "px-3 py-1.5 rounded-xl bg-white/5 border-l-2 border-white/20 text-[11px] mb-[-8px] pb-3 opacity-60 line-clamp-1",
                                                        isMe ? "rounded-tr-none border-blue-500/50" : "rounded-tl-none border-slate-500/50"
                                                    )}>
                                                        <span className="font-bold mr-2">{msg.replyToName}:</span>
                                                        {msg.replyToText}
                                                    </div>
                                                )}

                                                {/* Message Bubble */}
                                                <div className={cn(
                                                    "px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm border transition-all relative",
                                                    isMe 
                                                        ? "bg-blue-600 text-white border-blue-500 rounded-tr-none" 
                                                        : msgIsOwner
                                                            ? "bg-[#0f0e0a] text-amber-100 border-amber-500/30 rounded-tl-none shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                                                            : "bg-white/5 text-slate-200 border-white/5 rounded-tl-none",
                                                    "group-hover:border-white/20"
                                                )}>
                                                    {msg.text}
                                                    
                                                    {/* Reply Action */}
                                                    <button 
                                                        onClick={() => setReplyTo(msg)}
                                                        className={cn(
                                                            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20",
                                                            isMe ? "left-[-40px]" : "right-[-40px]"
                                                        )}
                                                    >
                                                        <Reply size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/5 border-t border-white/10 space-y-3 relative z-30">
                {/* Active Reply Preview */}
                <AnimatePresence>
                    {replyTo && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-3 overflow-hidden"
                        >
                            <div className="w-1 h-full bg-blue-500 rounded-full" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-blue-400">{replyTo.senderName}</p>
                                <p className="text-xs text-slate-400 truncate">{replyTo.text}</p>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="p-1 hover:text-white text-slate-500">
                                <X size={14} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSend} className="space-y-3">
                    <div className="relative group flex gap-2 items-center">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={isAnnouncement ? "RESMİ DUYURU YAZ..." : "Mesaj gönder..."}
                                className={cn(
                                    "w-full bg-white/5 border rounded-2xl pl-4 pr-12 py-3 text-sm transition-all focus:outline-none focus:ring-2",
                                    isAnnouncement 
                                        ? "border-amber-500/50 text-amber-100 placeholder:text-amber-500/30 focus:ring-amber-500/20" 
                                        : "border-white/10 text-white placeholder:text-slate-600 focus:ring-blue-500/20 focus:border-blue-500/50"
                                )}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className={cn(
                                    "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all shadow-lg",
                                    isAnnouncement 
                                        ? "bg-amber-600 text-white shadow-amber-600/20" 
                                        : "bg-blue-600 text-white shadow-blue-600/20"
                                )}
                            >
                                <Send size={16} />
                            </button>
                        </div>

                        {/* Admin Tools */}
                        {isOwner && (
                            <button
                                type="button"
                                onClick={() => setIsAnnouncement(!isAnnouncement)}
                                className={cn(
                                    "p-3 rounded-2xl border transition-all",
                                    isAnnouncement 
                                        ? "bg-amber-500/20 border-amber-500/50 text-amber-400" 
                                        : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                                )}
                                title="Duyuru Olarak Gönder"
                            >
                                <Megaphone size={18} />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
