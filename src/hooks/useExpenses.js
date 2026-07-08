import { useState, useEffect, useCallback, useRef } from 'react';
import { getItem, setItem } from './useStorage.js';
import { UNDO_TIMEOUT_MS } from '../constants/theme.js';
import { VALID_EXPENSE_CATEGORIES } from '../constants/categories.js';
import { getLocalDateString } from '../utils/date.js';

const STORAGE_KEY = 'ledger_expenses';
const BUDGET_KEY = 'ledger_budgets';

export function generateId() {
  return `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createExpense(overrides = {}) {
  return {
    id: generateId(),
    amount: 0,
    currency: 'INR',
    category: 'other',
    subcategory: '',
    note: '',
    date: getLocalDateString(),
    tags: [],
    recurring: false,
    recurrenceInterval: 'none', // 'monthly' | 'weekly' | 'none'
    receiptUrl: '',
    createdAt: new Date().toISOString(),
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

function getWeekStart(selectedDate = new Date()) {
  const d = new Date(selectedDate);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [undoBuffer, setUndoBuffer] = useState(null);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getItem(STORAGE_KEY),
      getItem(BUDGET_KEY)
    ]).then(([storedExpenses, storedBudgets]) => {
      let expensesList = Array.isArray(storedExpenses) ? storedExpenses : [];
      
      // One-time Migration from neo_transactions
      const migratedFlag = window.localStorage.getItem('neo_expenses_migrated');
      if (!migratedFlag) {
        try {
          const legacy = JSON.parse(window.localStorage.getItem('neo_transactions') || '[]');
          if (Array.isArray(legacy)) {
            const legacyExpenses = legacy
              .filter(t => t.type === 'expense')
              .map(t => ({
                id: String(t.id || generateId()),
                amount: t.amount || 0,
                category: t.category?.toLowerCase() || 'other',
                subcategory: '',
                note: t.desc || t.name || '',
                date: t.date === 'Today' ? getLocalDateString() : (t.date || getLocalDateString()),
                tags: [],
                recurring: false,
                recurrenceInterval: 'none',
                receiptUrl: '',
                createdAt: new Date().toISOString()
              }));
            
            const existingIds = new Set(expensesList.map(e => e.id));
            legacyExpenses.forEach(e => {
              if (!existingIds.has(e.id)) {
                expensesList.push(e);
              }
            });
          }
          
          // Migrate old neo_categoryBudgets
          const legacyBudgets = JSON.parse(window.localStorage.getItem('neo_categoryBudgets') || '{}');
          let nextBudgets = { ...(storedBudgets || {}) };
          for (const [cat, limit] of Object.entries(legacyBudgets)) {
            const catId = cat.toLowerCase();
            if (!nextBudgets[catId] && limit) {
              nextBudgets[catId] = { monthlyLimit: limit, rolloverEnabled: false };
            }
          }

          window.localStorage.setItem('neo_expenses_migrated', 'true');
          setItem(STORAGE_KEY, expensesList);
          setItem(BUDGET_KEY, nextBudgets);
          
          if (storedBudgets === null) storedBudgets = nextBudgets;
        } catch (e) {
          console.error('Migration failed', e);
        }
      }

      setExpenses(expensesList);
      if (storedBudgets) setBudgets(storedBudgets);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((nextExpenses) => {
    setExpenses(nextExpenses);
    setItem(STORAGE_KEY, nextExpenses);
  }, []);

  const persistBudgets = useCallback((nextBudgets) => {
    setBudgets(nextBudgets);
    setItem(BUDGET_KEY, nextBudgets);
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

  const quickCapture = useCallback(
    (text, category = 'other') => {
      const trimmed = text.trim();
      const match = trimmed.match(/^([\d,]+(?:\.\d+)?)\s*(.*)/);
      const amount = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
      let note = match ? (match[2] || trimmed) : trimmed;
      
      // Parse inline tags (e.g., #grocery)
      const tags = [];
      note = note.replace(/#(\w+)/g, (full, tag) => {
        tags.push(tag.toLowerCase());
        return '';
      }).trim();

      return addExpense({ amount, note: note || 'Quick capture', category, tags });
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

  // ── Budgets ───────────────────────────────────────────────────────────────
  const updateBudget = useCallback((category, monthlyLimit, rolloverEnabled = false) => {
    const data = { monthlyLimit, rolloverEnabled };
    persistBudgets({ ...budgets, [category]: data });
  }, [budgets, persistBudgets]);

  // ── Computed helpers ───────────────────────────────────────────────────────
  const getExpensesForDate = useCallback(
    (selectedDate = new Date()) => expenses.filter((e) => isSameDay(e.date, selectedDate)),
    [expenses]
  );

  const getMonthlySpendByCategory = useCallback((year, month) => {
    // month is 0-indexed
    const filtered = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const map = {};
    filtered.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const getRecentExpenses = useCallback(
    (limit = 30) =>
      [...expenses]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit),
    [expenses]
  );

  return {
    expenses,
    budgets,
    loading,
    undoBuffer,
    addExpense,
    quickCapture,
    updateExpense,
    deleteExpense,
    undoDeleteExpense,
    dismissUndo,
    updateBudget,
    getExpensesForDate,
    getMonthlySpendByCategory,
    getRecentExpenses,
  };
}
