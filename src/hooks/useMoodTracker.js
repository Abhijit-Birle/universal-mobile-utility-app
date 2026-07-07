import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ledger-mood-tracker';

export function useMoodTracker() {
  const [moodLogs, setMoodLogs] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMoodLogs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse mood logs', e);
      }
    }
  }, []);

  const saveLogs = (newLogs) => {
    setMoodLogs(newLogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
  };

  const addLog = (dateStr, moodValue, stressValue, note = '') => {
    const entry = {
      id: `mood_${Date.now()}`,
      timestamp: Date.now(),
      mood: moodValue,     // 1 to 5
      stress: stressValue, // 1 to 5
      note,
    };

    setMoodLogs(prev => {
      const dateLogs = prev[dateStr] || [];
      const updated = {
        ...prev,
        [dateStr]: [...dateLogs, entry],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getLogsForDate = (dateStr) => {
    return moodLogs[dateStr] || [];
  };

  const getLatestLogForDate = (dateStr) => {
    const logs = moodLogs[dateStr] || [];
    if (logs.length === 0) return null;
    return logs[logs.length - 1]; // Array append order puts latest at end
  };

  return {
    moodLogs,
    addLog,
    getLogsForDate,
    getLatestLogForDate
  };
}
