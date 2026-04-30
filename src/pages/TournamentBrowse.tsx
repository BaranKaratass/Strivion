import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Globe, Search, Gamepad2, Loader2 } from 'lucide-react';
import { getPublicTournaments } from '../services/tournamentService';
import { TournamentCard } from '../components/TournamentCard';
import type { Tournament } from '../types';

const GAMES = [
    'Tümü', 'Valorant', 'League of Legends', 'CS2', 'Fortnite', 'PUBG',
    'Apex Legends', 'Dota 2', 'Rocket League', 'FIFA', 'Rainbow Six',
    'Overwatch 2', 'Call of Duty', 'Minecraft', 'GTA V', 'Brawl Stars',
];

export const TournamentBrowse = () => {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [gameFilter, setGameFilter] = useState('Tümü');

    useEffect(() => {
        getPublicTournaments()
            .then(setTournaments)
            .finally(() => setLoading(false));
    }, []);

    const filtered = tournaments.filter(t => {
        const matchSearch = search.trim() === '' ||
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.code.toLowerCase().includes(search.toLowerCase());
        const matchGame = gameFilter === 'Tümü' || t.game === gameFilter;
        return matchSearch && matchGame;
    });

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[20%] w-[45%] h-[40%] bg-emerald-600/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[10%] w-[35%] h-[35%] bg-blue-600/5 blur-[150px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <button
                        onClick={() => navigate('/tournaments')}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        <ChevronRight size={16} className="rotate-180" />
                        Turnuvalarım
                    </button>
                    <button
                        onClick={() => navigate('/tournaments/join')}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                    >
                        Kod ile Katıl
                    </button>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                            <Globe size={20} className="text-emerald-400" />
                        </div>
                        Turnuva Keşfet
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 ml-12">
                        Kayıt açık olan açık turnuvaları keşfet ve katıl.
                    </p>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                >
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Turnuva adı veya kodu ile ara..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                    />
                </motion.div>

                {/* Game Filters */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none"
                >
                    {GAMES.map(game => (
                        <button
                            key={game}
                            onClick={() => setGameFilter(game)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${gameFilter === game
                                    ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-300'
                                    : 'bg-white/5 border border-white/8 text-slate-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {game === 'Tümü' ? (
                                <span className="flex items-center gap-1.5">
                                    <Gamepad2 size={12} />
                                    Tümü
                                </span>
                            ) : game}
                        </button>
                    ))}
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 size={28} className="text-emerald-400 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 space-y-4 text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Globe size={24} className="text-slate-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-white font-medium">
                                {tournaments.length === 0 ? 'Henüz açık turnuva yok' : 'Aramayla eşleşen turnuva bulunamadı'}
                            </p>
                            <p className="text-slate-500 text-sm">
                                {tournaments.length === 0
                                    ? 'İlk açık turnuvayı oluşturmak ister misin?'
                                    : 'Farklı bir arama dene veya filtreleri temizle.'}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-3 pb-8">
                        <p className="text-xs text-slate-500">{filtered.length} turnuva bulundu</p>
                        {filtered.map((tournament, index) => (
                            <TournamentCard
                                key={tournament.id}
                                tournament={tournament}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
