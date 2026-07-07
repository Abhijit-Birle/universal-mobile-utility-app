import Icon from '../ui/Icon.jsx';
import { EXPENSE_CATEGORIES, CATEGORY_GRID_ORDER } from '../../constants/categories.js';
import '../../styles/expenses.css';

/**
 * 3x3 category picker grid.
 * Each cell shows an icon, a 6px accent dot, and the category label.
 * Tapping opens an amount entry sheet.
 */
export default function CategoryGrid({ onCategorySelect }) {
  return (
    <div className="category-section">
      <p className="category-section-label eyebrow">Log expense</p>
      <div className="category-grid" role="grid" aria-label="Expense categories">
        {CATEGORY_GRID_ORDER.map((key) => {
          const cat = EXPENSE_CATEGORIES[key];
          return (
            <button
              key={key}
              className="category-cell"
              onClick={() => onCategorySelect(key)}
              aria-label={`Log ${cat.label} expense`}
              id={`cat-${key}`}
              role="gridcell"
            >
              <Icon name={cat.icon} size={22} color={cat.color} />
              <div className="dot" style={{ background: cat.color }} />
              <span className="category-cell-label">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
