import React, { useState, useEffect } from 'react';
import { ArrowLeft, Smile, Frown, Meh } from 'lucide-react';
import { getItem } from '../hooks/useStorage';


const MOOD_EMOJIS = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄'
};

export default function ReflectionHistory({ onClose, theme, fontDisplay, fontBody, NeoSurface }) {
  const [entries, setEntries] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedEntries = await getItem('neo_dailyEntries') || {};
        const storedSessions = await getItem('neo_meditationSessions') || [];
        
        // Convert entries object to array and sort by date descending
        const entriesArray = Object.keys(storedEntries).map(date => ({
          date,
          ...storedEntries[date]
        })).sort((a, b) => b.date.localeCompare(a.date));
        
        setEntries(entriesArray);
        
        // Sort sessions by timestamp descending
        const sessionsArray = [...storedSessions].sort((a, b) => b.timestamp - a.timestamp);
        setSessions(sessionsArray);
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    loadData();
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: theme.bg, overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ position: 'sticky', top: 0, background: theme.bg, zIndex: 10, padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: theme.shadowRaisedSm }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textPrimary, padding: 8, borderRadius: 50 }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>History & Reflections</div>
      </div>

      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        <div>
          <h2 style={{ fontSize: 16, color: theme.textSecondary, fontWeight: 700, marginBottom: 16, ...fontDisplay, textTransform: 'uppercase', letterSpacing: 1 }}>Journal Entries</h2>
          {entries.length === 0 ? (
            <div style={{ color: theme.textSecondary, fontSize: 14, ...fontBody }}>No entries yet. Start reflecting to see your history here!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {entries.map(entry => (
                <NeoSurface key={entry.date} style={{ borderRadius: 16, padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: theme.textPrimary, ...fontDisplay }}>{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                    {entry.mood && (
                      <div style={{ fontSize: 24 }}>{MOOD_EMOJIS[entry.mood]}</div>
                    )}
                  </div>
                  
                  {entry.intention && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: theme.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Morning Intention</div>
                      <div style={{ fontSize: 15, color: theme.textPrimary, ...fontBody, lineHeight: 1.5 }}>"{entry.intention}"</div>
                    </div>
                  )}

                  {entry.reflection && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: theme.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Evening Reflection</div>
                      <div style={{ fontSize: 15, color: theme.textPrimary, ...fontBody, lineHeight: 1.5 }}>"{entry.reflection}"</div>
                    </div>
                  )}

                  {entry.gratitude && entry.gratitude.some(g => g.trim() !== '') && (
                    <div>
                      <div style={{ fontSize: 12, color: theme.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Gratitude</div>
                      <ul style={{ margin: 0, paddingLeft: 20, color: theme.textPrimary, ...fontBody, fontSize: 14, lineHeight: 1.6 }}>
                        {entry.gratitude.filter(g => g.trim() !== '').map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </NeoSurface>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: 16, color: theme.textSecondary, fontWeight: 700, marginBottom: 16, ...fontDisplay, textTransform: 'uppercase', letterSpacing: 1 }}>Meditation Sessions</h2>
          {sessions.length === 0 ? (
            <div style={{ color: theme.textSecondary, fontSize: 14, ...fontBody }}>No sessions recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sessions.map((session, i) => (
                <NeoSurface key={i} style={{ borderRadius: 12, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: theme.textPrimary, ...fontDisplay, textTransform: 'capitalize' }}>
                      {session.type.replace('-', ' ')}
                    </div>
                    <div style={{ fontSize: 12, color: theme.textSecondary, ...fontBody, marginTop: 4 }}>
                      {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>{session.duration} min</div>
                    {session.completed ? (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#5dcaa5' }} title="Completed" />
                    ) : (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.textSecondary }} title="Partial" />
                    )}
                  </div>
                </NeoSurface>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
