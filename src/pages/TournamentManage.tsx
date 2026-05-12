import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Settings, Play, CheckCircle, Trash2,
  UserX, AlertTriangle, Eye, Lock, Unlock, Crown, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../hooks/useTournament';
import {
  updateTournamentStatus,
  updateTournamentInfo,
  deleteTournament,
  removeParticipant,
  addTestBot,
} from '../services/tournamentService';
import { generateBracket, updateMatchWinner } from '../services/bracketService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';

export const TournamentManage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tournament, participants, matches, loading } = useTournament(id);

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingUid, setRemovingUid] = useState<string | null>(null);
  const [updatingMatchId, setUpdatingMatchId] = useState<string | null>(null);

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
      if (newStatus === 'active') {
        const res = await generateBracket(id, tournament.participantIds);
        if (!res.success) {
          alert(res.error);
          setStatusLoading(false);
          return;
        }
      }
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

  const handleSelectWinner = async (matchId: string, winnerId: string) => {
    if (!id) return;
    setUpdatingMatchId(matchId);
    try {
      await updateMatchWinner(id, matchId, winnerId);
    } finally {
      setUpdatingMatchId(null);
    }
  };

  const validParticipantCounts = [4, 8, 16, 32, 64];
  const isValidCount = validParticipantCounts.includes(participants.length);

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
                disabled={statusLoading || !isValidCount}
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

          {tournament.status === 'waiting' && !isValidCount && (
            <p className="text-xs text-amber-400/70">
              Turnuvayı başlatmak için tam 4, 8, 16, 32 veya 64 katılımcı gerekli. Şu an: {participants.length}
            </p>
          )}
        </motion.div>

        {/* Canlı Maç Yönetimi */}
        {tournament.status === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Play size={15} className="text-emerald-400" />
                Canlı Maç Yönetimi
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded-md">
                Admin Kontrolü
              </span>
            </div>

            <div className="space-y-3">
              {matches.filter(m => m.status === 'active').length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-xl">
                  <p className="text-xs text-slate-500 italic">Şu an aktif maç bulunmuyor.</p>
                </div>
              ) : (
                matches.filter(m => m.status === 'active').map(match => {
                  const p1 = participants.find(p => p.uid === match.player1Id);
                  const p2 = participants.find(p => p.uid === match.player2Id);

                  return (
                    <div key={match.id} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                        <span>Maç ID: {match.id}</span>
                        <span>Tur: {match.round}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Player 1 */}
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                            <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center overflow-hidden">
                              {p1?.avatarUrl ? <img src={p1.avatarUrl} className="w-full h-full object-cover" /> : <User size={12} />}
                            </div>
                            <span className="text-xs font-semibold truncate flex-1">{p1?.displayName || 'TBD'}</span>
                          </div>
                          <button
                            onClick={() => handleSelectWinner(match.id, match.player1Id!)}
                            disabled={!!updatingMatchId || !match.player1Id}
                            className="w-full py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all uppercase disabled:opacity-30"
                          >
                            {updatingMatchId === match.id ? '...' : 'Kazanan Seç'}
                          </button>
                        </div>

                        <div className="px-2 text-slate-600 font-black italic">VS</div>

                        {/* Player 2 */}
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                            <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center overflow-hidden">
                              {p2?.avatarUrl ? <img src={p2.avatarUrl} className="w-full h-full object-cover" /> : <User size={12} />}
                            </div>
                            <span className="text-xs font-semibold truncate flex-1">{p2?.displayName || 'TBD'}</span>
                          </div>
                          <button
                            onClick={() => handleSelectWinner(match.id, match.player2Id!)}
                            disabled={!!updatingMatchId || !match.player2Id}
                            className="w-full py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all uppercase disabled:opacity-30"
                          >
                            {updatingMatchId === match.id ? '...' : 'Kazanan Seç'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Katılımcılar ({participants.length}/{tournament.maxParticipants})
            </h2>
            {tournament.status === 'waiting' && (
              <button
                onClick={() => addTestBot(tournament.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                + Bot Ekle (Test)
              </button>
            )}
          </div>

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
                        : <UserX size={14} />
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
                Turnuvayı İptal Et
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
                  Turnuva odası kapatılacak ve tüm katılımcılar çıkarılacak. Devam etmek istiyor musun?
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
                    Evet, İptal Et
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
