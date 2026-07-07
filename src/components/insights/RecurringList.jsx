import Icon from '../ui/Icon.jsx';
import { EXPENSE_CATEGORIES } from '../../constants/categories.js';
import { TASK_DOMAINS } from '../../constants/domains.js';
import '../../styles/insights.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function isOverdue(dateStr) {
  return dateStr && new Date(dateStr) < new Date();
}

/**
 * Unified list of all recurring tasks + expenses with next due dates.
 * Read-only — this tab never writes data.
 */
export default function RecurringList({ recurringTasks, recurringExpenses }) {
  const allItems = [
    ...recurringTasks.map((t) => ({
      id: t.id,
      type: 'task',
      label: t.title,
      color: TASK_DOMAINS[t.domain]?.color || 'var(--text-muted)',
      nextDueDate: t.recurring?.nextDueDate,
      frequency: t.recurring?.frequency,
    })),
    ...recurringExpenses.map((e) => ({
      id: e.id,
      type: 'expense',
      label: e.note || EXPENSE_CATEGORIES[e.category]?.label || e.category,
      color: EXPENSE_CATEGORIES[e.category]?.color || 'var(--text-muted)',
      nextDueDate: e.recurring?.nextDueDate,
      frequency: e.recurring?.frequency,
      amount: e.amount,
    })),
  ].sort((a, b) => {
    if (!a.nextDueDate) return 1;
    if (!b.nextDueDate) return -1;
    return new Date(a.nextDueDate) - new Date(b.nextDueDate);
  });

  if (allItems.length === 0) {
    return (
      <div className="insight-section">
        <p className="insight-section-label">Recurring</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-serif)' }}>
          No recurring items set up yet
        </p>
      </div>
    );
  }

  return (
    <div className="insight-section">
      <p className="insight-section-label">Recurring</p>
      <div role="list">
        {allItems.map((item) => (
          <div key={`${item.type}-${item.id}`} className="recurring-row" role="listitem">
            <div className="dot" style={{ background: item.color }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="recurring-row-label">{item.label}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                <Icon name="repeat" size={10} color="var(--text-muted)" />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-serif)' }}>
                  {item.frequency}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {item.amount !== undefined && (
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--text-secondary)',
                    marginBottom: 2,
                  }}
                >
                  ₹{item.amount.toLocaleString('en-IN')}
                </p>
              )}
              <p className={`recurring-row-date${isOverdue(item.nextDueDate) ? ' overdue' : ''}`}>
                {isOverdue(item.nextDueDate) ? '⚠ ' : ''}
                {formatDate(item.nextDueDate)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
