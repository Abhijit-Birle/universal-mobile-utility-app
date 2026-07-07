import ProgressBar from './ProgressBar.jsx';
import '../../styles/insights.css';

export default function WeeklyBudget({ weeklyTotal, weeklyBudget }) {
  const over = weeklyTotal > weeklyBudget;
  return (
    <div className="insight-section">
      <p className="insight-section-label">Weekly budget</p>
      <ProgressBar
        value={weeklyTotal}
        max={weeklyBudget}
        color={over ? 'var(--priority-high)' : 'var(--accent-money)'}
        label={`₹${weeklyTotal.toLocaleString('en-IN')} spent`}
        sublabel={`of ₹${weeklyBudget.toLocaleString('en-IN')}`}
      />
      {over && (
        <p style={{ marginTop: 6, fontSize: 12, color: 'var(--priority-high)', fontFamily: 'var(--font-serif)' }}>
          Over budget by ₹{(weeklyTotal - weeklyBudget).toLocaleString('en-IN')}
        </p>
      )}
    </div>
  );
}
