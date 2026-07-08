// ponytail: minimal reminder picker — combines date + time, stores as "YYYY-MM-DDTHH:MM"
import { useState, useRef, useEffect } from 'react';
import Icon from './Icon.jsx';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function parseReminder(v) {
  if (!v) return { date: null, timeStr: '' };
  const [datePart, timePart] = v.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  return { date: new Date(y, m - 1, d), timeStr: timePart || '' };
}

function formatReminder(date, timeStr) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}T${timeStr || '00:00'}`;
}

function fmt24ToDisplay(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ap}`;
}

export default function ReminderPicker({ value, onChange, theme, fontBody, placeholder = 'Set reminder' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const today = new Date();
  const { date: initDate, timeStr: initTime } = parseReminder(value);
  const [viewYear, setViewYear] = useState((initDate || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((initDate || today).getMonth());
  const [selDate, setSelDate] = useState(initDate);
  const [timeStr, setTimeStr] = useState(initTime || '09:00');

  useEffect(() => {
    const { date, timeStr: t } = parseReminder(value);
    setSelDate(date);
    setTimeStr(t || '09:00');
    if (date) { setViewYear(date.getFullYear()); setViewMonth(date.getMonth()); }
  }, [value]);

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

  const selectDay = (day) => {
    if (!day) return;
    const d = new Date(viewYear, viewMonth, day);
    setSelDate(d);
    onChange(formatReminder(d, timeStr));
  };

  const handleTimeChange = (t) => {
    setTimeStr(t);
    if (selDate) onChange(formatReminder(selDate, t));
  };

  // time spinner state
  const [hour, setHourState] = useState(() => {
    const h = parseInt(timeStr?.split(':')[0] || '9');
    return h % 12 || 12;
  });
  const [minute, setMinuteState] = useState(() => parseInt(timeStr?.split(':')[1] || '0'));
  const [ampm, setAmpmState] = useState(() => parseInt(timeStr?.split(':')[0] || '9') >= 12 ? 'PM' : 'AM');

  const emitTime = (h, m, ap) => {
    let hh = h % 12;
    if (ap === 'PM') hh += 12;
    const t = `${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    handleTimeChange(t);
  };

  const setH = (h) => { setHourState(h); emitTime(h, minute, ampm); };
  const setM = (m) => { setMinuteState(m); emitTime(hour, m, ampm); };
  const toggleAp = () => { const next = ampm === 'AM' ? 'PM' : 'AM'; setAmpmState(next); emitTime(hour, minute, next); };

  const displayText = value
    ? `${selDate ? `${selDate.getDate()} ${MONTHS[selDate.getMonth()].slice(0,3)}` : ''} ${fmt24ToDisplay(timeStr)}`
    : placeholder;

  const apBtn = (label) => (
    <button onClick={() => { if (ampm !== label) toggleAp(); }} style={{
      padding: '4px 10px', borderRadius: 20, border: 'none',
      background: ampm === label ? theme.accent : 'transparent',
      color: ampm === label ? '#fff' : theme.textSecondary,
      fontSize: 11, cursor: 'pointer', fontWeight: 600, ...fontBody
    }}>{label}</button>
  );

  const chevBtn = (icon, onClick) => (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
      <Icon name={icon} size={14} color={theme.textPrimary} />
    </button>
  );

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <Icon name="bell" size={16} color={value ? theme.accent : theme.textSecondary} />
        <span style={{ fontSize: 14, color: value ? theme.accent : theme.textSecondary, ...fontBody }}>
          {displayText}
        </span>
        {value && (
          <button onClick={(e) => { e.stopPropagation(); onChange(''); }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer', padding: 0, display: 'flex' }}>
            <Icon name="x" size={12} />
          </button>
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', bottom: '120%', left: 0, zIndex: 100,
          background: theme.bg, borderRadius: 18,
          boxShadow: theme.shadowRaised,
          padding: '14px 12px', width: 260,
        }}>
          {/* Calendar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <Icon name="chevronLeft" size={15} color={theme.textPrimary} />
            </button>
            <span style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <Icon name="chevronRight" size={15} color={theme.textPrimary} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 3 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 9, color: theme.textSecondary, fontWeight: 600, padding: '1px 0', ...fontBody }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {cells.map((day, i) => {
              const isToday = day && new Date(viewYear, viewMonth, day).toDateString() === today.toDateString();
              const isSel = day && selDate && new Date(viewYear, viewMonth, day).toDateString() === selDate.toDateString();
              return (
                <button key={i} onClick={() => selectDay(day)} disabled={!day} style={{
                  width: 28, height: 28, borderRadius: '50%', border: 'none',
                  background: isSel ? theme.accent : isToday ? `${theme.accent}22` : 'transparent',
                  color: isSel ? '#fff' : isToday ? theme.accent : day ? theme.textPrimary : 'transparent',
                  cursor: day ? 'pointer' : 'default', fontSize: 11,
                  fontWeight: isSel || isToday ? 600 : 400,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                  ...fontBody
                }}>{day || ''}</button>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${theme.border}`, margin: '10px 0' }} />

          {/* Time spinner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              {chevBtn('chevronDown', () => setH(hour === 1 ? 12 : hour - 1))}
              <span style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, width: 32, textAlign: 'center', ...fontBody }}>
                {String(hour).padStart(2,'0')}
              </span>
              {chevBtn('chevronRight', () => setH(hour === 12 ? 1 : hour + 1))}
            </div>
            <span style={{ fontSize: 18, color: theme.textPrimary, fontWeight: 700 }}>:</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              {chevBtn('chevronDown', () => setM(minute === 0 ? 55 : minute - 5))}
              <span style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, width: 32, textAlign: 'center', ...fontBody }}>
                {String(minute).padStart(2,'0')}
              </span>
              {chevBtn('chevronRight', () => setM(minute >= 55 ? 0 : minute + 5))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 6 }}>
              {apBtn('AM')}
              {apBtn('PM')}
            </div>
          </div>

          {selDate && (
            <button onClick={() => setOpen(false)} style={{
              marginTop: 12, width: '100%', padding: '8px 0', borderRadius: 12, border: 'none',
              background: theme.accent, color: '#fff', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', ...fontBody
            }}>Set Reminder</button>
          )}
        </div>
      )}
    </div>
  );
}
