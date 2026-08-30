// KisanDrishti — Scan History Firestore Service
// Collection: "scans"

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebase';

const SCANS_COLLECTION = 'scans';

// Placeholder userId until auth is wired
const DEFAULT_USER_ID = 'demo-farmer-001';

/**
 * Upload image to Firebase Storage and return download URL
 */
export async function uploadScanImage(imageUri, userId = DEFAULT_USER_ID) {
  if (!isFirebaseConfigured()) {
    console.log('[ScanService] Firebase not configured, returning local URI');
    return imageUri;
  }

  try {
    const scanId = `scan_${Date.now()}`;
    const storageRef = ref(storage, `scans/${userId}/${scanId}.jpg`);

    const response = await fetch(imageUri);
    const blob = await response.blob();

    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);

    return downloadUrl;
  } catch (error) {
    console.error('[ScanService] Upload error:', error);
    return imageUri;
  }
}

/**
 * Save scan result to Firestore
 */
export async function saveScanResult({
  imageUrl,
  cropType,
  diseaseName,
  confidence,
  severity,
  userId = DEFAULT_USER_ID,
}) {
  if (!isFirebaseConfigured()) {
    console.log('[ScanService] Firebase not configured, scan not saved');
    return null;
  }

  try {
    const docRef = await addDoc(collection(db, SCANS_COLLECTION), {
      imageUrl,
      cropType,
      diseaseName,
      confidence,
      severity,
      timestamp: serverTimestamp(),
      userId,
    });

    console.log('[ScanService] Scan saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[ScanService] Save error:', error);
    return null;
  }
}

/**
 * Fetch scan history for a user
 * filter: 'all' | 'diseased' | 'healthy'
 */
export async function fetchScanHistory(userId = DEFAULT_USER_ID, filter = 'all') {
  if (!isFirebaseConfigured()) {
    console.log('[ScanService] Firebase not configured, returning placeholder data');
    return getPlaceholderHistory();
  }

  try {
    let q = query(
      collection(db, SCANS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    let scans = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(),
    }));

    // Apply client-side filter
    if (filter === 'diseased') {
      scans = scans.filter((s) => s.diseaseName !== 'Healthy');
    } else if (filter === 'healthy') {
      scans = scans.filter((s) => s.diseaseName === 'Healthy');
    }

    return scans;
  } catch (error) {
    console.error('[ScanService] Fetch history error:', error);
    return getPlaceholderHistory();
  }
}

/**
 * Fetch aggregate stats from scans collection
 * Returns totals for the Impact Dashboard
 */
export async function fetchAggregateStats(userId = DEFAULT_USER_ID) {
  if (!isFirebaseConfigured()) {
    console.log('[ScanService] Firebase not configured, returning placeholder stats');
    return getPlaceholderStats();
  }

  try {
    const q = query(
      collection(db, SCANS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const scans = querySnapshot.docs.map((doc) => doc.data());

    if (scans.length === 0) {
      return getPlaceholderStats();
    }

    const totalScans = scans.length;
    const healthyCount = scans.filter((s) => s.diseaseName === 'Healthy').length;
    const diseasedCount = totalScans - healthyCount;
    const healthyRatio = totalScans > 0 ? Math.round((healthyCount / totalScans) * 100) : 0;

    // Top diseases breakdown
    const diseaseMap = {};
    scans.forEach((s) => {
      if (s.diseaseName && s.diseaseName !== 'Healthy') {
        diseaseMap[s.diseaseName] = (diseaseMap[s.diseaseName] || 0) + 1;
      }
    });

    const topDiseases = Object.entries(diseaseMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalScans) * 100) }));

    // Monthly scan trends (last 6 months)
    const monthlyTrends = getMonthlyTrends(scans);

    return {
      totalScans,
      diseasesDetected: diseasedCount,
      healthyRatio,
      estimatedYieldSaved: Math.round(diseasedCount * 2.5), // rough 2.5 quintal/intervention
      topDiseases,
      monthlyTrends,
    };
  } catch (error) {
    console.error('[ScanService] Aggregate stats error:', error);
    return getPlaceholderStats();
  }
}

function getMonthlyTrends(scans) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendMap = {};
  const now = new Date();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${months[d.getMonth()]}`;
    trendMap[key] = 0;
  }

  scans.forEach((s) => {
    const date = s.timestamp?.toDate?.() || new Date(s.timestamp);
    const key = `${months[date.getMonth()]}`;
    if (trendMap[key] !== undefined) {
      trendMap[key]++;
    }
  });

  return Object.entries(trendMap).map(([month, count]) => ({ month, count }));
}

function getPlaceholderHistory() {
  return [
    {
      id: 'ph1',
      imageUrl: null,
      cropType: 'Tomato',
      diseaseName: 'Early Blight',
      confidence: 0.92,
      severity: 'high',
      timestamp: new Date(Date.now() - 86400000),
      userId: DEFAULT_USER_ID,
    },
    {
      id: 'ph2',
      imageUrl: null,
      cropType: 'Apple',
      diseaseName: 'Healthy',
      confidence: 0.97,
      severity: 'none',
      timestamp: new Date(Date.now() - 172800000),
      userId: DEFAULT_USER_ID,
    },
    {
      id: 'ph3',
      imageUrl: null,
      cropType: 'Potato',
      diseaseName: 'Late Blight',
      confidence: 0.85,
      severity: 'medium',
      timestamp: new Date(Date.now() - 259200000),
      userId: DEFAULT_USER_ID,
    },
    {
      id: 'ph4',
      imageUrl: null,
      cropType: 'Grape',
      diseaseName: 'Healthy',
      confidence: 0.96,
      severity: 'none',
      timestamp: new Date(Date.now() - 345600000),
      userId: DEFAULT_USER_ID,
    },
    {
      id: 'ph5',
      imageUrl: null,
      cropType: 'Corn (Maize)',
      diseaseName: 'Common Rust',
      confidence: 0.88,
      severity: 'high',
      timestamp: new Date(Date.now() - 432000000),
      userId: DEFAULT_USER_ID,
    },
  ];
}

function getPlaceholderStats() {
  return {
    totalScans: 247,
    diseasesDetected: 89,
    healthyRatio: 64,
    estimatedYieldSaved: 223,
    topDiseases: [
      { name: 'Tomato Early Blight', count: 34, percentage: 38 },
      { name: 'Potato Late Blight', count: 22, percentage: 25 },
      { name: 'Apple Scab', count: 18, percentage: 20 },
      { name: 'Grape Black Rot', count: 10, percentage: 11 },
      { name: 'Corn Common Rust', count: 5, percentage: 6 },
    ],
    monthlyTrends: [
      { month: 'Mar', count: 28 },
      { month: 'Apr', count: 35 },
      { month: 'May', count: 42 },
      { month: 'Jun', count: 51 },
      { month: 'Jul', count: 48 },
      { month: 'Aug', count: 43 },
    ],
  };
}

export default {
  uploadScanImage,
  saveScanResult,
  fetchScanHistory,
  fetchAggregateStats,
};
