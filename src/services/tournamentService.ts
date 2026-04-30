import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Tournament, TournamentParticipant, CreateTournamentData, TournamentStatus } from '../types';
import type { User } from 'firebase/auth';

// ─── Benzersiz Kod Üretici ────────────────────────────────

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

async function generateUniqueCode(): Promise<string> {
  // Çakışma kontrolü — max 10 deneme
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode();
    const snap = await getDocs(
      query(collection(db, 'tournaments'), where('code', '==', code), limit(1))
    );
    if (snap.empty) return code;
  }
  throw new Error('Benzersiz kod üretilemedi, lütfen tekrar deneyin.');
}

// ─── Turnuva CRUD ─────────────────────────────────────────

export const createTournament = async (
  data: CreateTournamentData,
  user: User
): Promise<string> => {
  const code = await generateUniqueCode();
  const id = doc(collection(db, 'tournaments')).id;

  const tournament: Tournament = {
    id,
    code,
    title: data.title.trim(),
    description: data.description.trim(),
    game: data.game,
    ownerId: user.uid,
    ownerName: user.displayName || user.email?.split('@')[0] || 'Anonim',
    maxParticipants: data.maxParticipants,
    minRank: data.minRank,
    maxRank: data.maxRank,
    status: 'waiting',
    isPrivate: data.isPrivate,
    prizePool: data.prizePool,
    participantIds: [user.uid],
    createdAt: Date.now(),
    startedAt: null,
    completedAt: null,
  };

  await setDoc(doc(db, 'tournaments', id), tournament);

  // Sahibi otomatik katılımcı olarak ekle
  const participant: TournamentParticipant = {
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Anonim',
    avatarUrl: '',
    joinedAt: Date.now(),
    status: 'active',
  };
  await setDoc(doc(db, 'tournaments', id, 'participants', user.uid), participant);

  return id;
};

export const getTournament = async (id: string): Promise<Tournament | null> => {
  const snap = await getDoc(doc(db, 'tournaments', id));
  if (snap.exists()) return snap.data() as Tournament;
  return null;
};

export const getUserTournaments = async (uid: string): Promise<Tournament[]> => {
  const q = query(
    collection(db, 'tournaments'),
    where('ownerId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Tournament);
};

export const getTournamentParticipants = async (
  tournamentId: string
): Promise<TournamentParticipant[]> => {
  const snap = await getDocs(
    collection(db, 'tournaments', tournamentId, 'participants')
  );
  return snap.docs.map(d => d.data() as TournamentParticipant);
};

export const updateTournamentStatus = async (
  id: string,
  status: TournamentStatus
): Promise<void> => {
  const updates: Record<string, unknown> = { status };
  if (status === 'active') updates.startedAt = Date.now();
  if (status === 'completed') updates.completedAt = Date.now();
  await updateDoc(doc(db, 'tournaments', id), updates);
};

export const updateTournamentInfo = async (
  id: string,
  data: Partial<Pick<Tournament, 'title' | 'description' | 'prizePool' | 'isPrivate'>>
): Promise<void> => {
  await updateDoc(doc(db, 'tournaments', id), data);
};

export const deleteTournament = async (id: string): Promise<void> => {
  // Alt koleksiyon silimi (participants) — Firestore'da otomatik silinmez
  const participants = await getDocs(
    collection(db, 'tournaments', id, 'participants')
  );
  const deletePs = participants.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletePs);
  await deleteDoc(doc(db, 'tournaments', id));
};

export const removeParticipant = async (
  tournamentId: string,
  uid: string
): Promise<void> => {
  await deleteDoc(doc(db, 'tournaments', tournamentId, 'participants', uid));
  const ref = doc(db, 'tournaments', tournamentId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const current = (snap.data() as Tournament).participantIds;
    await updateDoc(ref, {
      participantIds: current.filter(id => id !== uid),
    });
  }
};

// ─── Turnuva Arama (Kod ile) ─────────────────────────────

export const findTournamentByCode = async (code: string): Promise<Tournament | null> => {
  const q = query(
    collection(db, 'tournaments'),
    where('code', '==', code.toUpperCase().trim()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Tournament;
};

// ─── Turnuvaya Katılma ────────────────────────────────────

export const joinTournament = async (
  tournamentId: string,
  user: User
): Promise<{ success: boolean; error?: string }> => {
  const ref = doc(db, 'tournaments', tournamentId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { success: false, error: 'Turnuva bulunamadı.' };
  }

  const tournament = snap.data() as Tournament;

  // Doğrulamalar
  if (tournament.status !== 'waiting') {
    return { success: false, error: 'Bu turnuva artık kayıt almıyor.' };
  }
  if (tournament.participantIds.length >= tournament.maxParticipants) {
    return { success: false, error: 'Turnuva dolu.' };
  }
  if (tournament.participantIds.includes(user.uid)) {
    return { success: false, error: 'Zaten bu turnuvaya katılmışsın.' };
  }
  if (tournament.ownerId === user.uid) {
    return { success: false, error: 'Kendi turnuvana tekrar katılamazsın.' };
  }

  // Katılımcı olarak ekle
  const participant: TournamentParticipant = {
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Anonim',
    avatarUrl: user.photoURL || '',
    joinedAt: Date.now(),
    status: 'active',
  };

  await setDoc(doc(db, 'tournaments', tournamentId, 'participants', user.uid), participant);

  // participantIds array'ini güncelle
  await updateDoc(ref, {
    participantIds: [...tournament.participantIds, user.uid],
  });

  // Kullanıcı istatistiklerini güncelle
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    'stats.tournamentsJoined': increment(1),
  });

  return { success: true };
};

// ─── Açık Turnuvaları Getir ───────────────────────────────

export const getPublicTournaments = async (): Promise<Tournament[]> => {
  const q = query(
    collection(db, 'tournaments'),
    where('isPrivate', '==', false),
    where('status', '==', 'waiting'),
    orderBy('createdAt', 'desc'),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Tournament);
};

// ─── Katılınan Turnuvaları Getir ──────────────────────────

export const getJoinedTournaments = async (uid: string): Promise<Tournament[]> => {
  const q = query(
    collection(db, 'tournaments'),
    where('participantIds', 'array-contains', uid),
    orderBy('createdAt', 'desc'),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Tournament);
};

// ─── Test İçin Bot Ekleme (Sadece Geliştirme Aşaması İçin) ───

export const addTestBot = async (tournamentId: string): Promise<void> => {
  const ref = doc(db, 'tournaments', tournamentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const tournament = snap.data() as Tournament;
  if (tournament.participantIds.length >= tournament.maxParticipants) return;

  const botUid = `bot_${Math.random().toString(36).substring(2, 9)}`;
  const botName = `Test Bot ${Math.floor(Math.random() * 1000)}`;

  const participant: TournamentParticipant = {
    uid: botUid,
    displayName: botName,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${botUid}`,
    joinedAt: Date.now(),
    status: 'active',
  };

  await setDoc(doc(db, 'tournaments', tournamentId, 'participants', botUid), participant);
  
  await updateDoc(ref, {
    participantIds: arrayUnion(botUid),
  });
};

// Suppress unused import warning — serverTimestamp kept for future use
void serverTimestamp;
