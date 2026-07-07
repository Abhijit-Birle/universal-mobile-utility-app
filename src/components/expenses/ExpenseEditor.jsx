import { useState, useRef, useEffect } from 'react';
import Icon from '../ui/Icon.jsx';
import { EXPENSE_CATEGORIES, CATEGORY_GRID_ORDER } from '../../constants/categories.js';
import { getLocalDateString } from '../../utils/date.js';
import '../../styles/expenses.css';

/**
 * Slide-up sheet for editing an expense.
 * Fields: amount, category, note, date, sorted flag, recurring config.
 * Also used as the "amount entry" sheet when tapping a category in the grid.
 */
export default function ExpenseEditor({
  expense,
  initialCategory,
  onSave,
  onDelete,
  onClose,
}) {
  const isNew = !expense?.id;
  const [amount, setAmount]     = useState(expense?.amount ? String(expense.amount) : '');
  const [category, setCategory] = useState(expense?.category || initialCategory || 'other');
  const [note, setNote]         = useState(expense?.note || '');
  const [date, setDate]         = useState(expense?.date || getLocalDateString());
  const [sorted, setSorted]     = useState(expense?.sorted !== false);
  const [isRecurring, setIsRecurring] = useState(!!expense?.recurring);
  const [recurFreq, setRecurFreq]     = useState(expense?.recurring?.frequency || 'monthly');
  const [recurDay, setRecurDay]       = useState(
    expense?.recurring?.dayOfMonth || expense?.recurring?.dayOfWeek || new Date().getDate()
  );
  const amountRef = useRef(null);

  useEffect(() => {
    if (amountRef.current) setTimeout(() => amountRef.current?.focus(), 200);
  }, []);

  const cat = EXPENSE_CATEGORIES[category] || EXPENSE_CATEGORIES.other;

  const handleSave = () => {
    const amountNum = parseFloat(amount) || 0;
    if (amountNum <= 0) return;

    const recurring = isRecurring
      ? {
          frequency: recurFreq,
          ...(recurFreq === 'monthly' ? { dayOfMonth: recurDay } : { dayOfWeek: recurDay }),
          nextDueDate: computeNextDueDate(recurFreq, recurDay),
        }
      : null;

    onSave({
      ...expense,
      amount: amountNum,
      category,
      note: note.trim(),
      date,
      sorted,
      recurring,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(expense.id);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="sheet-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={isNew ? 'New expense' : 'Edit expense'}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span className="sheet-title">{isNew ? 'New expense' : 'Edit expense'}</span>
          <div style={{ display: 'flex' }}>
            {!isNew && (
              <button className="btn-clay btn-clay-danger" onClick={handleDelete} id="btn-delete-expense">
                Delete
              </button>
            )}
            <button className="btn-clay" onClick={onClose} id="btn-cancel-expense">Cancel</button>
            <button
              className="btn-clay btn-clay-primary"
              onClick={handleSave}
              id="btn-save-expense"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Save
            </button>
          </div>
        </div>

        <div className="sheet-body">
          {/* Amount */}
          <div className="field">
            <label className="field-label" htmlFor="expense-amount">Amount (₹)</label>
            <input
              id="expense-amount"
              ref={amountRef}
              className="field-input field-input-mono"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              min="0"
            />
          </div>

          {/* Category */}
          <div className="field">
            <label className="field-label">Category</label>
            <div className="category-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {CATEGORY_GRID_ORDER.map((key) => {
                const c = EXPENSE_CATEGORIES[key];
                return (
                  <button
                    key={key}
                    className="category-cell"
                    style={{
                      minHeight: 52,
                      padding: '8px 4px',
                      backgroundColor: category === key ? c.color : undefined,
                      color: category === key ? '#FFFFFF' : undefined,
                      border: category === key ? 'none' : undefined,
                    }}
                    onClick={() => setCategory(key)}
                    aria-pressed={category === key}
                    id={`edit-cat-${key}`}
                  >
                    <Icon name={c.icon} size={16} color={category === key ? '#FFFFFF' : c.color} />
                    <span className="category-cell-label" style={{ color: category === key ? '#FFFFFF' : undefined }}>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div className="field">
            <label className="field-label" htmlFor="expense-note">Note</label>
            <input
              id="expense-note"
              className="field-input"
              type="text"
              placeholder="What was this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* Date */}
          <div className="field">
            <label className="field-label" htmlFor="expense-date">Date</label>
            <input
              id="expense-date"
              className="field-input field-input-mono"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Sorted toggle */}
          {expense?.sorted === false && (
            <div className="field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="field-label" style={{ margin: 0 }}>Mark as categorized</label>
                <button
                  className="btn-text btn-text-primary"
                  onClick={() => setSorted(true)}
                  id="btn-mark-sorted"
                  style={{ minHeight: 0, fontSize: 13 }}
                >
                  {sorted ? '✓ Done' : 'Mark sorted'}
                </button>
              </div>
            </div>
          )}

          {/* Recurring */}
          <div className="field">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="field-label" style={{ margin: 0 }}>Recurring</label>
              <button
                className={`pill${isRecurring ? ' active' : ''}`}
                onClick={() => setIsRecurring(!isRecurring)}
                id="btn-toggle-recurring"
                style={{ minHeight: 0 }}
              >
                {isRecurring ? 'Yes' : 'No'}
              </button>
            </div>
            {isRecurring && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['monthly', 'weekly'].map((f) => (
                  <button
                    key={f}
                    className={`pill${recurFreq === f ? ' active' : ''}`}
                    onClick={() => setRecurFreq(f)}
                    id={`recur-freq-${f}`}
                    style={{ minHeight: 0 }}
                  >
                    {f}
                  </button>
                ))}
                <input
                  className="field-input field-input-mono"
                  type="number"
                  inputMode="numeric"
                  placeholder={recurFreq === 'monthly' ? 'Day of month' : 'Day (0=Sun)'}
                  value={recurDay}
                  onChange={(e) => setRecurDay(parseInt(e.target.value, 10) || 1)}
                  min="0"
                  max={recurFreq === 'monthly' ? 31 : 6}
                  style={{ width: 140, marginTop: 0 }}
                  id="recur-day-input"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function computeNextDueDate(frequency, day) {
  const today = new Date();
  const next = new Date(today);
  if (frequency === 'monthly') {
    next.setDate(day);
    if (next <= today) next.setMonth(next.getMonth() + 1);
  } else {
    const diff = (day - today.getDay() + 7) % 7;
    next.setDate(today.getDate() + (diff === 0 ? 7 : diff));
  }
  return getLocalDateString(next);
}
