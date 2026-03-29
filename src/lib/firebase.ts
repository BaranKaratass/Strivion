import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBv8yVqg9SjQyyjpvhIJzDRCz5vbv7zL1M",
  authDomain: "strivion-d08ec.firebaseapp.com",
  projectId: "strivion-d08ec",
  storageBucket: "strivion-d08ec.firebasestorage.app",
  messagingSenderId: "393720637032",
  appId: "1:393720637032:web:9e5e21bb94caddc7313ddd",
  measurementId: "G-ZZHR6WJMN9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
