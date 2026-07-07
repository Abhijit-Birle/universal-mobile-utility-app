import { useState } from 'react';
import QuickCapture from '../components/expenses/QuickCapture.jsx';
import ExpenseEditor from '../components/expenses/ExpenseEditor.jsx';
import Icon from '../components/ui/Icon.jsx';
import { EXPENSE_CATEGORIES } from '../constants/categories.js';
import '../styles/expenses.css';

export default function MoneyTab({
  expenses,
  settings,
  onQuickCapture,
  onAdd,
  onUpdate,
  onDelete,
  getRecentExpenses,
}) {
  const [editorState, setEditorState] = useState(null);
  const [view, setView] = useState('month');

  const handleEdit = (expense) => {
    setEditorState({ mode: 'edit', expense, initialCategory: null });
  };

  const handleClose = () => setEditorState(null);

  const handleSave = (expenseData) => {
    if (!expenseData.id) onAdd(expenseData);
    else onUpdate(expenseData.id, expenseData);
  };

  const recent = getRecentExpenses(50);

  // Group by category
  const grouped = recent.reduce((acc, exp) => {
    const cat = EXPENSE_CATEGORIES[exp.category] || EXPENSE_CATEGORIES.other;
    if (!acc[cat.id]) acc[cat.id] = { cat, expenses: [] };
    acc[cat.id].expenses.push(exp);
    return acc;
  }, {});
  
  const groups = Object.values(grouped).sort((a, b) => b.expenses.length - a.expenses.length);

  // Budget calculations
  const budgetTotal = settings?.monthlyBudgetAmount || 50000;
  const thisMonthExpenses = expenses.filter(e => {
    const d = new Date(e.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthSpend = thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const budgetPercent = Math.min(100, Math.round((monthSpend / budgetTotal) * 100));
  
  const r = 60;
  const c = 2 * Math.PI * r;
  const dashoffset = c - (budgetPercent / 100) * c;

  // Mock bar chart data (last 7 days or weeks)
  const chartData = [40, 60, 20, 80, 50, 90, 30]; // percentages

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="scroll-content" style={{ paddingBottom: 100 }}>
        
        {/* Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div className="neu-inset" style={{ display: 'flex', padding: 4, borderRadius: 999, gap: 4 }}>
            <button
              className={view === 'week' ? "neu-card-sm" : ""}
              onClick={() => setView('week')}
              style={{ padding: '8px 24px', border: 'none', background: view === 'week' ? 'var(--bg-app)' : 'transparent', borderRadius: 999, fontSize: 13, fontWeight: view === 'week' ? 600 : 400, color: view === 'week' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
            >
              Week
            </button>
            <button
              className={view === 'month' ? "neu-card-sm" : ""}
              onClick={() => setView('month')}
              style={{ padding: '8px 24px', border: 'none', background: view === 'month' ? 'var(--bg-app)' : 'transparent', borderRadius: 999, fontSize: 13, fontWeight: view === 'month' ? 600 : 400, color: view === 'month' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
            >
              Month
            </button>
          </div>
        </div>

        {/* Big Budget Ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg-card-2)" strokeWidth="12" />
              <circle 
                cx="70" cy="70" r={r} fill="none" 
                stroke="var(--accent-primary)" 
                strokeWidth="12"
                strokeDasharray={c}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Spent</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>₹{(monthSpend/1000).toFixed(1)}k</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="neu-card" style={{ marginBottom: 24, padding: '20px 16px' }}>
          <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>Daily Spend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, paddingBottom: 24, position: 'relative' }}>
            {chartData.map((h, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ width: 16, height: `${h}%`, background: 'var(--accent-primary)', borderRadius: 8, boxShadow: 'var(--shadow-raised-sm)' }} />
                </div>
                <span style={{ position: 'absolute', bottom: 0, fontSize: 10, color: 'var(--text-muted)' }}>
                  {['S','M','T','W','T','F','S'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <QuickCapture 
          onCapture={onQuickCapture} 
          onOpenEditor={() => setEditorState({ mode: 'new', expense: null, initialCategory: 'other' })} 
        />
        
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>By Category</h3>
          {groups.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No expenses yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {groups.map((group) => {
                const total = group.expenses.reduce((s, e) => s + (e.amount || 0), 0);
                return (
                  <div key={group.cat.id} className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-app)', boxShadow: 'var(--shadow-raised-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: group.cat.color }}>
                          <Icon name={group.cat.icon} size={18} />
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{group.cat.label}</span>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 40 }}>
                      {group.expenses.map(exp => (
                        <div key={exp.id} onClick={() => handleEdit(exp)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <span>{exp.note || 'Entry'}</span>
                          <span>₹{exp.amount?.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editorState && (
        <ExpenseEditor
          expense={editorState.expense}
          initialCategory={editorState.initialCategory}
          onSave={handleSave}
          onDelete={onDelete}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
