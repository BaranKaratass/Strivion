import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

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
    coins: 100, // Yeni kullanıcılara başlangıç hediyesi
    level: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  await setDoc(doc(db, 'users', uid), profile);
  return profile;
};

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
