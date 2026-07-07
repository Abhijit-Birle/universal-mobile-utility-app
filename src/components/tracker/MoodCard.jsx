import { useState } from 'react';
import Icon from '../ui/Icon.jsx';

const MOODS = [
  { value: 1, icon: 'frown', label: 'Very Low' },
  { value: 2, icon: 'meh', label: 'Low' },
  { value: 3, icon: 'smile', label: 'Neutral' },
  { value: 4, icon: 'laugh', label: 'Good' },
  { value: 5, icon: 'party-popper', label: 'Great' }
];

const STRESS = [
  { value: 1, label: 'Low', color: 'rgba(107, 191, 138, 1)' }, // Greenish
  { value: 2, label: '', color: 'rgba(224, 138, 92, 0.4)' },
  { value: 3, label: '', color: 'rgba(224, 138, 92, 0.6)' },
  { value: 4, label: '', color: 'rgba(224, 138, 92, 0.8)' },
  { value: 5, label: 'High', color: 'rgba(226, 105, 110, 1)' } // Danger red
];

export default function MoodCard({
  dateStr,
  latestLog,
  onSave
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [mood, setMood] = useState(latestLog ? latestLog.mood : null);
  const [stress, setStress] = useState(latestLog ? latestLog.stress : null);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  // If we have a log and aren't editing, show the collapsed summary
  if (latestLog && !isEditing) {
    const moodObj = MOODS.find(m => m.value === latestLog.mood);
    const stressObj = STRESS.find(s => s.value === latestLog.stress);
    
    return (
      <div className="neu-card" style={{ marginBottom: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-app)', boxShadow: 'var(--shadow-raised-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={moodObj?.icon || 'smile'} size={18} color="var(--accent-primary)" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Feeling {moodObj?.label.toLowerCase()}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Stress: {stressObj?.value}/5</div>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: 'var(--accent-primary)', cursor: 'pointer' }}
        >
          Edit
        </button>
      </div>
    );
  }

  // Editing state (or first time today)
  return (
    <div className="neu-card" style={{ marginBottom: 16, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>How are you feeling?</h3>
        {latestLog && (
          <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
            <Icon name="x" size={18} />
          </button>
        )}
      </div>

      {/* Mood Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        {MOODS.map(m => (
          <button
            key={m.value}
            onClick={() => setMood(m.value)}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none',
              background: 'var(--bg-app)',
              boxShadow: mood === m.value ? 'var(--shadow-inset)' : 'var(--shadow-raised-sm)',
              color: mood === m.value ? 'var(--accent-primary)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon name={m.icon} size={20} />
          </button>
        ))}
      </div>

      {/* Stress Selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Stress level</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {STRESS.map(s => (
            <button
              key={s.value}
              onClick={() => setStress(s.value)}
              style={{
                flex: 1, height: 36, borderRadius: 18, border: 'none',
                background: stress === s.value ? s.color : 'var(--bg-app)',
                boxShadow: stress === s.value ? 'var(--shadow-inset)' : 'var(--shadow-raised-sm)',
                color: stress === s.value ? '#fff' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {s.value}
            </button>
          ))}
        </div>
      </div>

      {/* Note Toggle */}
      {!showNote ? (
        <button 
          onClick={() => setShowNote(true)}
          style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 20 }}
        >
          <Icon name="plus" size={14} /> Add note (optional)
        </button>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="What's on your mind?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: '100%', height: 44, borderRadius: 22, border: 'none',
              background: 'var(--bg-input)', boxShadow: 'var(--shadow-inset)',
              padding: '0 16px', fontSize: 14, color: 'var(--text-primary)', outline: 'none'
            }}
          />
        </div>
      )}

      {/* Save Button */}
      <button
        disabled={!mood || !stress}
        onClick={() => {
          onSave(mood, stress, note);
          setIsEditing(false);
          setNote(''); // reset note for next entry
          setShowNote(false);
        }}
        style={{
          width: '100%', height: 44, borderRadius: 22, border: 'none',
          background: 'var(--accent-primary)', color: '#fff',
          fontSize: 15, fontWeight: 500, cursor: (!mood || !stress) ? 'not-allowed' : 'pointer',
          opacity: (!mood || !stress) ? 0.5 : 1,
          boxShadow: (!mood || !stress) ? 'none' : '0 4px 12px rgba(139, 124, 246, 0.4)'
        }}
      >
        Save Check-in
      </button>
    </div>
  );
}
