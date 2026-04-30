import { motion } from 'framer-motion'
import { Rocket, Shield, Zap, Code2, LogOut, User, ChevronRight, Trophy, Plus, Globe, Ticket } from 'lucide-react'
import { cn } from './lib/utils'
import { auth, db } from './lib/firebase'
import { signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { useAuth } from './context/AuthContext'
import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import type { UserProfile } from './types'

function App() {
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

  const handleLogout = () => {
    signOut(auth);
  };
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 flex flex-col items-center justify-center p-6 font-sans selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Top-right Profile Button */}
      <div className="fixed top-5 right-5 z-20">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center overflow-hidden">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={14} className="text-blue-400" />
            )}
          </div>
          <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
            {profile?.displayName || user?.email?.split('@')[0]}
          </span>
          <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </button>
      </div>

      <main className="relative z-10 max-w-3xl w-full text-center space-y-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-amber-400 text-sm font-medium mb-4">
            <Zap size={16} className="fill-current" />
            <span>{profile?.coins || 0} Coin Bakiye</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Strivion <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Arena</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
            Rekabetçi turnuvalara katıl, yeteneklerini kanıtla ve ödüller kazan. 
            Strivion dünyasına hoş geldin!
          </p>
        </motion.div>

        {/* Core Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto"
        >
          <button
            onClick={() => navigate('/tournaments/create')}
            className="flex items-center gap-4 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all group"
          >
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Plus size={22} className="text-blue-400" />
            </div>
            <div className="text-left flex-1">
              <p className="text-base font-bold text-white">Turnuva Oluştur</p>
              <p className="text-sm text-slate-400">Kendi turnuvanı düzenle</p>
            </div>
            <ChevronRight size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/tournaments/join')}
            className="flex items-center gap-4 p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all group"
          >
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Ticket size={22} className="text-purple-400" />
            </div>
            <div className="text-left flex-1">
              <p className="text-base font-bold text-white">Kod ile Katıl</p>
              <p className="text-sm text-slate-400">Özel turnuvaya gir</p>
            </div>
            <ChevronRight size={18} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/tournaments/browse')}
            className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group"
          >
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <Globe size={22} className="text-emerald-400" />
            </div>
            <div className="text-left flex-1">
              <p className="text-base font-bold text-white">Turnuva Keşfet</p>
              <p className="text-sm text-slate-400">Açık turnuvaları listele</p>
            </div>
            <ChevronRight size={18} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/tournaments')}
            className="flex items-center gap-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all group"
          >
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Trophy size={22} className="text-amber-400" />
            </div>
            <div className="text-left flex-1">
              <p className="text-base font-bold text-white">Turnuvalarım</p>
              <p className="text-sm text-slate-400">Yönet ve takip et</p>
            </div>
            <ChevronRight size={18} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
          </button>
        </motion.div>

        {/* CTA & Logout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-8 flex flex-col items-center gap-4"
        >
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Güvenli Çıkış Yap
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 text-slate-600 text-xs tracking-wider">
        STRIVION &copy; 2026
      </footer>
    </div>
  );
}

export default App;
