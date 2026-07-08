import { useState, useRef, useEffect } from 'react';
import Icon from '../ui/Icon.jsx';
import { EXPENSE_CATEGORIES, CATEGORY_GRID_ORDER } from '../../constants/categories.js';
import { getLocalDateString } from '../../utils/date.js';

export default function ExpenseEditor({
  expense,
  initialCategory,
  onSave,
  onDelete,
  onClose,
  theme, fontDisplay, fontBody, NeoSurface, PrimaryButton, NeoInput
}) {
  const isNew = !expense?.id;
  const [amount, setAmount]     = useState(expense?.amount ? String(expense.amount) : '');
  const [category, setCategory] = useState(expense?.category || initialCategory || 'other');
  const [subcategory, setSubcategory] = useState(expense?.subcategory || '');
  const [note, setNote]         = useState(expense?.note || '');
  const [date, setDate]         = useState(expense?.date || getLocalDateString());
  const [tags, setTags]         = useState(expense?.tags?.join(', ') || '');
  
  const [isRecurring, setIsRecurring] = useState(!!expense?.recurring);
  const [recurFreq, setRecurFreq]     = useState(expense?.recurrenceInterval && expense.recurrenceInterval !== 'none' ? expense.recurrenceInterval : 'monthly');
  
  const amountRef = useRef(null);

  useEffect(() => {
    if (amountRef.current) setTimeout(() => amountRef.current?.focus(), 200);
  }, []);

  const cat = EXPENSE_CATEGORIES[category] || EXPENSE_CATEGORIES.other;

  const handleSave = () => {
    const amountNum = parseFloat(amount) || 0;
    if (amountNum <= 0) return;

    const parsedTags = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t);

    onSave({
      ...expense,
      amount: amountNum,
      category,
      subcategory: subcategory.trim(),
      note: note.trim(),
      date,
      tags: parsedTags,
      recurring: isRecurring,
      recurrenceInterval: isRecurring ? recurFreq : 'none',
    });
    onClose();
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} 
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}
      role="dialog" 
      aria-modal="true"
    >
      <div style={{ width: '100%', background: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 30px rgba(0,0,0,0.2)' }}>
        
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}` }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>{isNew ? 'New expense' : 'Edit expense'}</span>
          <div style={{ display: 'flex', gap: 12 }}>
            {!isNew && (
              <button onClick={() => { onDelete(expense.id); onClose(); }} style={{ background: 'none', border: 'none', color: '#ff6b6b', fontWeight: 600, fontSize: 14, cursor: 'pointer', ...fontBody }}>Delete</button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textSecondary, fontWeight: 600, fontSize: 14, cursor: 'pointer', ...fontBody }}>Cancel</button>
            <PrimaryButton label="Save" onClick={handleSave} disabled={!amount || parseFloat(amount) <= 0} style={{ padding: '8px 16px' }} />
          </div>
        </div>

        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 500, ...fontBody }}>Amount (₹)</label>
            <NeoInput
              ref={amountRef}
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              style={{ fontSize: 24, padding: '16px', fontWeight: 600, ...fontBody }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 500, ...fontBody }}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {CATEGORY_GRID_ORDER.map((key) => {
                const c = EXPENSE_CATEGORIES[key];
                const isSelected = category === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    style={{
                      minHeight: 52,
                      padding: '8px 4px',
                      background: isSelected ? c.color : theme.bg,
                      color: isSelected ? '#FFFFFF' : theme.textPrimary,
                      boxShadow: isSelected ? 'none' : theme.shadowRaisedSm,
                      border: 'none',
                      borderRadius: 16,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                      cursor: 'pointer', ...fontBody
                    }}
                  >
                    <Icon name={c.icon} size={16} color={isSelected ? '#FFFFFF' : c.color} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 500, ...fontBody }}>Subcategory (optional)</label>
            <NeoInput type="text" placeholder="e.g. Groceries, Fuel" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 500, ...fontBody }}>Note</label>
            <NeoInput type="text" placeholder="What was this for?" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 500, ...fontBody }}>Tags (comma separated)</label>
            <NeoInput type="text" placeholder="e.g. trip, office" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 500, ...fontBody }}>Date</label>
            <NeoInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 500, ...fontBody }}>Recurring</label>
              <button
                onClick={() => setIsRecurring(!isRecurring)}
                style={{
                  background: isRecurring ? theme.accent : theme.bg,
                  color: isRecurring ? '#fff' : theme.textSecondary,
                  boxShadow: isRecurring ? 'none' : theme.shadowRaisedSm,
                  border: 'none', borderRadius: 12, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', ...fontBody
                }}
              >
                {isRecurring ? 'Yes' : 'No'}
              </button>
            </div>
            {isRecurring && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {['monthly', 'weekly'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setRecurFreq(f)}
                    style={{
                      background: recurFreq === f ? theme.accent2 : theme.bg,
                      color: recurFreq === f ? '#fff' : theme.textSecondary,
                      boxShadow: recurFreq === f ? 'none' : theme.shadowRaisedSm,
                      border: 'none', borderRadius: 12, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', ...fontBody
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
