import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setLocalState = useCallback((valueOrUpdater) => {
    setState(prev => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, [key]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key !== key) return;
      try {
        if (e.newValue) setState(JSON.parse(e.newValue));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [state, setLocalState];
};
