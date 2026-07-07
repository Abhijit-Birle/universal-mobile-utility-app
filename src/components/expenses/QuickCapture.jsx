import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import '../../styles/expenses.css';
import { EXPENSE_CATEGORIES } from '../../constants/categories.js';

export default function QuickCapture({ onCaptureExpense, onCaptureTask, onCaptureHabit, onOpenEditor }) {
  const [val, setVal] = useState('');

  const type = val.toLowerCase().startsWith('task:') ? 'task' :
               val.toLowerCase().startsWith('habit:') ? 'habit' : 'expense';

  // Auto-detect category
  const detectCategory = (text) => {
    if (!text) return null;
    const lower = text.toLowerCase();
    const found = Object.values(EXPENSE_CATEGORIES).find(c =>
      c.keywords.some(kw => lower.includes(kw))
    );
    return found ? found.label : null;
  };
  
  const detectedCat = type === 'expense' ? detectCategory(val) : null;
  
  let tagText = '';
  let tagColor = 'var(--text-secondary)';
  if (type === 'task') { tagText = 'Task'; tagColor = 'var(--accent-primary)'; }
  else if (type === 'habit') { tagText = 'Habit'; tagColor = 'var(--accent-secondary)'; }
  else if (detectedCat) { tagText = detectedCat; }
  else if (val.trim()) { tagText = 'Expense'; }

  const handleSubmit = () => {
    const txt = val.trim();
    if (!txt) {
      if (onOpenEditor) onOpenEditor();
      return;
    }
    
    if (type === 'task' && onCaptureTask) {
      onCaptureTask({ title: txt.substring(5).trim() });
    } else if (type === 'habit' && onCaptureHabit) {
      onCaptureHabit(txt.substring(6).trim());
    } else if (onCaptureExpense) {
      onCaptureExpense(txt);
    }
    setVal('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="neu-inset" style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderRadius: 24 }}>
      <button
        onClick={handleSubmit}
        style={{
          background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent-primary)', cursor: 'pointer',
          padding: 8
        }}
        aria-label="Add"
      >
        <Icon name="plus" size={20} />
      </button>
      
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        type="text"
        inputMode="text"
        placeholder="Quick add: 1200 coffee or task: email boss"
        onKeyDown={handleKey}
        style={{
          flex: 1,
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: 15, color: 'var(--text-primary)', padding: '8px 12px'
        }}
        aria-label="Quick add"
        autoComplete="off"
      />
      
      {tagText && (
        <div className="neu-card-sm" style={{ 
          padding: '4px 10px', 
          borderRadius: 12, 
          fontSize: 12, 
          color: tagColor,
          fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 4 
        }}>
          {tagText}
        </div>
      )}
    </div>
  );
}
