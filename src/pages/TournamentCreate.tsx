import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Trophy, Gamepad2, Users, Zap, Lock, Unlock, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createTournament } from '../services/tournamentService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import type { CreateTournamentData } from '../types';

const GAMES = [
  'Valorant', 'League of Legends', 'CS2', 'Fortnite', 'PUBG',
  'Apex Legends', 'Dota 2', 'Rocket League', 'FIFA', 'Rainbow Six',
  'Overwatch 2', 'Call of Duty', 'Minecraft', 'GTA V', 'Brawl Stars',
];

const RANKS = ['', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];
const MAX_SIZES = [4, 8, 16, 32, 64];

const INITIAL: CreateTournamentData = {
  title: '',
  description: '',
  game: '',
  maxParticipants: 8,
  minRank: '',
  maxRank: '',
  isPrivate: false,
  prizePool: 0,
};

export const TournamentCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateTournamentData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof CreateTournamentData, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const isValid = form.title.trim().length >= 3 && form.game !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isValid) return;
    setError('');
    setLoading(true);
    try {
      const id = await createTournament(form, user);
      navigate(`/tournaments/${id}`);
    } catch {
      setError('Turnuva oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[40%] bg-blue-600/7 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[35%] bg-purple-600/6 blur-[150px] rounded-full" />
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
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/15">
              <Trophy size={20} className="text-blue-400" />
            </div>
            Yeni Turnuva Oluştur
          </h1>
          <p className="text-slate-500 text-sm ml-12">
            Turnuva bilgilerini doldur ve oyuncuları davet et.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Temel Bilgiler */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-4"
          >
            <h2 className="text-sm font-semibold text-white">Temel Bilgiler</h2>

            <Input
              label="Turnuva Adı"
              placeholder="ör. Strivion Valorant Cup #1"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              maxLength={50}
              required
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-400 ml-1">Açıklama</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Turnuva kuralları, format, ödüller hakkında bilgi ver..."
                maxLength={500}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              />
              <p className="text-xs text-slate-600 ml-1">{form.description.length}/500</p>
            </div>
          </motion.div>

          {/* Oyun Seçimi */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-3"
          >
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Gamepad2 size={15} className="text-purple-400" />
              Oyun Seç
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {GAMES.map(game => (
                <button
                  key={game}
                  type="button"
                  onClick={() => set('game', game)}
                  className={cn(
                    'py-2 px-3 rounded-xl text-xs font-medium transition-all text-left truncate',
                    form.game === game
                      ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
                      : 'bg-white/5 border border-white/8 text-slate-400 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {game}
                </button>
              ))}
            </div>
            {!form.game && (
              <p className="text-xs text-red-400/70 ml-1">Bir oyun seçmelisin.</p>
            )}
          </motion.div>

          {/* Katılımcı & Ödül */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-4"
          >
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users size={15} className="text-emerald-400" />
              Katılımcı & Ödül
            </h2>

            {/* Max Participants */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Maksimum Katılımcı</label>
              <div className="grid grid-cols-5 gap-2">
                {MAX_SIZES.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => set('maxParticipants', size)}
                    className={cn(
                      'py-2.5 rounded-xl text-sm font-semibold transition-all',
                      form.maxParticipants === size
                        ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-300'
                        : 'bg-white/5 border border-white/8 text-slate-400 hover:bg-white/10'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Prize Pool */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1 flex items-center gap-1.5">
                <Zap size={13} className="text-amber-400 fill-current" />
                Ödül Havuzu (Coin)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={50}
                  value={form.prizePool}
                  onChange={e => set('prizePool', Number(e.target.value))}
                  className="flex-1 accent-amber-400"
                />
                <span className="text-amber-400 font-bold tabular-nums w-16 text-right">
                  {form.prizePool} <span className="text-xs font-normal text-amber-400/60">coin</span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Rank & Gizlilik */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-4"
          >
            <h2 className="text-sm font-semibold text-white">Ek Ayarlar</h2>

            {/* Min/Max Rank */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400 ml-1">Min. Rank</label>
                <select
                  value={form.minRank}
                  onChange={e => set('minRank', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                >
                  {RANKS.map(r => (
                    <option key={r} value={r} className="bg-[#0a0a0c]">
                      {r || 'Sınırsız'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400 ml-1">Max. Rank</label>
                <select
                  value={form.maxRank}
                  onChange={e => set('maxRank', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                >
                  {RANKS.map(r => (
                    <option key={r} value={r} className="bg-[#0a0a0c]">
                      {r || 'Sınırsız'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between py-1">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  {form.isPrivate ? (
                    <><Lock size={14} className="text-purple-400" /> Özel Turnuva</>
                  ) : (
                    <><Unlock size={14} className="text-emerald-400" /> Açık Turnuva</>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {form.isPrivate
                    ? 'Sadece turnuva koduyla katılınabilir.'
                    : 'Herkes turnuvayı görebilir ve katılabilir.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => set('isPrivate', !form.isPrivate)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors duration-300',
                  form.isPrivate ? 'bg-purple-600' : 'bg-white/10'
                )}
              >
                <motion.div
                  animate={{ x: form.isPrivate ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                Turnuva oluşturulduğunda benzersiz bir katılım kodu otomatik atanır. Bu kodu paylaşarak oyuncuları davet edebilirsin.
              </p>
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pb-8"
          >
            <Button
              type="submit"
              loading={loading}
              disabled={!isValid || loading}
              variant="secondary"
            >
              <Trophy size={18} />
              Turnuvayı Oluştur
            </Button>
          </motion.div>

        </form>
      </main>
    </div>
  );
};
