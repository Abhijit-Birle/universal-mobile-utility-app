import ProgressBar from './ProgressBar.jsx';
import '../../styles/insights.css';

function monthsRemaining(targetDate) {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  const now = new Date();
  const diff = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return Math.max(0, diff);
}

export default function RelocationRunway({ settings }) {
  const { relocationGoalAmount, relocationSavedAmount, relocationTargetDate } = settings;
  const pct = relocationGoalAmount > 0
    ? Math.round((relocationSavedAmount / relocationGoalAmount) * 100)
    : 0;
  const months = monthsRemaining(relocationTargetDate);

  return (
    <div className="insight-section">
      <p className="insight-section-label">Relocation runway</p>
      <ProgressBar
        value={relocationSavedAmount}
        max={relocationGoalAmount}
        color="var(--accent-relocation)"
        label={`₹${relocationSavedAmount.toLocaleString('en-IN')} saved`}
        sublabel={`₹${relocationGoalAmount.toLocaleString('en-IN')} goal · ${pct}%`}
      />
      {months !== null && (
        <p style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-serif)' }}>
          {months > 0 ? `${months} months remaining` : 'Target date passed'}
          {relocationTargetDate && (
            <span style={{ fontFamily: 'var(--font-mono)', marginLeft: 6 }}>
              {new Date(relocationTargetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
