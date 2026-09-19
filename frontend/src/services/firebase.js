// Drishti — Firebase Configuration
// Uses EXPO_PUBLIC_FIREBASE_* environment variables

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, enableNetwork } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Only initialize if not already done
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);

// Explicitly bring Firestore online — on physical devices the SDK can
// sometimes start in offline mode after network changes, which causes
// "client is offline" errors on the very first read.
enableNetwork(db).catch((err) => {
  console.warn('[Firebase] enableNetwork failed:', err);
});

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured() {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== '');
}

export default app;
