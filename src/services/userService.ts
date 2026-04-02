import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  collection, 
  addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import type { UserProfile, PrivacySettings } from '../types';

// ─── Profil İşlemleri ─────────────────────────────────────

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const createUserProfile = async (uid: string, email: string, displayName: string) => {
  const profile: UserProfile = {
    uid,
    email,
    displayName,
    bio: '',
    avatarUrl: '',
    coins: 100,
    level: 1,
    favoriteGames: [],
    privacy: {
      showTournaments: true,
      showStats: true,
      showOnlineStatus: true,
    },
    stats: {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      tournamentsJoined: 0,
      tournamentsWon: 0,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  await setDoc(doc(db, 'users', uid), profile);
  return profile;
};

// ─── Profil Güncelleme ────────────────────────────────────

export const updateUserProfile = async (
  uid: string, 
  data: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'favoriteGames' | 'avatarUrl'>>
) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: Date.now(),
  });
};

// ─── Gizlilik Ayarları ───────────────────────────────────

export const updatePrivacySettings = async (uid: string, privacy: PrivacySettings) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    privacy,
    updatedAt: Date.now(),
  });
};

// ─── Profil Fotoğrafı Yükleme ────────────────────────────

export const uploadAvatar = async (uid: string, file: File): Promise<string> => {
  const storageRef = ref(storage, `avatars/${uid}/${Date.now()}_${file.name}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  // Firestore'daki profili güncelle
  await updateUserProfile(uid, { avatarUrl: downloadURL });
  
  return downloadURL;
};

// ─── Coin İşlemleri ──────────────────────────────────────

export const updateCoins = async (uid: string, amount: number, reason: string) => {
  const userRef = doc(db, 'users', uid);
  
  await updateDoc(userRef, {
    coins: increment(amount),
    updatedAt: Date.now(),
  });
  
  // İşlem geçmişine kaydet
  await addDoc(collection(db, 'transactions'), {
    userId: uid,
    amount,
    reason,
    timestamp: Date.now(),
    type: amount > 0 ? 'earn' : 'spend'
  });
};
