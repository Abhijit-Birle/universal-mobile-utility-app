import { useState, useEffect, useCallback, useRef } from 'react';
import { getItem, setItem } from './useStorage.js';
import { UNDO_TIMEOUT_MS } from '../constants/theme.js';
import { VALID_EXPENSE_CATEGORIES } from '../constants/categories.js';
import { getLocalDateString } from '../utils/date.js';

const STORAGE_KEY = 'ledger_expenses';

function generateId() {
  return `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createExpense(overrides = {}) {
  return {
    id: generateId(),
    amount: 0,
    currency: 'INR',
    category: 'other',
    note: '',
    date: getLocalDateString(),
    sorted: true,
    linkedTaskId: null,
    recurring: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function isSameDay(dateStr, selectedDate = new Date()) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const sel = new Date(selectedDate);
  return (
    d.getFullYear() === sel.getFullYear() &&
    d.getMonth() === sel.getMonth() &&
    d.getDate() === sel.getDate()
  );
}

function getWeekStart(selectedDate = new Date()) {
  const d = new Date(selectedDate);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(d1, d2) {
  return Math.floor(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
}

// ─── Recurring due-date rolling ───────────────────────────────────────────────
function advanceRecurring(recurring) {
  const next = new Date(recurring.nextDueDate);
  if (recurring.frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  } else if (recurring.frequency === 'weekly') {
    next.setDate(next.getDate() + 7);
  }
  return { ...recurring, nextDueDate: getLocalDateString(next) };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [undoBuffer, setUndoBuffer] = useState(null);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    getItem(STORAGE_KEY).then((stored) => {
      if (Array.isArray(stored)) setExpenses(stored);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((nextExpenses) => {
    setExpenses(nextExpenses);
    setItem(STORAGE_KEY, nextExpenses);
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addExpense = useCallback(
    (overrides = {}) => {
      const expense = createExpense(overrides);
      persist([expense, ...expenses]);
      return expense;
    },
    [expenses, persist]
  );

  /**
   * Quick-capture: parse "1200 flight" or just "1200" from a free-text string.
   * Saves with sorted:false so user can categorize later.
   */
  const quickCapture = useCallback(
    (text) => {
      const trimmed = text.trim();
      // Try to extract leading number
      const match = trimmed.match(/^([\d,]+(?:\.\d+)?)\s*(.*)/);
      const amount = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
      const note = match ? (match[2] || trimmed) : trimmed;
      return addExpense({ amount, note: note || 'Quick capture', sorted: false });
    },
    [addExpense]
  );

  const updateExpense = useCallback(
    (id, changes) => {
      persist(expenses.map((e) => (e.id === id ? { ...e, ...changes } : e)));
    },
    [expenses, persist]
  );

  const deleteExpense = useCallback(
    (id) => {
      const expense = expenses.find((e) => e.id === id);
      if (!expense) return;
      persist(expenses.filter((e) => e.id !== id));
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      const timeoutId = setTimeout(() => setUndoBuffer(null), UNDO_TIMEOUT_MS);
      undoTimerRef.current = timeoutId;
      setUndoBuffer({ expense, timeoutId });
    },
    [expenses, persist]
  );

  const undoDeleteExpense = useCallback(() => {
    if (!undoBuffer) return;
    clearTimeout(undoBuffer.timeoutId);
    persist([undoBuffer.expense, ...expenses]);
    setUndoBuffer(null);
  }, [undoBuffer, expenses, persist]);

  const dismissUndo = useCallback(() => {
    if (undoBuffer) clearTimeout(undoBuffer.timeoutId);
    setUndoBuffer(null);
  }, [undoBuffer]);

  /**
   * Log the actual amount for a recurring item and roll its nextDueDate forward.
   */
  const logRecurring = useCallback(
    (id, amount, note) => {
      const recurring = expenses.find((e) => e.id === id);
      if (!recurring || !recurring.recurring) return;
      const logged = createExpense({
        amount,
        category: recurring.category,
        note: note || recurring.note,
        date: getLocalDateString(),
        linkedTaskId: recurring.linkedTaskId,
        sorted: true,
      });
      const updatedRecurring = {
        ...recurring,
        recurring: advanceRecurring(recurring.recurring),
      };
      persist([logged, ...expenses.map((e) => (e.id === id ? updatedRecurring : e))]);
    },
    [expenses, persist]
  );

  // ── Computed helpers ───────────────────────────────────────────────────────
  const getExpensesForDate = useCallback(
    (selectedDate = new Date()) => expenses.filter((e) => !e.recurring && isSameDay(e.date, selectedDate)),
    [expenses]
  );

  const getDailyTotal = useCallback(
    (selectedDate = new Date()) =>
      getExpensesForDate(selectedDate).reduce((sum, e) => sum + (e.amount || 0), 0),
    [getExpensesForDate]
  );

  const getThisWeekTotal = useCallback((selectedDate = new Date()) => {
    const weekStart = getWeekStart(selectedDate);
    return expenses
      .filter((e) => !e.recurring && new Date(e.date) >= weekStart && new Date(e.date) < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const getRecurringItems = useCallback(
    () => expenses.filter((e) => e.recurring !== null),
    [expenses]
  );

  const getOverdueRecurring = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return getRecurringItems().filter(
      (e) => e.recurring && new Date(e.recurring.nextDueDate) <= today
    );
  }, [getRecurringItems]);

  /**
   * No-spend streak: consecutive days ending today with zero non-recurring expenses.
   */
  const getNoSpendStreak = useCallback(() => {
    const nonRecurring = expenses.filter((e) => !e.recurring);
    if (nonRecurring.length === 0) return 0;

    // Build a Set of date strings that had expenses
    const spendDays = new Set(nonRecurring.map((e) => e.date));

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Walk backwards from today
    const cursor = new Date(today);
    while (true) {
      const dateStr = getLocalDateString(cursor);
      if (spendDays.has(dateStr)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
      // Safety: don't loop more than 365 days
      if (streak > 365) break;
    }
    return streak;
  }, [expenses]);

  const getRecentExpenses = useCallback(
    (limit = 30) =>
      [...expenses]
        .filter((e) => !e.recurring)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit),
    [expenses]
  );

  const getUnsortedExpenses = useCallback(
    () => expenses.filter((e) => !e.sorted),
    [expenses]
  );

  return {
    expenses,
    loading,
    undoBuffer,
    addExpense,
    quickCapture,
    updateExpense,
    deleteExpense,
    undoDeleteExpense,
    dismissUndo,
    logRecurring,
    getExpensesForDate,
    getDailyTotal,
    getThisWeekTotal,
    getRecurringItems,
    getOverdueRecurring,
    getNoSpendStreak,
    getRecentExpenses,
    getUnsortedExpenses,
  };
}
