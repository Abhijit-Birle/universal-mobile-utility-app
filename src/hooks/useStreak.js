import { useState, useEffect } from 'react';
import { getItem } from './useStorage.js';
import { getLocalDateString } from '../utils/date.js';

export function useStreak() {
  const [activeDays, setActiveDays] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    const loadDays = async () => {
      try {
        const days = await getItem('neo_activeDays') || [];
        if (isMounted) setActiveDays(Array.isArray(days) ? days : []);
      } catch (e) {
        console.error("Failed to load streak days", e);
      }
    };
    
    loadDays();

    const handleUpdate = () => loadDays();
    window.addEventListener('neo_streak_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('neo_streak_updated', handleUpdate);
    };
  }, []);

  // Calculate streak based on consecutive days backwards from today (or yesterday)
  let streak = 0;
  const todayDate = new Date();
  
  // Create a fast lookup Set
  const activeSet = new Set(activeDays);
  
  // Check today
  const todayStr = getLocalDateString(todayDate);
  let isTodayActive = activeSet.has(todayStr);
  
  if (isTodayActive) {
    streak = 1;
  }
  
  // Check backwards from yesterday
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

  let monthlyActiveCount = 0;
  let yearlyActiveCount = 0;
  
  const currentMonth = todayDate.getMonth();
  const currentYear = todayDate.getFullYear();
  
  activeSet.forEach(dateStr => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1; // 0-indexed month
      if (y === currentYear) {
        yearlyActiveCount++;
        if (m === currentMonth) {
          monthlyActiveCount++;
        }
      }
    }
  });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0) ? 366 : 365;

  return { 
    streak, 
    activeDays,
    monthlyActiveCount,
    daysInMonth,
    yearlyActiveCount,
    daysInYear
  };
}
