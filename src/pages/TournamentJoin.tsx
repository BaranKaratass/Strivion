import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, Search, Users, Zap, Lock, Unlock,
    Clock, Play, CheckCircle, Loader2, AlertCircle, Ticket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { findTournamentByCode, joinTournament } from '../services/tournamentService';
import { cn } from '../lib/utils';
import type { Tournament } from '../types';

const GAME_EMOJIS: Record<string, string> = {
    'Valorant': '🎯', 'League of Legends': '⚔️', 'CS2': '💣', 'Fortnite': '🪂',
    'PUBG': '🪖', 'Apex Legends': '🔥', 'Dota 2': '🧙', 'Rocket League': '🚀',
    'FIFA': '⚽', 'Rainbow Six': '🛡️', 'Overwatch 2': '🤖', 'Call of Duty': '🔫',
    'Minecraft': '⛏️', 'GTA V': '🏎️', 'Brawl Stars': '⭐',
};

const STATUS_CONFIG = {
    waiting: { label: 'Kayıt Açık', icon: <Clock size={12} />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    active: { label: 'Devam Ediyor', icon: <Play size={12} className="fill-current" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    completed: { label: 'Tamamlandı', icon: <CheckCircle size={12} />, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
};

export const TournamentJoin = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [searching, setSearching] = useState(false);
    const [joining, setJoining] = useState(false);
    const [found, setFound] = useState<Tournament | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSearch = async () => {
        if (code.trim().length < 4) {
            setError('Geçerli bir turnuva kodu girin.');
            return;
        }
        setError('');
        setFound(null);
        setSearching(true);
        try {
            const tournament = await findTournamentByCode(code);
            if (tournament) {
                setFound(tournament);
            } else {
                setError('Bu kodla eşleşen bir turnuva bulunamadı.');
            }
        } catch {
            setError('Arama sırasında bir hata oluştu.');
        } finally {
            setSearching(false);
        }
    };

    const handleJoin = async () => {
        if (!user || !found) return;
        setJoining(true);
        setError('');
        try {
            const result = await joinTournament(found.id, user);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => navigate(`/tournaments/${found.id}`), 1500);
            } else {
                setError(result.error || 'Katılım sırasında bir hata oluştu.');
            }
        } catch {
            setError('Bir hata oluştu, lütfen tekrar deneyin.');
        } finally {
            setJoining(false);
        }
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        setCode(value);
        if (found) {
            setFound(null);
            setSuccess(false);
        }
        setError('');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[25%] w-[45%] h-[40%] bg-purple-600/7 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[15%] w-[35%] h-[35%] bg-blue-600/6 blur-[150px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Back */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/tournaments')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                >
                    <ChevronRight size={16} className="rotate-180" />
                    Turnuvalarım
                </motion.button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="space-y-1"
                >
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/15">
                            <Ticket size={20} className="text-purple-400" />
                        </div>
                        Kod ile Katıl
                    </h1>
                    <p className="text-slate-500 text-sm ml-12">
                        Turnuva kodunu girerek hemen katıl.
                    </p>
                </motion.div>

                {/* Code Input */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 space-y-4"
                >
                    <p className="text-sm text-slate-400">Turnuva sahibinden aldığın 6 haneli kodu gir:</p>

                    <div className="flex gap-3">
                        <input
                            value={code}
                            onChange={handleCodeChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="ÖRN: A3B5K9"
                            maxLength={6}
                            className="flex-1 text-center text-2xl font-bold tracking-[0.4em] font-mono bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={searching || code.length < 4}
                            className="px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {searching ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Search size={18} />
                            )}
                        </button>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm"
                            >
                                <AlertCircle size={15} className="flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Found Tournament */}
                <AnimatePresence>
                    {found && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-3xl border border-white/10 p-6 space-y-5 overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-purple-500/8 to-transparent" />

                            <div className="relative space-y-4">
                                {/* Title & Game */}
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{GAME_EMOJIS[found.game] || '🎮'}</span>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500">{found.game}</p>
                                        <h2 className="text-lg font-bold text-white leading-tight">{found.title}</h2>
                                    </div>
                                    <span className={cn(
                                        'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
                                        STATUS_CONFIG[found.status].bg, STATUS_CONFIG[found.status].color
                                    )}>
                                        {STATUS_CONFIG[found.status].icon}
                                        {STATUS_CONFIG[found.status].label}
                                    </span>
                                </div>

                                {found.description && (
                                    <p className="text-sm text-slate-400 leading-relaxed">{found.description}</p>
                                )}

                                {/* Meta */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-400">
                                        <Users size={12} />
                                        {found.participantIds.length}/{found.maxParticipants} Oyuncu
                                    </span>
                                    {found.prizePool > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/15 text-amber-400">
                                            <Zap size={12} className="fill-current" />
                                            {found.prizePool} Coin Ödül
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-400">
                                        {found.isPrivate ? <Lock size={12} /> : <Unlock size={12} />}
                                        {found.isPrivate ? 'Özel' : 'Açık'}
                                    </span>
                                </div>

                                {/* Join Button */}
                                {success ? (
                                    <motion.div
                                        initial={{ scale: 0.95 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600/20 border border-emerald-500/25 text-emerald-400 font-semibold text-sm"
                                    >
                                        <CheckCircle size={18} />
                                        Katıldın! Yönlendiriliyorsun...
                                    </motion.div>
                                ) : (
                                    <button
                                        onClick={handleJoin}
                                        disabled={joining || found.status !== 'waiting' || found.participantIds.length >= found.maxParticipants}
                                        className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                                    >
                                        {joining ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Ticket size={18} />
                                                Turnuvaya Katıl
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Browse hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center pt-4"
                >
                    <p className="text-slate-500 text-sm">
                        Kodun yok mu?{' '}
                        <button
                            onClick={() => navigate('/tournaments/browse')}
                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        >
                            Açık turnuvalara göz at →
                        </button>
                    </p>
                </motion.div>
            </main>
        </div>
    );
};
