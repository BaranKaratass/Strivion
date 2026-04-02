import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trophy, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserTournaments } from '../services/tournamentService';
import { TournamentCard } from '../components/TournamentCard';
import type { Tournament } from '../types';

export const Tournaments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'waiting' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (!user) return;
    getUserTournaments(user.uid)
      .then(setTournaments)
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = filter === 'all'
    ? tournaments
    : tournaments.filter(t => t.status === filter);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[20%] w-[40%] h-[40%] bg-amber-600/6 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[10%] w-[35%] h-[35%] bg-blue-600/6 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <ChevronRight size={16} className="rotate-180" />
              Ana Sayfa
            </button>
          </div>

          <button
            onClick={() => navigate('/tournaments/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Yeni Turnuva
          </button>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/15">
              <Trophy size={20} className="text-amber-400" />
            </div>
            Turnuvalarım
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-12">
            Oluşturduğun tüm turnuvalar
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/8"
        >
          {(['all', 'waiting', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {{ all: 'Tümü', waiting: 'Kayıt Açık', active: 'Aktif', completed: 'Bitti' }[f]}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center justify-center py-20 space-y-4 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Search size={24} className="text-slate-600" />
            </div>
            <div className="space-y-1">
              <p className="text-white font-medium">
                {filter === 'all' ? 'Henüz turnuva oluşturmadın' : 'Bu kategoride turnuva yok'}
              </p>
              <p className="text-slate-500 text-sm">
                {filter === 'all' && 'İlk turnuvanı oluşturmak için butona tıkla.'}
              </p>
            </div>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/tournaments/create')}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-sm font-semibold transition-colors mt-2"
              >
                <Plus size={16} />
                Turnuva Oluştur
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3 pb-8">
            {filtered.map((tournament, index) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                index={index}
                showManage
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
