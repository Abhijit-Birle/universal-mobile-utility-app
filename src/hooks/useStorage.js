// ─── Capacitor Preferences wrapper ───────────────────────────────────────────
// Never use window.localStorage directly — it doesn't persist reliably in
// native WebViews on iOS/Android. All storage goes through this module.

import { Preferences } from '@capacitor/preferences';

/**
 * Get a JSON-parsed value from Preferences.
 * Returns `null` if key doesn't exist.
 */
export async function getItem(key) {
  try {
    const { value } = await Preferences.get({ key });
    if (value === null || value === undefined) return null;
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Serialize and store a value in Preferences.
 */
export async function setItem(key, value) {
  await Preferences.set({ key, value: JSON.stringify(value) });
}

/**
 * Remove a key from Preferences.
 */
export async function removeItem(key) {
  await Preferences.remove({ key });
}

/**
 * Get all keys stored in Preferences.
 */
export async function getAllKeys() {
  const { keys } = await Preferences.keys();
  return keys;
}

/**
 * Export all Ledger data as a single JSON object.
 */
export async function exportAllData() {
  const keys = await getAllKeys();
  const data = {};
  for (const key of keys) {
    data[key] = await getItem(key);
  }
  return data;
}

/**
 * Import a previously exported data object back into Preferences.
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
  const keys = await getAllKeys();
  let total = 0;
  for (const key of keys) {
    const { value } = await Preferences.get({ key });
    if (value) total += value.length * 2; // UTF-16 estimate
  }
  return total;
}
