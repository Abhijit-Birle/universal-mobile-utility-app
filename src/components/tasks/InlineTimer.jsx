import { useState, useEffect } from 'react';
import Icon from '../ui/Icon.jsx';
import './InlineTimer.css';

export default function InlineTimer({
  tasks,
  timerState,
  selectTask,
  setCustomTitle,
  setDuration,
  startTimer,
  stopTimer,
  pauseTimer,
  addTime,
  saveSession,
  deleteHistoryItem,
  setMode,
}) {
  const { mode = 'focus', selectedTaskId, customTitle, durationSeconds, remainingSeconds, endTime, isRunning, history } = timerState;
  
  const [timeLeft, setTimeLeft] = useState(() => {
    if (isRunning && endTime) {
      const now = Date.now();
      return Math.max(0, Math.ceil((endTime - now) / 1000));
    }
    return remainingSeconds;
  });
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(remainingSeconds);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        stopTimer();
        const finalTitle = tasks.find(t => t.id === selectedTaskId)?.title || customTitle || (mode === 'break' ? 'Break Time' : 'Focus Session');
        
        // Only save focus sessions to history
        if (mode === 'focus') {
          saveSession(finalTitle, durationSeconds, null);
        }

        // Vibrate
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([200, 100, 200]);
        }

        // Play Sound
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
            
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 1);
          }
        } catch(e) {
          console.error("Audio error", e);
        }

        // Show Notification
        if (window.Notification && Notification.permission === 'granted') {
          new Notification("Time's Up!", {
            body: mode === 'focus' ? 'Great job on your focus session!' : 'Break is over, back to work!',
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, endTime, remainingSeconds, durationSeconds, stopTimer, saveSession, selectedTaskId, customTitle, tasks]);

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  const pct = 100 - (timeLeft / durationSeconds) * 100;

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const displayTitle = selectedTask ? selectedTask.title : customTitle;

  const handleStartTimer = () => {
    // Request notification permission if not already granted/denied
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    startTimer();
  };

  const quickTimes = mode === 'focus' ? [15, 25, 45, 60, 90, 120] : [5, 10, 15, 20, 30];

  return (
    <div className="neu-card timer-clay-card" style={{ marginBottom: 16 }}>
      
      {/* ── Mode Toggle ── */}
      {!isRunning && remainingSeconds === durationSeconds && (
        <div className="timer-mode-toggle">
          <button 
            className={`timer-mode-btn ${mode === 'focus' ? 'active' : ''}`}
            onClick={() => setMode('focus')}
          >
            Focus
          </button>
          <button 
            className={`timer-mode-btn ${mode === 'break' ? 'active' : ''}`}
            onClick={() => setMode('break')}
          >
            Break
          </button>
        </div>
      )}

      {/* ── Title & Selector ── */}
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 16 }}>
        {!isRunning && remainingSeconds === durationSeconds ? (
          <input
            className="timer-title-input"
            placeholder="What are you focusing on?"
            value={displayTitle}
            onChange={(e) => {
              setCustomTitle(e.target.value);
              setShowTaskSelector(true);
            }}
            onFocus={() => setShowTaskSelector(true)}
          />
        ) : (
          <p className="timer-title-display">
            {displayTitle || 'Focus Session'}
          </p>
        )}

        {showTaskSelector && !isRunning && remainingSeconds === durationSeconds && (
          <div className="task-dropdown inset-clay">
            <div className="task-dropdown-header">
              <span>Tasks</span>
              <button onClick={() => setShowTaskSelector(false)}>
                <Icon name="x" size={12} />
              </button>
            </div>
            {tasks.filter(t => !t.completedAt && t.title.toLowerCase().includes(customTitle.toLowerCase())).map(t => (
              <button
                key={t.id}
                className="task-dropdown-item"
                onClick={() => { selectTask(t.id); setShowTaskSelector(false); }}
              >
                {t.title}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* ── Quick Add Pills ── */}
      {!isRunning && remainingSeconds === durationSeconds && (
        <div className="time-pills">
          {quickTimes.map(mins => (
            <button
              key={mins}
              onClick={() => setDuration(mins)}
              className={`time-pill ${durationSeconds === mins * 60 ? 'active' : ''}`}
            >
              {mins}m
            </button>
          ))}
        </div>
      )}

      {/* ── Circle + Controls ── */}
      <div className="timer-circle-row">
        <div className="timer-circle-container">
          <svg className="timer-svg" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--clay-lavender)" strokeWidth="6" opacity="0.4" />
            {/* Progress ring */}
            <circle
              cx="50" cy="50" r="45" fill="none" stroke="var(--clay-lavender)" strokeWidth="6"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={(2 * Math.PI * 45) * (1 - (timeLeft / durationSeconds))}
              strokeLinecap="round"
              className="timer-progress"
            />
          </svg>
          <div className="timer-time-display">
            {mm}:{ss}
          </div>
        </div>

        <div className="timer-controls">
          {!isRunning ? (
            <button
              className="timer-btn-primary"
              onClick={handleStartTimer}
            >
              <Icon name="play" size={24} />
            </button>
          ) : (
            <button className="timer-btn-pause" onClick={() => pauseTimer(timeLeft)}>
              <Icon name="pause" size={24} />
            </button>
          )}

          {(isRunning || remainingSeconds < durationSeconds) && (
            <div className="timer-actions-column">
              <button className="timer-action-pill" onClick={() => addTime(1)}>+1m</button>
              <button className="timer-action-pill" onClick={() => addTime(5)}>+5m</button>
              {!isRunning && (
                <button className="timer-action-pill stop-btn" onClick={() => {
                  stopTimer();
                  if (mode === 'focus') {
                    saveSession(displayTitle, durationSeconds - timeLeft, null);
                  }
                }}>Finish</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── History Panel ── */}
      {history.length > 0 && (
        <div className="timer-history inset-clay">
          <div className="history-header">Today's Sessions</div>
          {history.map(session => (
            <div key={session.id} className="history-item">
              <span className="history-title">{session.title}</span>
              <span className="history-duration">{Math.round(session.durationSeconds / 60)}m</span>
              <button className="history-del-btn" onClick={() => deleteHistoryItem(session.id)}>
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
