import { useState, useEffect, useCallback, useRef } from 'react';
import { getItem, setItem } from './useStorage.js';
import { getLocalDateString } from '../utils/date.js';

const STORAGE_KEY = 'ledger_todos';
const LISTS_KEY = 'ledger_todo_lists';
const MIGRATION_KEY = 'ledger_todos_migrated';

const playDing = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn("Web Audio not supported");
  }
};

export function generateId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize and Migrate
  useEffect(() => {
    async function init() {
      let storedTodos = await getItem(STORAGE_KEY);
      const storedLists = await getItem(LISTS_KEY) || [{ id: 'default', name: 'Tasks', icon: 'home' }];
      
      const migrated = await getItem(MIGRATION_KEY);

      if (!storedTodos && !migrated) {
        // Migrate from old neo_todos
        const old = await getItem('neo_todos') || [];
        storedTodos = old.map(t => ({
          id: t.id ? String(t.id) : generateId(),
          text: t.text || 'Untitled',
          done: !!t.done,
          important: t.priority === 'High', // Convert old high priority to important
          myDayDate: t.date === getLocalDateString() ? getLocalDateString() : null, // If it was added today, put in My Day
          due: t.due || null,
          dueTime: t.dueTime || null,
          reminder: t.reminder || null,
          reminderNotified: !!t.reminderNotified,
          note: t.note || '',
          listId: 'default',
          pomodorosCompleted: t.pomodorosCompleted || 0,
          pomodorosEstimated: t.pomodorosEstimated || 0,
          subtasks: (t.subtasks || []).map(s => ({
            id: s.id ? String(s.id) : generateId(),
            text: s.text,
            done: !!s.done
          }))
        }));
        await setItem(STORAGE_KEY, storedTodos);
        await setItem(MIGRATION_KEY, true);
      } else if (!storedTodos) {
        storedTodos = [];
      }

      setTodos(storedTodos);
      setLists(storedLists);
      setLoading(false);
    }
    init();
  }, []);

  // Persist Lists
  useEffect(() => {
    if (!loading) setItem(LISTS_KEY, lists);
  }, [lists, loading]);

  // Persist Todos
  useEffect(() => {
    if (!loading) setItem(STORAGE_KEY, todos);
  }, [todos, loading]);

  const addTodo = useCallback((todoData) => {
    const newTodo = {
      id: generateId(),
      text: '',
      done: false,
      important: false,
      myDayDate: null,
      due: null,
      dueTime: null,
      reminder: null,
      reminderNotified: false,
      note: '',
      listId: 'default',
      pomodorosCompleted: 0,
      pomodorosEstimated: 0,
      subtasks: [],
      ...todoData
    };
    setTodos(prev => [newTodo, ...prev]);
  }, []);

  const updateTodo = useCallback((id, updates) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const toggleDone = useCallback((id) => {
    setTodos(prev => {
      let isCompleting = false;
      const next = prev.map(t => {
        if (t.id === id) {
          if (!t.done) isCompleting = true;
          return { ...t, done: !t.done };
        }
        return t;
      });
      if (isCompleting) playDing();
      return next;
    });
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const incrementPomodoro = useCallback((id) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, pomodorosCompleted: (t.pomodorosCompleted || 0) + 1 } : t
    ));
  }, []);

  // List Management
  const addList = useCallback((name) => {
    setLists(prev => [...prev, { id: generateId(), name, icon: 'list' }]);
  }, []);

  const deleteList = useCallback((id) => {
    if (id === 'default') return;
    setLists(prev => prev.filter(l => l.id !== id));
    // Move tasks to default list
    setTodos(prev => prev.map(t => t.listId === id ? { ...t, listId: 'default' } : t));
  }, []);

  return {
    todos,
    lists,
    loading,
    addTodo,
    updateTodo,
    toggleDone,
    deleteTodo,
    addList,
    deleteList,
    incrementPomodoro
  };
}
