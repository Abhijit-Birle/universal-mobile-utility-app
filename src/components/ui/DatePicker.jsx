// ponytail: minimal custom date picker — no library, no abstraction
import { useState, useRef, useEffect } from 'react';
import Icon from './Icon.jsx';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePicker({ value, onChange, theme, fontBody, placeholder = 'Select date' }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const selected = parseDate(value);
  const [viewYear, setViewYear] = useState((selected || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((selected || today).getMonth());
  const ref = useRef();

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const select = (day) => {
    if (!day) return;
    const d = new Date(viewYear, viewMonth, day);
    onChange(toDateStr(d));
    setOpen(false);
  };

  const displayText = selected
    ? `${selected.getDate()} ${MONTHS[selected.getMonth()].slice(0,3)} ${selected.getFullYear()}`
    : placeholder;

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      {/* Trigger row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
      >
        <Icon name="calendar" size={16} color={value ? theme.accent : theme.textSecondary} />
        <span style={{ fontSize: 14, color: value ? theme.accent : theme.textSecondary, ...fontBody }}>
          {displayText}
        </span>
        {value && (
          <button
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer', padding: 0, display: 'flex' }}
          >
            <Icon name="x" size={12} />
          </button>
        )}
      </div>

      {/* Dropdown calendar */}
      {open && (
        <div style={{
          position: 'absolute', bottom: '120%', left: 0, zIndex: 100,
          background: theme.bg, borderRadius: 18,
          boxShadow: theme.shadowRaised,
          padding: '14px 12px', width: 240,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, padding: 4, display: 'flex' }}>
              <Icon name="chevronLeft" size={16} color={theme.textPrimary} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, padding: 4, display: 'flex' }}>
              <Icon name="chevronRight" size={16} color={theme.textPrimary} />
            </button>
          </div>
          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, color: theme.textSecondary, fontWeight: 600, padding: '2px 0', ...fontBody }}>{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((day, i) => {
              const isToday = day && new Date(viewYear, viewMonth, day).toDateString() === today.toDateString();
              const isSelected = day && selected && new Date(viewYear, viewMonth, day).toDateString() === selected.toDateString();
              return (
                <button
                  key={i}
                  onClick={() => select(day)}
                  disabled={!day}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', border: 'none',
                    background: isSelected ? theme.accent : isToday ? `${theme.accent}22` : 'transparent',
                    color: isSelected ? '#fff' : isToday ? theme.accent : day ? theme.textPrimary : 'transparent',
                    cursor: day ? 'pointer' : 'default',
                    fontSize: 12, fontWeight: isSelected || isToday ? 600 : 400,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto',
                    ...fontBody
                  }}
                >
                  {day || ''}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
