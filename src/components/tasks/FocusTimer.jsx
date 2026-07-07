import { useState, useEffect, useRef } from 'react';
import Icon from '../ui/Icon.jsx';

export default function FocusTimer({ task, onClose }) {
  const initialSeconds = (task.estimatedMinutes || 25) * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsFinished(true);
      // Play a sound or vibrate if possible
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([200, 100, 200]);
      }
    }
    
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');

  const pct = 100 - (timeLeft / initialSeconds) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-app)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      padding: 'env(safe-area-inset-top, 20px) 20px 20px 20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0' }}>
        <button onClick={onClose} style={{ padding: 8 }}>
          <Icon name="x" size={24} />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 20,
          color: 'var(--text-secondary)',
          marginBottom: 40,
          textAlign: 'center',
          padding: '0 20px'
        }}>
          Focusing on:<br/>
          <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{task.title}</span>
        </p>

        <div style={{
          position: 'relative',
          width: 240, height: 240,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: 60
        }}>
          <svg style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle
              cx="120" cy="120" r="110"
              fill="none"
              stroke="var(--bg-input)"
              strokeWidth="6"
            />
            <circle
              cx="120" cy="120" r="110"
              fill="none"
              stroke="var(--accent-work)"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={(2 * Math.PI * 110) * (1 - (timeLeft / initialSeconds))}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 56,
            fontWeight: 300,
            color: isFinished ? 'var(--accent-work)' : 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {mm}:{ss}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="btn-clay btn-clay-primary"
            style={{ width: 80, height: 80, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name={isRunning ? "pause" : "play"} size={32} />
          </button>
          
          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(initialSeconds);
              setIsFinished(false);
            }}
            className="btn-clay"
            style={{ width: 60, height: 60, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}
          >
            <Icon name="rotate-ccw" size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
