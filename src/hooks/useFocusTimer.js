import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from './useStorage.js';
import { getDateStr } from './useRoutine.js';

const STORAGE_KEY = 'ledger_focus_timer';

const DEFAULT_STATE = {
  mode: 'focus', // 'focus' | 'break'
  selectedTaskId: null,
  customTitle: '',
  durationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  endTime: null,
  isRunning: false,
  history: [],
};

export function useFocusTimer() {
  const [timerState, setTimerState] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        setTimerState({
          ...DEFAULT_STATE,
          ...stored,
          // Ensure history is an array
          history: Array.isArray(stored.history) ? stored.history : [],
        });
      }
      setLoading(false);
    });
  }, []);

  const persist = useCallback((nextState) => {
    setTimerState(nextState);
    setItem(STORAGE_KEY, nextState);
  }, []);

  const selectTask = useCallback((taskId) => {
    persist({ 
      ...timerState, 
      selectedTaskId: taskId, 
      customTitle: '', 
      isRunning: false, 
      endTime: null 
    });
  }, [timerState, persist]);

  const setCustomTitle = useCallback((title) => {
    persist({ 
      ...timerState, 
      selectedTaskId: null, 
      customTitle: title, 
      isRunning: false, 
      endTime: null 
    });
  }, [timerState, persist]);

  const setMode = useCallback((newMode) => {
    const isBreak = newMode === 'break';
    const defaultMins = isBreak ? 5 : 25;
    const secs = defaultMins * 60;
    persist({
      ...timerState,
      mode: newMode,
      durationSeconds: secs,
      remainingSeconds: secs,
      isRunning: false,
      endTime: null,
      selectedTaskId: null,
      customTitle: isBreak ? 'Break Time' : ''
    });
  }, [timerState, persist]);

  const setDuration = useCallback((minutes) => {
    const secs = minutes * 60;
    persist({ 
      ...timerState, 
      durationSeconds: secs, 
      remainingSeconds: secs,
      isRunning: false, 
      endTime: null 
    });
  }, [timerState, persist]);

  const startTimer = useCallback(() => {
    if (timerState.isRunning || timerState.remainingSeconds <= 0) return;
    const now = Date.now();
    
    persist({
      ...timerState,
      isRunning: true,
      endTime: now + timerState.remainingSeconds * 1000,
    });
  }, [timerState, persist]);

  const pauseTimer = useCallback((currentRemainingSeconds) => {
    if (!timerState.isRunning) return;
    persist({
      ...timerState,
      isRunning: false,
      endTime: null,
      remainingSeconds: currentRemainingSeconds,
    });
  }, [timerState, persist]);

  const addTime = useCallback((minutes) => {
    const addSecs = minutes * 60;
    if (timerState.isRunning) {
      persist({
        ...timerState,
        durationSeconds: timerState.durationSeconds + addSecs,
        endTime: timerState.endTime + addSecs * 1000,
      });
    } else {
      persist({
        ...timerState,
        durationSeconds: timerState.durationSeconds + addSecs,
        remainingSeconds: timerState.remainingSeconds + addSecs,
      });
    }
  }, [timerState, persist]);

  const stopTimer = useCallback(() => {
    persist({
      ...timerState,
      isRunning: false,
      endTime: null,
      remainingSeconds: timerState.durationSeconds,
    });
  }, [timerState, persist]);
  
  const saveSession = useCallback((title, durationSecs, dateStr) => {
    const newSession = {
      id: `session_${Date.now()}`,
      title: title || 'Focus Session',
      durationSeconds: durationSecs,
      date: dateStr || getDateStr(),
    };
    persist({
      ...timerState,
      isRunning: false,
      endTime: null,
      remainingSeconds: timerState.durationSeconds,
      history: [...timerState.history, newSession],
    });
  }, [timerState, persist]);

  const deleteHistoryItem = useCallback((sessionId) => {
    persist({
      ...timerState,
      history: timerState.history.filter(s => s.id !== sessionId),
    });
  }, [timerState, persist]);

  return {
    timerState,
    loading,
    selectTask,
    setCustomTitle,
    setDuration,
    setMode,
    startTimer,
    pauseTimer,
    addTime,
    stopTimer,
    saveSession,
    deleteHistoryItem,
  };
}
