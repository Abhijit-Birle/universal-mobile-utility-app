import { getItem, setItem } from '../hooks/useStorage.js';
import { getLocalDateString } from './date.js';

export async function markDayActive() {
  try {
    const today = getLocalDateString();
    let days = await getItem('neo_activeDays') || [];
    
    // Fallback for legacy localStorage
    if (!Array.isArray(days)) {
      days = [];
    }

    if (!days.includes(today)) {
      days.push(today);
      await setItem('neo_activeDays', days);
      window.dispatchEvent(new Event('neo_streak_updated'));
    }
  } catch (error) {
    console.error("Failed to mark day active", error);
  }
}
