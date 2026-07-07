import Icon from '../ui/Icon.jsx';
import { EXPENSE_CATEGORIES } from '../../constants/categories.js';
import '../../styles/expenses.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatAmount(amount) {
  return `₹${(amount || 0).toLocaleString('en-IN')}`;
}

/**
 * Clay expense card: icon wrap + note + category meta + mono amount.
 */
export default function ExpenseRow({ expense, onEdit }) {
  const cat = EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES.other;
  const isUnsorted = !expense.sorted;

  return (
    <div
      className="expense-card"
      onClick={() => onEdit(expense)}
      role="listitem"
      aria-label={`Expense: ${expense.note || cat.label}, ${formatAmount(expense.amount)}`}
    >
      {/* Icon wrap */}
      <div className="expense-icon-wrap">
        <Icon name={cat.icon} size={16} color={cat.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className={`expense-note${isUnsorted ? ' unsorted' : ''}`}>
          {expense.note || cat.label}
          {isUnsorted && ' — sort later'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
          <div className="dot" style={{ background: cat.color }} />
          <span className="expense-meta">{cat.label}</span>
          {expense.date && (
            <>
              <span className="expense-meta">·</span>
              <span className="expense-meta">{formatDate(expense.date)}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <span className="expense-amount">{formatAmount(expense.amount)}</span>
    </div>
  );
}
