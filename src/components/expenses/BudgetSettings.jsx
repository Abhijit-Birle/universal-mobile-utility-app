import { useState } from 'react';
import { VALID_EXPENSE_CATEGORIES, EXPENSE_CATEGORIES } from '../../constants/categories.js';

export default function BudgetSettings({ budgets, onUpdateBudget, onClose, theme, NeoSurface, PrimaryButton, NeoInput, fontDisplay, fontBody }) {
  const [localBudgets, setLocalBudgets] = useState({ ...budgets });

  const handleChangeLimit = (cat, value) => {
    const num = parseFloat(value) || 0;
    setLocalBudgets(prev => ({
      ...prev,
      [cat]: { ...prev[cat], monthlyLimit: num }
    }));
  };

  const handleToggleRollover = (cat) => {
    setLocalBudgets(prev => ({
      ...prev,
      [cat]: { ...prev[cat], rolloverEnabled: !prev[cat]?.rolloverEnabled }
    }));
  };

  const handleSave = () => {
    for (const [cat, data] of Object.entries(localBudgets)) {
      onUpdateBudget(cat, data.monthlyLimit || 0, !!data.rolloverEnabled);
    }
    onClose();
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} 
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      role="dialog" 
      aria-modal="true"
    >
      <NeoSurface style={{ width: '90%', maxWidth: 400, maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}` }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Budget Settings</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textSecondary, fontWeight: 600, fontSize: 14, cursor: 'pointer', ...fontBody }}>Cancel</button>
            <PrimaryButton label="Save" onClick={handleSave} style={{ padding: '8px 16px' }} />
          </div>
        </div>

        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          <p style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 24, ...fontBody }}>
            Set a monthly limit for each category. Enabling rollover carries unused budget forward to the next month.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {VALID_EXPENSE_CATEGORIES.map(catKey => {
              const b = localBudgets[catKey] || { monthlyLimit: 0, rolloverEnabled: false };
              const catData = EXPENSE_CATEGORIES[catKey];
              return (
                <NeoSurface pressed key={catKey} style={{ padding: 16, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: theme.textPrimary, fontSize: 15, ...fontBody }}>
                      {catData ? catData.label : catKey}
                    </span>
                    <button 
                      onClick={() => handleToggleRollover(catKey)}
                      style={{ 
                        background: b.rolloverEnabled ? theme.accent : theme.bg, 
                        color: b.rolloverEnabled ? '#fff' : theme.textSecondary,
                        boxShadow: b.rolloverEnabled ? 'none' : theme.shadowRaisedSm,
                        border: 'none', borderRadius: 12, padding: '4px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', ...fontBody 
                      }}
                    >
                      {b.rolloverEnabled ? 'Rollover: ON' : 'Rollover: OFF'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: theme.textSecondary, fontSize: 14, ...fontBody }}>Limit (₹):</span>
                    <NeoInput 
                      type="number" 
                      value={b.monthlyLimit || ''}
                      onChange={(e) => handleChangeLimit(catKey, e.target.value)}
                      placeholder="0"
                      style={{ flex: 1, margin: 0, padding: '8px 12px' }}
                    />
                  </div>
                </NeoSurface>
              );
            })}
          </div>
        </div>
      </NeoSurface>
    </div>
  );
}
