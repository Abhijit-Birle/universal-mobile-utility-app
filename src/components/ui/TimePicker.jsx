import { useState, useRef, useEffect } from 'react';
import Icon from './Icon.jsx';
import WheelPicker from './WheelPicker.jsx';

export default function TimePicker({ value, onChange, theme, fontBody, placeholder = 'Set time', alignRight = false, openDown = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Parse "HH:MM" (24h) into display values
  const parseTime = (v) => {
    if (!v) return { h: 12, m: 0, ampm: 'AM' };
    const [hh, mm] = v.split(':').map(Number);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h = hh % 12 || 12;
    return { h, m: mm, ampm };
  };

  const { h: initH, m: initM, ampm: initAmpm } = parseTime(value);
  const [hour, setHour] = useState(initH);
  const [minute, setMinute] = useState(initM);
  const [ampm, setAmpm] = useState(initAmpm);

  // Sync state when value prop changes externally
  useEffect(() => {
    const { h, m, ampm: ap } = parseTime(value);
    setHour(h); setMinute(m); setAmpm(ap);
  }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const emit = (h, m, ap) => {
    let hh = h % 12;
    if (ap === 'PM') hh += 12;
    const hStr = String(hh).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  const setH = (h) => { setHour(h); emit(h, minute, ampm); };
  const setM = (m) => { setMinute(m); emit(hour, m, ampm); };
  const setAp = (ap) => { setAmpm(ap); emit(hour, minute, ap); };

  const displayText = value
    ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`
    : placeholder;

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const ampms = ['AM', 'PM'];

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <Icon name="clock" size={16} color={value ? theme.accent : theme.textSecondary} />
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
          position: 'absolute', 
          ...(openDown ? { top: '120%' } : { bottom: '120%' }),
          /* ponytail: anchor right to fix out of bounds */
          ...(alignRight ? { right: 0 } : { left: 0 }), 
          zIndex: 100,
          background: theme.bg, borderRadius: 18,
          boxShadow: theme.shadowRaised,
          padding: '16px 14px', width: 220,
        }}>
          {/* Close button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, padding: 2, display: 'flex' }}
            >
              <Icon name="x" size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <WheelPicker
              options={hours}
              value={hour}
              onChange={setH}
              theme={theme}
              width={40}
              fontSize={20}
              itemHeight={36}
            />
            <span style={{ fontSize: 20, color: theme.textPrimary, fontWeight: 700, marginBottom: 2 }}>:</span>
            <WheelPicker
              options={minutes}
              value={minute}
              onChange={setM}
              theme={theme}
              width={40}
              fontSize={20}
              itemHeight={36}
            />
            <WheelPicker
              options={ampms}
              value={ampm}
              onChange={setAp}
              theme={theme}
              width={50}
              fontSize={16}
              itemHeight={36}
              formatOption={(o) => o}
            />
          </div>

          {/* Quick presets */}
          <div style={{ marginTop: 12, borderTop: `1px solid ${theme.border}`, paddingTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[['9:00 AM', '09:00'], ['12:00 PM', '12:00'], ['6:00 PM', '18:00'], ['9:00 PM', '21:00']].map(([label, val]) => (
              <button key={val} onClick={() => { onChange(val); setOpen(false); }}
                style={{ padding: '4px 10px', borderRadius: 20, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 11, cursor: 'pointer', ...fontBody }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
