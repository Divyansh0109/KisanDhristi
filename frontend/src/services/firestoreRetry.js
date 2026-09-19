// Drishti — Firestore Retry Helper
// Reusable exponential-backoff wrapper for Firestore operations that may
// fail with "client is offline" or transient network errors.

/**
 * Execute a Firestore operation with exponential backoff retry.
 *
 * @param {Function} operation  — async function to attempt (receives no args)
 * @param {Object}   [options]
 * @param {number}   [options.maxAttempts=3]         — total attempts before giving up
 * @param {number}   [options.baseDelayMs=500]       — delay before the first retry (doubles each time)
 * @param {string}   [options.label='FirestoreRetry'] — label used in log messages
 * @returns {Promise<{data: any, isOfflineFallback: boolean}>}
 */
export async function withFirestoreRetry(
  operation,
  { maxAttempts = 3, baseDelayMs = 500, label = 'FirestoreRetry' } = {},
) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await operation();
      return { data, isOfflineFallback: false };
    } catch (error) {
      lastError = error;
      const isOffline =
        error.message?.includes('client is offline') ||
        error.message?.includes('Failed to get document') ||
        error.code === 'unavailable';

      if (!isOffline) {
        // Not a connectivity issue — no point retrying
        throw error;
      }

      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1); // 500, 1000, 2000 …
        if (__DEV__) {
          console.warn(
            `[${label}] Attempt ${attempt}/${maxAttempts} failed (offline). Retrying in ${delay}ms …`,
          );
        }
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  console.error(`[${label}] All ${maxAttempts} attempts failed:`, lastError);
  return { data: null, isOfflineFallback: true };
}

/** Simple promise-based sleep */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
