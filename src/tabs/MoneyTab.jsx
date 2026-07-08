import { useState, useMemo } from 'react';
import QuickCapture from '../components/expenses/QuickCapture.jsx';
import ExpenseEditor from '../components/expenses/ExpenseEditor.jsx';
import BudgetSettings from '../components/expenses/BudgetSettings.jsx';
import FilterBar from '../components/expenses/FilterBar.jsx';
import Icon from '../components/ui/Icon.jsx';
import { EXPENSE_CATEGORIES } from '../constants/categories.js';
import { useExpenses } from '../hooks/useExpenses.js';
import { generateExpenseCsv, downloadCsv } from '../utils/exportCsv.js';

export default function MoneyTab({ theme, NeoSurface, NeoInput, PrimaryButton, SectionLabel, fontDisplay, fontBody }) {
  const {
    expenses,
    budgets,
    loading,
    undoBuffer,
    quickCapture,
    addExpense,
    updateExpense,
    deleteExpense,
    undoDeleteExpense,
    dismissUndo,
    updateBudget
  } = useExpenses();

  const [editorState, setEditorState] = useState(null);
  const [showBudgetSettings, setShowBudgetSettings] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    minAmount: '',
    maxAmount: ''
  });

  const handleEdit = (expense) => {
    setEditorState({ mode: 'edit', expense, initialCategory: null });
  };

  const handleClose = () => setEditorState(null);

  const handleSave = (expenseData) => {
    if (!expenseData.id) addExpense(expenseData);
    else updateExpense(expenseData.id, expenseData);
  };

  const handleExport = () => {
    const csv = generateExpenseCsv(filteredExpenses);
    downloadCsv(csv, 'neoapp_expenses.csv');
  };

  // ─── Filtering ─────────────────────────────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (filters.startDate && new Date(e.date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(e.date) > new Date(filters.endDate)) return false;
      if (filters.category && e.category !== filters.category) return false;
      if (filters.minAmount && e.amount < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && e.amount > parseFloat(filters.maxAmount)) return false;
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, filters]);

  // Group filtered expenses by category
  const grouped = filteredExpenses.reduce((acc, exp) => {
    const catId = exp.category || 'other';
    const cat = EXPENSE_CATEGORIES[catId] || EXPENSE_CATEGORIES.other;
    if (!acc[catId]) acc[catId] = { cat, expenses: [] };
    acc[catId].expenses.push(exp);
    return acc;
  }, {});
  
  const groups = Object.values(grouped).sort((a, b) => b.expenses.length - a.expenses.length);

  // ─── Budgets (Current Month) ───────────────────────────────────────────────
  const now = new Date();
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  const monthSpendByCategory = currentMonthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const activeBudgets = Object.entries(budgets)
    .map(([cat, data]) => ({
      category: cat,
      monthlyLimit: data.monthlyLimit || 0,
      spent: monthSpendByCategory[cat] || 0
    }))
    .filter(b => b.monthlyLimit > 0);

  if (loading) {
    return <div style={{ padding: 20, color: theme.textSecondary, ...fontBody }}>Loading expenses...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {undoBuffer && (
        <div style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: theme.textPrimary, color: theme.bg, padding: '12px 24px',
          borderRadius: 24, zIndex: 100, display: 'flex', gap: 16, alignItems: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', ...fontBody
        }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Expense deleted</span>
          <button onClick={undoDeleteExpense} style={{ background: 'none', border: 'none', color: theme.bg, fontWeight: 700, cursor: 'pointer' }}>UNDO</button>
          <button onClick={dismissUndo} style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div className="scroll-content" style={{ padding: '24px 18px 100px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: theme.textPrimary, margin: 0, ...fontDisplay }}>Expense Tracker</h2>
            <p style={{ fontSize: 14, color: theme.textSecondary, margin: '4px 0 0 0', ...fontBody }}>Track your spending</p>
          </div>
          <button 
            onClick={handleExport} 
            style={{ 
              background: theme.bg, 
              color: theme.textPrimary, 
              border: 'none', 
              boxShadow: theme.shadowRaised,
              borderRadius: 12,
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              ...fontBody
            }}
          >
            <Icon name="download" size={16} /> CSV
          </button>
        </div>

        <QuickCapture 
          onCaptureExpense={quickCapture} 
          onOpenEditor={() => setEditorState({ mode: 'new', expense: null, initialCategory: 'other' })} 
          theme={theme} fontBody={fontBody}
        />

        <div style={{ marginTop: 24 }}>
          <FilterBar filters={filters} setFilters={setFilters} theme={theme} fontBody={fontBody} fontDisplay={fontDisplay} NeoSurface={NeoSurface} NeoInput={NeoInput} />
        </div>

        {activeBudgets.length > 0 && (
          <div style={{ marginTop: 24, marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <SectionLabel label="Budgets" />
              <button onClick={() => setShowBudgetSettings(true)} style={{ background: 'none', border: 'none', color: theme.accent, fontWeight: 600, fontSize: 13, cursor: 'pointer', ...fontBody }}>
                Edit
              </button>
            </div>
            
            <NeoSurface style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {activeBudgets.map(b => {
                const catData = EXPENSE_CATEGORIES[b.category];
                const pct = Math.min(100, (b.spent / b.monthlyLimit) * 100);
                const over80 = pct >= 80 && pct < 100;
                const over100 = pct >= 100;
                
                let barColor = catData ? catData.color : theme.accent;
                if (over100) barColor = '#ff6b6b';
                else if (over80) barColor = 'orange';

                return (
                  <div key={b.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ color: theme.textPrimary, fontSize: 15, fontWeight: 600, ...fontBody }}>
                        {catData ? catData.label : b.category}
                      </span>
                      <span style={{ color: over100 ? '#ff6b6b' : theme.textSecondary, fontSize: 15, fontWeight: 600, ...fontBody }}>
                        ₹{b.spent.toLocaleString()} / ₹{b.monthlyLimit.toLocaleString()}
                      </span>
                    </div>
                    <NeoSurface pressed style={{ height: 10, padding: 0, borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 5, background: barColor, transition: 'width 0.3s ease, background-color 0.3s ease' }} />
                    </NeoSurface>
                    {over100 && <div style={{ fontSize: 11, color: '#ff6b6b', marginTop: 6, fontWeight: 600, ...fontBody }}>Over budget!</div>}
                    {over80 && !over100 && <div style={{ fontSize: 11, color: 'orange', marginTop: 6, fontWeight: 600, ...fontBody }}>Nearing limit</div>}
                  </div>
                );
              })}
            </NeoSurface>
          </div>
        )}

        {activeBudgets.length === 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => setShowBudgetSettings(true)} style={{ background: 'none', border: 'none', color: theme.accent, fontWeight: 600, fontSize: 13, cursor: 'pointer', ...fontBody }}>
              + Add Budgets
            </button>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <SectionLabel label="Transactions" />
          {groups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.textSecondary, ...fontBody }}>
              No expenses found
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
              {groups.map((group) => {
                const total = group.expenses.reduce((s, e) => s + (e.amount || 0), 0);
                return (
                  <NeoSurface key={group.cat.id || group.cat.label} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 36, height: 36, borderRadius: 12, 
                          background: theme.bg, boxShadow: theme.shadowRaisedSm, 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          color: group.cat.color 
                        }}>
                          <Icon name={group.cat.icon} size={20} />
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>{group.cat.label}</span>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, ...fontBody }}>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 48 }}>
                      {group.expenses.map(exp => (
                        <div key={exp.id} onClick={() => handleEdit(exp)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 14, color: theme.textPrimary, fontWeight: 500, ...fontBody }}>{exp.note || 'Entry'}</span>
                            <span style={{ fontSize: 11, color: theme.textSecondary, display: 'flex', gap: 8, ...fontBody }}>
                              {exp.date} {exp.subcategory ? `• ${exp.subcategory}` : ''} 
                              {exp.recurring && ' • 🔄'}
                            </span>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#ff6b6b', ...fontBody }}>
                            -₹{exp.amount?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </NeoSurface>
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
          onDelete={deleteExpense}
          onClose={handleClose}
          theme={theme}
          fontDisplay={fontDisplay}
          fontBody={fontBody}
          NeoSurface={NeoSurface}
          PrimaryButton={PrimaryButton}
          NeoInput={NeoInput}
        />
      )}

      {showBudgetSettings && (
        <BudgetSettings
          budgets={budgets}
          onUpdateBudget={updateBudget}
          onClose={() => setShowBudgetSettings(false)}
          theme={theme}
          fontDisplay={fontDisplay}
          fontBody={fontBody}
          NeoSurface={NeoSurface}
          PrimaryButton={PrimaryButton}
          NeoInput={NeoInput}
        />
      )}
    </div>
  );
}
