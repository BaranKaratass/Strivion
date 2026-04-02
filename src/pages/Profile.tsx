import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  User, Zap, Trophy, Swords, Target, Shield, 
  ChevronRight, Edit3, Camera, Star, TrendingUp, Award 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import type { UserProfile } from '../types';
import { cn } from '../lib/utils';

export const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data() as UserProfile);
      }
    });
    return () => unsubscribe();
  }, [user]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const winRate = profile.stats.totalMatches > 0 
    ? Math.round((profile.stats.wins / profile.stats.totalMatches) * 100) 
    : 0;

  const levelProgress = ((profile.coins % 500) / 500) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[20%] w-[50%] h-[40%] bg-blue-600/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-purple-600/8 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ChevronRight size={16} className="rotate-180" />
          Ana Sayfa
        </motion.button>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-3xl border border-white/10 p-6 overflow-hidden"
        >
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-blue-500/10 to-transparent" />
          
          <div className="relative flex items-start gap-5">
            {/* Avatar */}
            <div className="relative group">
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden",
                "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-white/10",
                "shadow-[0_0_30px_rgba(59,130,246,0.15)]"
              )}>
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.displayName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-blue-400" />
                )}
              </div>
              <button 
                onClick={() => navigate('/profile/edit')}
                className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 rounded-lg border border-blue-500/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera size={12} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    {profile.displayName}
                  </h1>
                  <p className="text-slate-500 text-sm">{profile.email}</p>
                </div>
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Edit3 size={16} />
                </button>
              </div>

              {profile.bio && (
                <p className="text-sm text-slate-400 leading-relaxed">{profile.bio}</p>
              )}

              {/* Level & Coin Badges */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                  <Star size={12} className="fill-current" />
                  Level {profile.level}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                  <Zap size={12} className="fill-current" />
                  {profile.coins} Coin
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Seviye İlerlemesi</span>
              <span className="text-slate-400 font-medium">{Math.round(levelProgress)}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          <StatCard 
            icon={<Swords className="text-blue-400" size={18} />}
            label="Toplam Maç"
            value={profile.stats.totalMatches}
            delay={0.2}
          />
          <StatCard 
            icon={<Trophy className="text-amber-400" size={18} />}
            label="Kazanma"
            value={`${winRate}%`}
            delay={0.25}
          />
          <StatCard 
            icon={<Target className="text-emerald-400" size={18} />}
            label="Galibiyet"
            value={profile.stats.wins}
            delay={0.3}
          />
          <StatCard 
            icon={<TrendingUp className="text-red-400" size={18} />}
            label="Mağlubiyet"
            value={profile.stats.losses}
            delay={0.35}
          />
        </motion.div>

        {/* Tournament Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award size={16} className="text-amber-400" />
            Turnuva İstatistikleri
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <p className="text-2xl font-bold text-white">{profile.stats.tournamentsJoined}</p>
              <p className="text-xs text-slate-500">Katılınan Turnuva</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-bold text-amber-400">{profile.stats.tournamentsWon}</p>
              <p className="text-xs text-slate-500">Kazanılan Turnuva</p>
            </div>
          </div>
        </motion.div>

        {/* Favorite Games */}
        {profile.favoriteGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-3"
          >
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Star size={16} className="text-purple-400" />
              Favori Oyunlar
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteGames.map((game) => (
                <span 
                  key={game}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/15 text-purple-300 text-xs font-medium"
                >
                  {game}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Privacy Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-3"
        >
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield size={16} className="text-emerald-400" />
            Gizlilik Durumu
          </h2>
          <div className="space-y-2">
            <PrivacyBadge label="Turnuvalar" active={profile.privacy.showTournaments} />
            <PrivacyBadge label="İstatistikler" active={profile.privacy.showStats} />
            <PrivacyBadge label="Çevrimiçi Durumu" active={profile.privacy.showOnlineStatus} />
          </div>
          <button
            onClick={() => navigate('/profile/edit')}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
          >
            Gizlilik ayarlarını düzenle →
          </button>
        </motion.div>

        {/* Member Since */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-slate-600 pb-6"
        >
          Üyelik: {new Date(profile.createdAt).toLocaleDateString('tr-TR', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          })}
        </motion.p>
      </main>
    </div>
  );
};

// ─── Sub Components ──────────────────────────────────────

function StatCard({ icon, label, value, delay }: { 
  icon: React.ReactNode; label: string; value: string | number; delay: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white/[0.03] rounded-2xl border border-white/10 p-4 space-y-2 hover:bg-white/[0.05] transition-colors"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-black/40 border border-white/10">
          {icon}
        </div>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function PrivacyBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full",
        active 
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
          : "bg-red-500/10 text-red-400 border border-red-500/20"
      )}>
        {active ? 'Görünür' : 'Gizli'}
      </span>
    </div>
  );
}
