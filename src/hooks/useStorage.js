// ─── IndexedDB Storage Wrapper (idb-keyval) ──────────────────────────────────
// Used for large data payloads (history, transactions, todos) to avoid
// blocking the main thread and exceeding localStorage 5-10MB limits.

import { get, set, del, keys } from 'idb-keyval';

/**
 * Get a value from IndexedDB.
 * Returns `null` if key doesn't exist (matching localStorage behavior).
 */
export async function getItem(key) {
  try {
    const value = await get(key);
    if (value !== undefined) return value; // Found in IDB

    // Auto-migrate from localStorage if not found in IDB
    try {
      const legacyVal = window.localStorage.getItem(key);
      if (legacyVal) {
        const parsed = JSON.parse(legacyVal);
        await set(key, parsed); // Save to IDB for future
        window.localStorage.removeItem(key); // Cleanup
        return parsed;
      }
    } catch (e) {
      console.warn(`Migration failed for ${key}`, e);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Store a value in IndexedDB.
 */
export async function setItem(key, value) {
  await set(key, value);
}

/**
 * Remove a key from IndexedDB.
 */
export async function removeItem(key) {
  await del(key);
}

/**
 * Get all keys stored in IndexedDB.
 */
export async function getAllKeys() {
  return await keys();
}

/**
 * Export all Ledger data as a single JSON object.
 */
export async function exportAllData() {
  const allKeys = await getAllKeys();
  const data = {};
  for (const key of allKeys) {
    data[key] = await getItem(key);
  }
  return data;
}

/**
 * Import a previously exported data object back into IndexedDB.
 * Overwrites any existing keys.
 */
export async function importAllData(data) {
  for (const [key, value] of Object.entries(data)) {
    await setItem(key, value);
  }
}

/**
 * Estimate total storage size in bytes by summing serialized value lengths.
 */
export async function estimateStorageBytes() {
  const allKeys = await getAllKeys();
  let total = 0;
  for (const key of allKeys) {
    const value = await getItem(key);
    if (value) total += JSON.stringify(value).length * 2; // UTF-16 estimate
  }
  return total;
}
