import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from './useStorage.js';
import { getLocalDateString } from '../utils/date.js';

const STORAGE_KEY = 'ledger_routine';

const DEFAULT_STATE = {
  habits: [
    { id: 'h1', title: 'Read 20 mins', color: 'var(--accent-work)', logs: {} },
    { id: 'h2', title: 'Practice German', color: 'var(--accent-study)', logs: {} },
  ],
  notes: '',
  moodLogs: {},
};

export function getDateStr(date = new Date()) {
  return getLocalDateString(date);
}

export function useRoutine() {
  const [routine, setRoutine] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        setRoutine({
          habits: stored.habits || DEFAULT_STATE.habits,
          notes: stored.notes || '',
          moodLogs: stored.moodLogs || {},
        });
      }
      setLoading(false);
    });
  }, []);

  const persist = useCallback((nextRoutine) => {
    setRoutine(nextRoutine);
    setItem(STORAGE_KEY, nextRoutine);
  }, []);

  const toggleHabit = useCallback((habitId, selectedDate = new Date()) => {
    const dateStr = getDateStr(selectedDate);
    persist({
      ...routine,
      habits: routine.habits.map((h) => {
        if (h.id !== habitId) return h;
        const newLogs = { ...h.logs };
        if (newLogs[dateStr]) {
          delete newLogs[dateStr];
        } else {
          newLogs[dateStr] = true;
        }
        return { ...h, logs: newLogs };
      }),
    });
  }, [routine, persist]);

  const addHabit = useCallback((title, color) => {
    persist({
      ...routine,
      habits: [
        ...routine.habits,
        { id: `h_${Date.now()}`, title, color, logs: {} }
      ]
    });
  }, [routine, persist]);

  const deleteHabit = useCallback((habitId) => {
    persist({
      ...routine,
      habits: routine.habits.filter(h => h.id !== habitId)
    });
  }, [routine, persist]);

  const updateHabit = useCallback((habitId, updates) => {
    persist({
      ...routine,
      habits: routine.habits.map(h => h.id === habitId ? { ...h, ...updates } : h)
    });
  }, [routine, persist]);

  const updateNotes = useCallback((text) => {
    persist({
      ...routine,
      notes: text,
    });
  }, [routine, persist]);

  const setMood = useCallback((mood, selectedDate = new Date()) => {
    const dateStr = getDateStr(selectedDate);
    persist({
      ...routine,
      moodLogs: {
        ...routine.moodLogs,
        [dateStr]: mood,
      }
    });
  }, [routine, persist]);

  const getMoodForDate = useCallback((selectedDate = new Date()) => {
    return routine.moodLogs[getDateStr(selectedDate)] || null;
  }, [routine]);

  // Calculate streak for a given habit
  const getHabitStreak = useCallback((habitId) => {
    const habit = routine.habits.find(h => h.id === habitId);
    if (!habit || !habit.logs) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const cursor = new Date(today);
    // Loop backwards up to 365 days
    for (let i=0; i<365; i++) {
      const dStr = getLocalDateString(cursor);
      if (habit.logs[dStr]) {
        streak++;
      } else {
        if (i === 0) {
          // If missed today, keep looking at yesterday to see if streak is still alive
        } else {
          break; // missed a day in the past
        }
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [routine]);

  return {
    routine, loading,
    toggleHabit, addHabit, deleteHabit, updateHabit,
    updateNotes, setMood, getMoodForDate,
    getHabitStreak, getDateStr,
  };
}
