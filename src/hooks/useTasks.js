import { useState, useEffect, useCallback, useRef } from 'react';
import { getItem, setItem } from './useStorage.js';
import { UNDO_TIMEOUT_MS } from '../constants/theme.js';
import { VALID_TASK_DOMAINS, VALID_TASK_PRIORITIES } from '../constants/domains.js';

const STORAGE_KEY = 'ledger_tasks';

function generateId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function generateSubtaskId() {
  return `st_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createTask(overrides = {}) {
  return {
    id: generateId(),
    title: '',
    domain: 'personal',
    status: 'open',
    dueDate: null,
    priority: 'medium',
    subtasks: [],
    estimatedMinutes: null,
    actualMinutes: null,
    deferredCount: 0,
    linkedExpenseId: null,
    recurring: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    ...overrides,
  };
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function isSameDay(dateStr, selectedDate = new Date()) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const sel = new Date(selectedDate);
  return (
    d.getFullYear() === sel.getFullYear() &&
    d.getMonth() === sel.getMonth() &&
    d.getDate() === sel.getDate()
  );
}

export function isSameWeek(dateStr, selectedDate = new Date()) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const sel = new Date(selectedDate);
  const startOfWeek = new Date(sel);
  startOfWeek.setDate(sel.getDate() - sel.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

// ─── Sort helpers ─────────────────────────────────────────────────────────────
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function sortTasks(tasks, sortBy) {
  return [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
    }
    if (sortBy === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    // Default: createdAt newest first
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

// ─── Filter helpers ───────────────────────────────────────────────────────────
function filterTasks(tasks, { domain, status, view, selectedDate = new Date() }) {
  return tasks.filter((t) => {
    if (domain && domain !== 'all' && t.domain !== domain) return false;
    if (status && status !== 'all' && t.status !== status) return false;
    if (view === 'today' || view === 'day') {
      return t.dueDate && isSameDay(t.dueDate, selectedDate) && t.status === 'open';
    }
    if (view === 'week') {
      return t.dueDate && isSameWeek(t.dueDate, selectedDate);
    }
    if (view === 'someday') {
      return !t.dueDate || (!isSameDay(t.dueDate, selectedDate) && !isSameWeek(t.dueDate, selectedDate));
    }
    return true;
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [undoBuffer, setUndoBuffer] = useState(null); // { task, timeoutId }
  const undoTimerRef = useRef(null);

  // ── Load from Preferences on mount
  useEffect(() => {
    getItem(STORAGE_KEY).then((stored) => {
      if (Array.isArray(stored)) setTasks(stored);
      setLoading(false);
    });
  }, []);

  // ── Persist on every change
  const persist = useCallback((nextTasks) => {
    setTasks(nextTasks);
    setItem(STORAGE_KEY, nextTasks);
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addTask = useCallback(
    (overrides = {}) => {
      const task = createTask(overrides);
      persist([task, ...tasks]);
      return task;
    },
    [tasks, persist]
  );

  const updateTask = useCallback(
    (id, changes) => {
      persist(tasks.map((t) => (t.id === id ? { ...t, ...changes } : t)));
    },
    [tasks, persist]
  );

  const deleteTask = useCallback(
    (id) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      persist(tasks.filter((t) => t.id !== id));
      // Set undo buffer
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      const timeoutId = setTimeout(() => setUndoBuffer(null), UNDO_TIMEOUT_MS);
      undoTimerRef.current = timeoutId;
      setUndoBuffer({ task, timeoutId });
    },
    [tasks, persist]
  );

  const undoDeleteTask = useCallback(() => {
    if (!undoBuffer) return;
    clearTimeout(undoBuffer.timeoutId);
    persist([undoBuffer.task, ...tasks]);
    setUndoBuffer(null);
  }, [undoBuffer, tasks, persist]);

  const dismissUndo = useCallback(() => {
    if (undoBuffer) clearTimeout(undoBuffer.timeoutId);
    setUndoBuffer(null);
  }, [undoBuffer]);

  const toggleComplete = useCallback(
    (id) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const isDone = task.status !== 'done';
      persist(
        tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: isDone ? 'done' : 'open',
                completedAt: isDone ? new Date().toISOString() : null,
              }
            : t
        )
      );
    },
    [tasks, persist]
  );

  // ── Subtasks ───────────────────────────────────────────────────────────────
  const addSubtask = useCallback(
    (taskId, title) => {
      const subtask = { id: generateSubtaskId(), title, done: false };
      persist(
        tasks.map((t) =>
          t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), subtask] } : t
        )
      );
    },
    [tasks, persist]
  );

  const toggleSubtask = useCallback(
    (taskId, subtaskId) => {
      persist(
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: (t.subtasks || []).map((s) =>
                  s.id === subtaskId ? { ...s, done: !s.done } : s
                ),
              }
            : t
        )
      );
    },
    [tasks, persist]
  );

  const deleteSubtask = useCallback(
    (taskId, subtaskId) => {
      persist(
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId) }
            : t
        )
      );
    },
    [tasks, persist]
  );

  // ── Computed helpers ───────────────────────────────────────────────────────
  const getTasksForDate = useCallback(
    (selectedDate = new Date()) =>
      tasks.filter((t) => t.status === 'open' && t.dueDate && isSameDay(t.dueDate, selectedDate)),
    [tasks]
  );

  const getFilteredSortedTasks = useCallback(
    (filterOpts, sortBy) => sortTasks(filterTasks(tasks, filterOpts), sortBy),
    [tasks]
  );

  return {
    tasks,
    loading,
    undoBuffer,
    addTask,
    updateTask,
    deleteTask,
    undoDeleteTask,
    dismissUndo,
    toggleComplete,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    getTasksForDate,
    getFilteredSortedTasks,
  };
}
