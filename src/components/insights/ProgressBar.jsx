import '../../styles/insights.css';

/**
 * Thin 3-5px progress bar with rounded ends.
 * Spec: no gradient, just a flat fill.
 */
export default function ProgressBar({ value, max, color = 'var(--accent-study)', label, sublabel }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div>
      {(label || sublabel) && (
        <div className="progress-labels">
          {label && <span className="progress-label-left">{label}</span>}
          {sublabel && <span className="progress-label-right">{sublabel}</span>}
        </div>
      )}
      <div className="progress-track" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
