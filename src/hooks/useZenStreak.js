import { useState, useEffect } from 'react';
import { getItem } from './useStorage.js';
import { getLocalDateString } from '../utils/date.js';

export function useZenStreak() {
  const [activeDays, setActiveDays] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    const loadDays = async () => {
      try {
        const days = await getItem('neo_zenActiveDays') || [];
        if (isMounted) setActiveDays(Array.isArray(days) ? days : []);
      } catch (e) {
        console.error("Failed to load zen streak days", e);
      }
    };
    
    loadDays();

    const handleUpdate = () => loadDays();
    window.addEventListener('neo_zen_streak_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('neo_zen_streak_updated', handleUpdate);
    };
  }, []);

  let streak = 0;
  const todayDate = new Date();
  const activeSet = new Set(activeDays);
  const todayStr = getLocalDateString(todayDate);
  
  if (activeSet.has(todayStr)) {
    streak = 1;
  }
  
  let checkDate = new Date(todayDate);
  checkDate.setDate(checkDate.getDate() - 1);
  
  while (true) {
    const checkStr = getLocalDateString(checkDate);
    if (activeSet.has(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { streak, activeDays };
}
