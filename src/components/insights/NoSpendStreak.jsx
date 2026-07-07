import '../../styles/insights.css';

export default function NoSpendStreak({ streak }) {
  return (
    <>
      <p className="insight-section-label" style={{ color: 'var(--text-on-peach)' }}>
        No-spend streak
      </p>
      <div className="streak-display">
        <span style={{ fontSize: 36 }}>{streak > 0 ? '🔥' : '—'}</span>
        <div>
          <div className="streak-number" style={{ color: 'var(--text-on-peach)' }}>{streak}</div>
          <div className="streak-label" style={{ color: 'var(--text-on-peach)', opacity: 0.8 }}>
            {streak === 1 ? 'day' : 'days'} without spending
          </div>
        </div>
      </div>
    </>
  );
}
