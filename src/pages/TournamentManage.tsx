import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Settings, Play, CheckCircle, Trash2,
  UserMinus, AlertTriangle, Eye, Lock, Unlock, Crown, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../hooks/useTournament';
import {
  updateTournamentStatus,
  updateTournamentInfo,
  deleteTournament,
  removeParticipant,
} from '../services/tournamentService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';

export const TournamentManage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tournament, participants, loading } = useTournament(id);

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingUid, setRemovingUid] = useState<string | null>(null);

  // Guard — sadece sahip erişebilir
  if (!loading && tournament && user?.uid !== tournament.ownerId) {
    navigate(`/tournaments/${id}`);
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <p className="text-slate-400">Turnuva bulunamadı.</p>
      </div>
    );
  }

  // Edit alanlarını başlat (ilk render'dan sonra)
  if (editTitle === '' && tournament.title) {
    setEditTitle(tournament.title);
    setEditDesc(tournament.description);
  }

  const handleSaveInfo = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateTournamentInfo(id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'completed') => {
    if (!id) return;
    setStatusLoading(true);
    try {
      await updateTournamentStatus(id, newStatus);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteTournament(id);
      navigate('/tournaments');
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveParticipant = async (uid: string) => {
    if (!id) return;
    setRemovingUid(uid);
    try {
      await removeParticipant(id, uid);
    } finally {
      setRemovingUid(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[45%] h-[40%] bg-purple-600/6 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[35%] bg-red-600/4 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => navigate(`/tournaments/${tournament.id}`)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ChevronRight size={16} className="rotate-180" />
            Turnuva Detayı
          </button>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Settings size={13} />
            Yönetim Paneli
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h1 className="text-xl font-bold text-white truncate">{tournament.title}</h1>
          <p className="text-slate-500 text-sm">{tournament.game}</p>
        </motion.div>

        {/* Durum Yönetimi */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Eye size={15} className="text-blue-400" />
            Turnuva Durumu
          </h2>

          <div className="flex gap-2 flex-wrap">
            {tournament.status === 'waiting' && (
              <button
                onClick={() => handleStatusChange('active')}
                disabled={statusLoading || participants.length < 2}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  'bg-emerald-600/20 border border-emerald-500/25 text-emerald-300',
                  'hover:bg-emerald-600/30 disabled:opacity-40 disabled:cursor-not-allowed'
                )}
              >
                <Play size={15} className="fill-current" />
                {statusLoading ? 'İşleniyor...' : 'Turnuvayı Başlat'}
              </button>
            )}
            {tournament.status === 'active' && (
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={statusLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600/20 border border-blue-500/25 text-blue-300 hover:bg-blue-600/30 disabled:opacity-40 transition-all"
              >
                <CheckCircle size={15} />
                {statusLoading ? 'İşleniyor...' : 'Turnuvayı Bitir'}
              </button>
            )}
            {tournament.status === 'completed' && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-400 bg-white/5 border border-white/10">
                <CheckCircle size={15} />
                Turnuva tamamlandı
              </div>
            )}
          </div>

          {tournament.status === 'waiting' && participants.length < 2 && (
            <p className="text-xs text-amber-400/70">
              Turnuvayı başlatmak için en az 2 katılımcı gerekli.
            </p>
          )}
        </motion.div>

        {/* Bilgi Düzenleme */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-white">Bilgileri Düzenle</h2>

          <Input
            label="Turnuva Adı"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            maxLength={50}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-400 ml-1">Açıklama</label>
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
            />
          </div>

          <Button
            onClick={handleSaveInfo}
            loading={saving}
            disabled={!editTitle.trim() || saving}
            variant="outline"
          >
            Değişiklikleri Kaydet
          </Button>
        </motion.div>

        {/* Katılımcı Yönetimi */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-3"
        >
          <h2 className="text-sm font-semibold text-white">
            Katılımcılar ({participants.length}/{tournament.maxParticipants})
          </h2>

          {participants.length === 0 ? (
            <p className="text-sm text-slate-500">Henüz katılımcı yok.</p>
          ) : (
            <div className="space-y-2">
              {participants.map(p => (
                <div key={p.uid} className="flex items-center gap-3 py-1.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {p.avatarUrl
                      ? <img src={p.avatarUrl} alt={p.displayName} className="w-full h-full object-cover" />
                      : <User size={14} className="text-blue-400" />
                    }
                  </div>
                  <span className="text-sm text-slate-300 flex-1">{p.displayName}</span>

                  {p.uid === tournament.ownerId ? (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <Crown size={11} /> Sahip
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRemoveParticipant(p.uid)}
                      disabled={!!removingUid}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30"
                    >
                      {removingUid === p.uid
                        ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <UserMinus size={14} />
                      }
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Tehlikeli Bölge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-red-500/5 rounded-2xl border border-red-500/15 p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle size={15} />
            Tehlikeli Bölge
          </h2>

          <AnimatePresence mode="wait">
            {!deleteConfirm ? (
              <motion.button
                key="trigger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
              >
                <Trash2 size={15} />
                Turnuvayı Sil
              </motion.button>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-slate-300">
                  <span className="text-red-400 font-semibold">Bu işlem geri alınamaz.</span>{' '}
                  Tüm katılımcı verileri de silinecek. Devam etmek istiyor musun?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                  >
                    {deleting
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Trash2 size={14} />
                    }
                    Evet, Sil
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                  >
                    İptal
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="pb-8" />
      </main>
    </div>
  );
};

// Needed for JSX in this file
const React_unused = React;
void React_unused;
void Lock;
void Unlock;
