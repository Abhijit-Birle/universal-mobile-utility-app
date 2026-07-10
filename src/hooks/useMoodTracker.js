import { useState, useEffect } from 'react';
import { getItem, setItem } from './useStorage.js';
import { markDayActive } from '../utils/streak.js';

const STORAGE_KEY = 'ledger-mood-tracker';

export function useMoodTracker() {
  const [moodLogs, setMoodLogs] = useState({});

  useEffect(() => {
    getItem(STORAGE_KEY).then(saved => {
      if (saved) setMoodLogs(saved);
    });
  }, []);

  const addLog = (dateStr, moodValue, stressValue, note = '') => {
    const entry = {
      id: `mood_${Date.now()}`,
      timestamp: Date.now(),
      mood: moodValue,
      stress: stressValue,
      note,
    };

    setMoodLogs(prev => {
      const updated = { ...prev, [dateStr]: [...(prev[dateStr] || []), entry] };
      setItem(STORAGE_KEY, updated);
      markDayActive();
      return updated;
    });
  };

  const getLogsForDate = (dateStr) => moodLogs[dateStr] || [];
  const getLatestLogForDate = (dateStr) => {
    const logs = moodLogs[dateStr] || [];
    return logs.length === 0 ? null : logs[logs.length - 1];
  };

  return { moodLogs, addLog, getLogsForDate, getLatestLogForDate };
}
