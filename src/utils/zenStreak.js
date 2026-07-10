import { getItem, setItem } from '../hooks/useStorage.js';
import { getLocalDateString } from './date.js';

export async function markZenActiveToday() {
  try {
    const todayStr = getLocalDateString(new Date());
    let days = await getItem('neo_zenActiveDays') || [];
    
    if (!Array.isArray(days)) {
      days = [];
    }
    
    if (!days.includes(todayStr)) {
      days.push(todayStr);
      // Keep only last 365 days
      if (days.length > 365) {
        days = days.slice(days.length - 365);
      }
      await setItem('neo_zenActiveDays', days);
      window.dispatchEvent(new Event('neo_zen_streak_updated'));
    }
  } catch (e) {
    console.error("Failed to mark zen active today", e);
  }
}
