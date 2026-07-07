import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from './useStorage.js';

const STORAGE_KEY = 'ledger_settings';

const DEFAULT_SETTINGS = {
  relocationGoalAmount: 500000,
  relocationSavedAmount: 0,
  relocationTargetDate: '',
  weeklyBudget: 5000,
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getItem(STORAGE_KEY).then((stored) => {
      if (stored && typeof stored === 'object') {
        setSettings({ ...DEFAULT_SETTINGS, ...stored });
      }
      setLoading(false);
    });
  }, []);

  const updateSettings = useCallback(
    (changes) => {
      const next = { ...settings, ...changes };
      setSettings(next);
      setItem(STORAGE_KEY, next);
    },
    [settings]
  );

  return { settings, loading, updateSettings };
}
