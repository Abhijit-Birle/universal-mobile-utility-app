import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from './useStorage.js';

/**
 * A hook that works exactly like `useState`, but asynchronously syncs 
 * the state to IndexedDB via idb-keyval behind the scenes.
 * 
 * Used for large datasets (e.g. transactions, history) to avoid blocking the main thread.
 * 
 * @param {string} key - The storage key
 * @param {any} initialValue - Default value if storage is empty
 * @returns {[any, function, boolean]} - [state, setState, isLoading]
 */
export function useAsyncStorage(key, initialValue) {
  const [state, setState] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    getItem(key).then(val => {
      if (isMounted) {
        if (val !== null && val !== undefined) {
          setState(val);
        }
        setLoading(false);
      }
    }).catch(err => {
      console.error(`Failed to load async storage key: ${key}`, err);
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, [key]);

  // Sync state changes back to storage asynchronously
  const setAsyncState = useCallback((valueOrUpdater) => {
    setState(prev => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      
      // Fire and forget save to IDB
      setItem(key, next).catch(err => {
        console.error(`Failed to save async storage key: ${key}`, err);
      });
      
      return next;
    });
  }, [key]);

  return [state, setAsyncState, loading];
}
