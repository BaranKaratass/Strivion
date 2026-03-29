import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ÖNEMLİ: Bu değerleri Firebase Console üzerinden alıp güncellemelisin.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "strivion.firebaseapp.com",
  projectId: "strivion",
  storageBucket: "strivion.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
