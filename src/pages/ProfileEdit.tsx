import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Camera, User, Save, Loader2, X, Plus,
  Shield, Eye, EyeOff, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { updateUserProfile, updatePrivacySettings, uploadAvatar } from '../services/userService';
import type { UserProfile, PrivacySettings } from '../types';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const POPULAR_GAMES = [
  'Valorant', 'League of Legends', 'CS2', 'Fortnite', 'PUBG',
  'Apex Legends', 'Dota 2', 'Rocket League', 'FIFA', 'Rainbow Six',
  'Overwatch 2', 'Call of Duty', 'Minecraft', 'GTA V', 'Brawl Stars'
];

export const ProfileEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteGames, setFavoriteGames] = useState<string[]>([]);
  const [customGame, setCustomGame] = useState('');
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showTournaments: true,
    showStats: true,
    showOnlineStatus: true,
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        setDisplayName(data.displayName || '');
        setBio(data.bio || '');
        setFavoriteGames(data.favoriteGames || []);
        setPrivacy(data.privacy || {
          showTournaments: true,
          showStats: true,
          showOnlineStatus: true,
        });
      }
    });
    return () => unsubscribe();
  }, [user]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleGame = (game: string) => {
    setFavoriteGames(prev => 
      prev.includes(game) 
        ? prev.filter(g => g !== game) 
        : prev.length < 5 ? [...prev, game] : prev
    );
  };

  const addCustomGame = () => {
    if (customGame.trim() && !favoriteGames.includes(customGame.trim()) && favoriteGames.length < 5) {
      setFavoriteGames(prev => [...prev, customGame.trim()]);
      setCustomGame('');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      // Avatar yükle (varsa)
      if (avatarFile) {
        setUploadingAvatar(true);
        await uploadAvatar(user.uid, avatarFile);
        setUploadingAvatar(false);
        setAvatarFile(null);
      }

      // Profil bilgilerini güncelle
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        favoriteGames,
      });

      // Gizlilik ayarlarını güncelle
      await updatePrivacySettings(user.uid, privacy);

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate('/profile');
      }, 1500);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      alert('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[30%] w-[40%] h-[40%] bg-blue-600/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[20%] w-[35%] h-[35%] bg-emerald-600/6 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ChevronRight size={16} className="rotate-180" />
            Geri
          </button>
          <h1 className="text-lg font-semibold text-white">Profili Düzenle</h1>
          <div className="w-16" /> {/* spacer */}
        </motion.div>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className={cn(
              "w-28 h-28 rounded-3xl flex items-center justify-center overflow-hidden",
              "bg-gradient-to-br from-blue-500/20 to-purple-500/20",
              "border-2 border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.15)]",
              "group-hover:border-blue-500/30 transition-all duration-300"
            )}>
              {(avatarPreview || profile.avatarUrl) ? (
                <img 
                  src={avatarPreview || profile.avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-blue-400" />
              )}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 rounded-3xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>

            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-3xl bg-black/70 flex items-center justify-center">
                <Loader2 size={24} className="text-blue-400 animate-spin" />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarSelect}
          />

          <p className="text-xs text-slate-500">
            JPG, PNG veya WebP • Maks. 5MB
          </p>
        </motion.div>

        {/* Form Fields */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-5"
        >
          <h2 className="text-sm font-semibold text-white">Kişisel Bilgiler</h2>
          
          <Input
            label="Görünen İsim"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Kullanıcı adını gir"
            maxLength={30}
          />

          <div className="space-y-1.5 w-full">
            <label className="text-sm font-medium text-slate-400 ml-1">Biyografi</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Kendinden birkaç cümleyle bahset..."
              maxLength={200}
              rows={3}
              className={cn(
                "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 resize-none",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              )}
            />
            <p className="text-xs text-slate-600 ml-1">{bio.length}/200</p>
          </div>
        </motion.div>

        {/* Favorite Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Favori Oyunlar</h2>
            <span className="text-xs text-slate-500">{favoriteGames.length}/5</span>
          </div>

          {/* Selected Games */}
          <AnimatePresence>
            {favoriteGames.length > 0 && (
              <motion.div layout className="flex flex-wrap gap-2">
                {favoriteGames.map((game) => (
                  <motion.button
                    key={game}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => toggleGame(game)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-medium hover:bg-red-500/15 hover:border-red-500/25 hover:text-red-300 transition-all group"
                  >
                    {game}
                    <X size={12} className="opacity-50 group-hover:opacity-100" />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Popular Games Grid */}
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_GAMES.filter(g => !favoriteGames.includes(g)).map((game) => (
              <button
                key={game}
                onClick={() => toggleGame(game)}
                disabled={favoriteGames.length >= 5}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs transition-all",
                  favoriteGames.length >= 5
                    ? "bg-white/3 text-slate-600 cursor-not-allowed"
                    : "bg-white/5 border border-white/8 text-slate-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {game}
              </button>
            ))}
          </div>

          {/* Custom Game */}
          <div className="flex gap-2">
            <input
              value={customGame}
              onChange={(e) => setCustomGame(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomGame()}
              placeholder="Başka bir oyun ekle..."
              maxLength={30}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
            />
            <button
              onClick={addCustomGame}
              disabled={!customGame.trim() || favoriteGames.length >= 5}
              className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/20 text-blue-400 hover:bg-blue-600/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield size={16} className="text-emerald-400" />
            Gizlilik Ayarları
          </h2>

          <PrivacyToggle
            label="Turnuvaları Göster"
            description="Diğer oyuncular katıldığın turnuvaları görebilir."
            active={privacy.showTournaments}
            onChange={(val) => setPrivacy(prev => ({ ...prev, showTournaments: val }))}
          />
          <div className="h-px bg-white/5" />
          <PrivacyToggle
            label="İstatistikleri Göster"
            description="Kazanma oranı, toplam maç gibi verilerin profilinde görünür."
            active={privacy.showStats}
            onChange={(val) => setPrivacy(prev => ({ ...prev, showStats: val }))}
          />
          <div className="h-px bg-white/5" />
          <PrivacyToggle
            label="Çevrimiçi Durumu"
            description="Diğer kullanıcılar çevrimiçi olduğunu görebilir."
            active={privacy.showOnlineStatus}
            onChange={(val) => setPrivacy(prev => ({ ...prev, showOnlineStatus: val }))}
          />
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pb-8"
        >
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={saving || !displayName.trim()}
            className={cn(
              saved && "!bg-emerald-600 !hover:bg-emerald-600"
            )}
          >
            {saved ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                Kaydedildi!
              </span>
            ) : saving ? (
              uploadingAvatar ? 'Fotoğraf yükleniyor...' : 'Kaydediliyor...'
            ) : (
              <span className="flex items-center gap-2">
                <Save size={18} />
                Değişiklikleri Kaydet
              </span>
            )}
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

// ─── Sub Components ──────────────────────────────────────

function PrivacyToggle({ label, description, active, onChange }: {
  label: string;
  description: string;
  active: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!active)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0",
          active ? "bg-emerald-600" : "bg-white/10"
        )}
      >
        <motion.div
          animate={{ x: active ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          {active ? (
            <Eye size={8} className="text-emerald-600" />
          ) : (
            <EyeOff size={8} className="text-slate-400" />
          )}
        </motion.div>
      </button>
    </div>
  );
}
