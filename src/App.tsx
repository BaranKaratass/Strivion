import { motion } from 'framer-motion'
import { Rocket, Shield, Zap, Code2, LogOut, User, ChevronRight, Trophy, Plus } from 'lucide-react'
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

      <main className="relative z-10 max-w-4xl w-full text-center space-y-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="fill-current text-amber-400" />
              <span>{profile?.coins || 0} Coin</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <span>Hoş geldin, {user?.email?.split('@')[0]}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Strivion <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 whitespace-nowrap">Yeni Nesil</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Flutter'dan React'e evrilen, hızı ve şıklığıyla büyüleyen yeni deneyiminiz için temeller atıldı. 
            Haftalık plana göre ilerliyoruz.
          </p>
        </motion.div>

        {/* Status Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left"
        >
          <StatusCard 
            icon={<Rocket className="text-blue-400" />}
            title="Proje Başlatıldı"
            desc="Vite + React (TypeScript) iskeleti kuruldu."
            done
          />
          <StatusCard 
            icon={<Code2 className="text-emerald-400" />}
            title="Modern Stack"
            desc="Tailwind v4, Framer Motion ve Lucide entegre edildi."
            done
          />
          <StatusCard 
            icon={<Shield className="text-blue-400" />}
            title="Firebase & Auth"
            desc="Giriş, kayıt, profil, coin sistemi tam çalışıyor."
            done
          />
          <StatusCard 
            icon={<Trophy className="text-amber-400" />}
            title="Turnuva Sistemi"
            desc="Oluşturma, yönetim, detay sayfaları tamamlandı."
            done
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-2 gap-3 text-left"
        >
          <button
            onClick={() => navigate('/tournaments')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 hover:bg-amber-500/10 transition-all group"
          >
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Trophy size={18} className="text-amber-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Turnuvalarım</p>
              <p className="text-xs text-slate-500">Yönet ve katıl</p>
            </div>
            <ChevronRight size={14} className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/tournaments/create')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 hover:bg-blue-500/10 transition-all group"
          >
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Plus size={18} className="text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Yeni Turnuva</p>
              <p className="text-xs text-slate-500">Hemen oluştur</p>
            </div>
            <ChevronRight size={14} className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors" />
          </button>
        </motion.div>

        {/* CTA & Logout */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-4 flex flex-col items-center gap-4"
        >
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut size={16} />
            Sistemden Güvenli Çıkış Yap
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 text-slate-500 text-sm">
        Strivion &copy; 2026 • React Dönüşüm Yolculuğu
      </footer>
    </div>
  )
}

function StatusCard({ icon, title, desc, done, pending }: { icon: React.ReactNode, title: string, desc: string, done?: boolean, pending?: boolean }) {
  return (
    <div className={cn(
      "p-5 rounded-2xl border transition-all duration-300",
      done ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-black/20 border-white/5 opacity-50",
      pending && "bg-amber-500/5 border-amber-500/10"
    )}>
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-black/40 border border-white/10">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-white flex items-center gap-2">
            {title}
            {done && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
            {pending && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
          </h3>
          <p className="text-sm text-slate-400 leading-snug">
            {desc}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
