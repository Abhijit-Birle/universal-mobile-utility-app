import { VALID_EXPENSE_CATEGORIES, EXPENSE_CATEGORIES } from '../../constants/categories.js';
import { ChevronDown } from 'lucide-react';

export default function FilterBar({ filters, setFilters, theme, fontBody, fontDisplay, NeoSurface, NeoInput }) {
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  return (
    <NeoSurface style={{ padding: 16, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 13, margin: 0, color: theme.textSecondary, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', ...fontDisplay }}>Filters</h3>
        <button 
          onClick={handleClear} 
          style={{ background: 'none', border: 'none', color: theme.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', ...fontBody }}
        >
          Clear All
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Date Range */}
        <div style={{ display: 'flex', flex: 1, minWidth: 200, gap: 8 }}>
          <NeoInput 
            type="date" 
            style={{ margin: 0, flex: 1, padding: '8px', fontSize: 12, height: 40 }}
            value={filters.startDate}
            onChange={(e) => updateFilter('startDate', e.target.value)}
          />
          <NeoInput 
            type="date" 
            style={{ margin: 0, flex: 1, padding: '8px', fontSize: 12, height: 40 }}
            value={filters.endDate}
            onChange={(e) => updateFilter('endDate', e.target.value)}
          />
        </div>

        {/* Category */}
        <div style={{ flex: 1, minWidth: 120, position: 'relative' }}>
          <select 
            style={{ 
              width: "100%",
              height: 40,
              boxSizing: "border-box",
              background: theme.bg,
              boxShadow: theme.shadowPressed,
              border: "none",
              borderRadius: 14,
              padding: "0 34px 0 14px",
              color: theme.textPrimary,
              fontSize: 13,
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
              cursor: "pointer",
              ...fontBody,
            }}
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
          >
            <option value="" style={{ color: theme.textPrimary, background: theme.bg }}>All Categories</option>
            {VALID_EXPENSE_CATEGORIES.map(key => (
              <option key={key} value={key} style={{ color: theme.textPrimary, background: theme.bg }}>
                {EXPENSE_CATEGORIES[key]?.label || key}
              </option>
            ))}
          </select>
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: theme.textSecondary, display: 'flex', alignItems: 'center' }}>
            <ChevronDown size={16} />
          </div>
        </div>
        
        {/* Amount Range */}
        <div style={{ display: 'flex', flex: 1, minWidth: 140, gap: 8 }}>
          <NeoInput 
            type="number" 
            placeholder="Min ₹"
            style={{ margin: 0, flex: 1, padding: '8px', fontSize: 12, height: 40 }}
            value={filters.minAmount}
            onChange={(e) => updateFilter('minAmount', e.target.value)}
          />
          <NeoInput 
            type="number" 
            placeholder="Max ₹"
            style={{ margin: 0, flex: 1, padding: '8px', fontSize: 12, height: 40 }}
            value={filters.maxAmount}
            onChange={(e) => updateFilter('maxAmount', e.target.value)}
          />
        </div>
      </div>
    </NeoSurface>
  );
}
