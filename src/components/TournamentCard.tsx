import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Users, Lock, Unlock, Zap, ChevronRight, Clock, Play, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Tournament } from '../../types';

const GAME_EMOJIS: Record<string, string> = {
  'Valorant': '🎯',
  'League of Legends': '⚔️',
  'CS2': '💣',
  'Fortnite': '🪂',
  'PUBG': '🪖',
  'Apex Legends': '🔥',
  'Dota 2': '🧙',
  'Rocket League': '🚀',
  'FIFA': '⚽',
  'Rainbow Six': '🛡️',
  'Overwatch 2': '🤖',
  'Call of Duty': '🔫',
  'Minecraft': '⛏️',
  'GTA V': '🏎️',
  'Brawl Stars': '⭐',
};

const STATUS_CONFIG = {
  waiting: {
    label: 'Kayıt Açık',
    icon: <Clock size={12} />,
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  active: {
    label: 'Devam Ediyor',
    icon: <Play size={12} className="fill-current" />,
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  completed: {
    label: 'Tamamlandı',
    icon: <CheckCircle size={12} />,
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
};

interface TournamentCardProps {
  tournament: Tournament;
  index?: number;
  showManage?: boolean;
}

export function TournamentCard({ tournament, index = 0, showManage = false }: TournamentCardProps) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[tournament.status];
  const emoji = GAME_EMOJIS[tournament.game] || '🎮';
  const participantCount = tournament.participantIds.length;
  const isFull = participantCount >= tournament.maxParticipants;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={() => navigate(`/tournaments/${tournament.id}`)}
      className={cn(
        'group relative p-5 rounded-2xl border cursor-pointer transition-all duration-300',
        'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20',
        tournament.status === 'completed' && 'opacity-60'
      )}
    >
      {/* Private Badge */}
      {tournament.isPrivate && (
        <div className="absolute top-3 right-3 p-1 rounded-md bg-purple-500/10 text-purple-400">
          <Lock size={12} />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Game Emoji */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
          {emoji}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Title & Status */}
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-semibold text-white text-base leading-tight truncate flex-1">
              {tournament.title}
            </h3>
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0',
              status.className
            )}>
              {status.icon}
              {status.label}
            </span>
          </div>

          {/* Game Name */}
          <p className="text-sm text-slate-500">{tournament.game}</p>

          {/* Meta Row */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Participants */}
            <div className={cn(
              'flex items-center gap-1.5 text-xs',
              isFull ? 'text-red-400' : 'text-slate-400'
            )}>
              <Users size={12} />
              <span>{participantCount}/{tournament.maxParticipants}</span>
            </div>

            {/* Prize Pool */}
            {tournament.prizePool > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <Zap size={12} className="fill-current" />
                <span>{tournament.prizePool} Coin</span>
              </div>
            )}

            {/* Privacy */}
            <div className="flex items-center gap-1 text-xs text-slate-500">
              {tournament.isPrivate
                ? <><Lock size={11} /> Özel</>
                : <><Unlock size={11} /> Açık</>
              }
            </div>
          </div>

          {/* Tournament Code */}
          <div className="flex items-center justify-between">
            <code className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-blue-300 font-mono tracking-wider">
              {tournament.code}
            </code>
            {showManage && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/${tournament.id}/manage`); }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
              >
                <Trophy size={11} />
                Yönet
              </button>
            )}
          </div>
        </div>

        <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}
