import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight, Copy, CheckCheck, Users, Zap, Trophy,
  Lock, Unlock, Clock, Play, CheckCircle, Settings, User,
  Crown, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../hooks/useTournament';
import { cn } from '../lib/utils';

const STATUS_CONFIG = {
  waiting: { label: 'Kayıt Açık', icon: <Clock size={14} />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  active: { label: 'Devam Ediyor', icon: <Play size={14} className="fill-current" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  completed: { label: 'Tamamlandı', icon: <CheckCircle size={14} />, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
};

const GAME_EMOJIS: Record<string, string> = {
  'Valorant': '🎯', 'League of Legends': '⚔️', 'CS2': '💣', 'Fortnite': '🪂',
  'PUBG': '🪖', 'Apex Legends': '🔥', 'Dota 2': '🧙', 'Rocket League': '🚀',
  'FIFA': '⚽', 'Rainbow Six': '🛡️', 'Overwatch 2': '🤖', 'Call of Duty': '🔫',
  'Minecraft': '⛏️', 'GTA V': '🏎️', 'Brawl Stars': '⭐',
};

export const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tournament, participants, loading, error } = useTournament(id);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!tournament) return;
    navigator.clipboard.writeText(tournament.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Trophy size={40} className="text-slate-600" />
        <p className="text-white font-semibold">Turnuva bulunamadı</p>
        <p className="text-slate-500 text-sm">{error}</p>
        <button onClick={() => navigate('/tournaments')} className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          Turnuvalarıma dön
        </button>
      </div>
    );
  }

  const status = STATUS_CONFIG[tournament.status];
  const isOwner = user?.uid === tournament.ownerId;
  const isFull = tournament.participantIds.length >= tournament.maxParticipants;
  const emoji = GAME_EMOJIS[tournament.game] || '🎮';
  const fillPercent = (tournament.participantIds.length / tournament.maxParticipants) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[15%] w-[50%] h-[40%] bg-blue-600/7 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[35%] bg-purple-600/5 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Back + Manage */}
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
          {isOwner && (
            <button
              onClick={() => navigate(`/tournaments/${tournament.id}/manage`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <Settings size={14} />
              Yönet
            </button>
          )}
        </motion.div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-3xl border border-white/10 p-6 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-500/8 to-transparent" />

          <div className="relative space-y-4">
            {/* Game + Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{emoji}</span>
                <div>
                  <p className="text-xs text-slate-500">{tournament.game}</p>
                  <h1 className="text-xl font-bold text-white leading-tight">{tournament.title}</h1>
                </div>
              </div>
              <span className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
                status.bg, status.color
              )}>
                {status.icon}
                {status.label}
              </span>
            </div>

            {/* Description */}
            {tournament.description && (
              <p className="text-sm text-slate-400 leading-relaxed">{tournament.description}</p>
            )}

            {/* Meta Badges */}
            <div className="flex flex-wrap gap-2">
              <MetaBadge icon={<Users size={12} />} label={`${tournament.participantIds.length}/${tournament.maxParticipants} Oyuncu`} />
              {tournament.prizePool > 0 && (
                <MetaBadge icon={<Zap size={12} className="fill-current text-amber-400" />} label={`${tournament.prizePool} Coin Ödül`} color="amber" />
              )}
              <MetaBadge
                icon={tournament.isPrivate ? <Lock size={12} /> : <Unlock size={12} />}
                label={tournament.isPrivate ? 'Özel' : 'Açık'}
              />
              {tournament.minRank && (
                <MetaBadge icon={<Shield size={12} />} label={`${tournament.minRank}${tournament.maxRank ? ` – ${tournament.maxRank}` : '+'}`} />
              )}
            </div>
          </div>
        </motion.div>

        {/* Tournament Code */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-3"
        >
          <p className="text-sm font-semibold text-white">Turnuva Kodu</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-center text-2xl font-bold tracking-[0.3em] text-blue-300 font-mono bg-blue-500/5 border border-blue-500/15 rounded-xl py-3">
              {tournament.code}
            </code>
            <button
              onClick={copyCode}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all text-xs font-medium',
                copied
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
              )}
            >
              {copied ? <CheckCheck size={18} /> : <Copy size={18} />}
              {copied ? 'Kopyalandı' : 'Kopyala'}
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Bu kodu paylaşarak arkadaşlarını turnuvaya davet edebilirsin.
          </p>
        </motion.div>

        {/* Slot Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-3"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 font-medium">Doluluk</span>
            <span className={cn('font-semibold', isFull ? 'text-red-400' : 'text-white')}>
              {tournament.participantIds.length} / {tournament.maxParticipants}
              {isFull && ' — Dolu'}
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPercent}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={cn(
                'h-full rounded-full',
                fillPercent >= 100 ? 'bg-red-500' : fillPercent >= 75 ? 'bg-amber-500' : 'bg-blue-500'
              )}
            />
          </div>
        </motion.div>

        {/* Participants */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-3"
        >
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users size={15} className="text-blue-400" />
            Katılımcılar ({participants.length})
          </h2>

          {participants.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">Henüz katılımcı yok.</p>
          ) : (
            <div className="space-y-2">
              {participants.map(p => (
                <div key={p.uid} className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {p.avatarUrl
                      ? <img src={p.avatarUrl} alt={p.displayName} className="w-full h-full object-cover" />
                      : <User size={14} className="text-blue-400" />
                    }
                  </div>
                  <span className="text-sm text-slate-300 flex-1">{p.displayName}</span>
                  {p.uid === tournament.ownerId && (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <Crown size={11} /> Sahip
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Katıl CTA (Hafta 5) */}
        {!isOwner && tournament.status === 'waiting' && !isFull && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-emerald-500/5 rounded-2xl border border-emerald-500/10 p-5 text-center space-y-2"
          >
            <p className="text-sm text-slate-400">Bu turnuvaya katılmak ister misin?</p>
            <button
              disabled
              className="w-full py-3 rounded-xl bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-sm font-semibold opacity-50 cursor-not-allowed"
            >
              Katıl — Hafta 5'te aktif olacak
            </button>
          </motion.div>
        )}

        {/* Owner Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-slate-600 pb-6"
        >
          Oluşturan: {tournament.ownerName} •{' '}
          {new Date(tournament.createdAt).toLocaleDateString('tr-TR')}
        </motion.p>
      </main>
    </div>
  );
};

function MetaBadge({ icon, label, color = 'default' }: { icon: React.ReactNode; label: string; color?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
      color === 'amber'
        ? 'bg-amber-500/10 border border-amber-500/15 text-amber-400'
        : 'bg-white/5 border border-white/10 text-slate-400'
    )}>
      {icon}
      {label}
    </span>
  );
}
