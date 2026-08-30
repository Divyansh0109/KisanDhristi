// KisanDrishti — Backend API Client
// Isolated module for all Flask backend communication.
// Change EXPO_PUBLIC_BACKEND_URL in .env to point to your Flask server.
import { Platform } from 'react-native';

console.log('>>> [DEBUG api.js] process.env.EXPO_PUBLIC_BACKEND_URL =', process.env.EXPO_PUBLIC_BACKEND_URL);

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT_MS = 20000; // 20 seconds

/**
 * POST /predict — send a crop image for disease classification.
 *
 * Flask backend expects:
 *   - multipart/form-data
 *   - image file under key "image"
 *
 * Flask backend returns:
 *   {
 *     "class_name": "Tomato___Early_blight",   // raw class string
 *     "confidence": 92.5,                       // 0-100 float
 *     "crop": "Tomato",                         // part before ___
 *     "condition": "Early_blight"               // part after ___  (empty if healthy)
 *   }
 */
export async function postPredict(imageUri) {
  const url = `${BACKEND_URL}/predict`;

  // Build multipart form data with the image
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1] : 'jpg';
  const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  if (Platform.OS === 'web') {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    formData.append('image', blob, filename);
  } else {
    formData.append('image', {
      uri: imageUri,
      type: mimeType,
      name: filename,
    });
  }

  // Fetch with timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  if (__DEV__) {
    console.log(`[API] POST ${url}`);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        // Let fetch set Content-Type with boundary for multipart
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMsg;
      try {
        const parsed = JSON.parse(errorBody);
        errorMsg = parsed.error || `Server error: ${response.status}`;
      } catch {
        errorMsg = `Server error: ${response.status}`;
      }
      throw new Error(`[${response.status}] ${url} - ${errorMsg}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('REQUEST_TIMEOUT');
    }

    // Network errors (server unreachable, DNS failure, etc.)
    if (error.message === 'Network request failed' || error.message.includes('fetch')) {
      throw new Error(`NETWORK_ERROR: Could not connect to ${url}`);
    }

    throw error;
  }
}

/**
 * GET / — health check to verify backend is reachable
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${BACKEND_URL}/`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return data.status === 'ok';
    }
    return false;
  } catch {
    return false;
  }
}

export { BACKEND_URL, REQUEST_TIMEOUT_MS };
export default { postPredict, checkBackendHealth, BACKEND_URL };
