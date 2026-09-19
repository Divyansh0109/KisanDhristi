// Drishti — User/Profile Firestore Service
// Collection: "users" — keyed by userId

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebase';
import { withFirestoreRetry } from './firestoreRetry';

const USERS_COLLECTION = 'users';
const DEFAULT_USER_ID = 'demo-farmer-001';

const DEFAULT_PROFILE = {
  name: '',
  phone: '',
  state: '',
  district: '',
  village: '',
  cropsGrown: [],
  photoUrl: null,
  userId: DEFAULT_USER_ID,
};

/**
 * Get user profile from Firestore.
 *
 * Uses exponential-backoff retry for "client is offline" errors.
 * Returns { ...profileData, isOfflineFallback } so the UI can
 * decide whether to show a connectivity warning.
 */
export async function getUserProfile(userId = DEFAULT_USER_ID) {
  if (!isFirebaseConfigured()) {
    console.log('[UserService] Firebase not configured, returning default profile');
    return { ...DEFAULT_PROFILE, userId, isOfflineFallback: false };
  }

  const { data, isOfflineFallback } = await withFirestoreRetry(
    async () => {
      const docRef = doc(db, USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }

      return { ...DEFAULT_PROFILE, userId };
    },
    { label: 'getUserProfile' },
  );

  if (isOfflineFallback) {
    return { ...DEFAULT_PROFILE, userId, isOfflineFallback: true };
  }

  return { ...data, isOfflineFallback: false };
}

/**
 * Save or update user profile in Firestore
 */
export async function saveUserProfile(profileData, userId = DEFAULT_USER_ID) {
  if (!isFirebaseConfigured()) {
    console.log('[UserService] Firebase not configured, profile not saved');
    return false;
  }

  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(
      docRef,
      {
        ...profileData,
        userId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log('[UserService] Profile saved for:', userId);
    return true;
  } catch (error) {
    console.error('[UserService] Save profile error:', error);
    return false;
  }
}

/**
 * Upload profile photo to Firebase Storage
 */
export async function uploadProfilePhoto(imageUri, userId = DEFAULT_USER_ID) {
  if (!isFirebaseConfigured()) {
    console.log('[UserService] Firebase not configured, returning local URI');
    return imageUri;
  }

  try {
    const storageRef = ref(storage, `profiles/${userId}/avatar.jpg`);

    const response = await fetch(imageUri);
    const blob = await response.blob();

    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);

    // Also update the profile document
    await saveUserProfile({ photoUrl: downloadUrl }, userId);

    return downloadUrl;
  } catch (error) {
    console.error('[UserService] Upload photo error:', error);
    return imageUri;
  }
}

export default { getUserProfile, saveUserProfile, uploadProfilePhoto };
