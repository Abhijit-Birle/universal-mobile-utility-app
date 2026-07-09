import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function NeoSelect({ value, onChange, options, theme, fontBody, style }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', marginBottom: 8, ...style }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 14,
          background: theme.bg, color: theme.textPrimary,
          boxShadow: theme.shadowInset, fontSize: 14, ...fontBody,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          cursor: "pointer", boxSizing: "border-box"
        }}
      >
        {selectedOption ? selectedOption.label : 'Select...'}
        <div style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'flex', color: theme.textSecondary }}>
          <ChevronDown size={18} />
        </div>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 100,
          background: theme.bg, borderRadius: 14,
          boxShadow: theme.shadowRaised, padding: 8,
          maxHeight: 200, overflowY: 'auto'
        }}>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                background: value === opt.value ? theme.accent : 'transparent',
                color: value === opt.value ? '#fff' : theme.textPrimary,
                fontSize: 14, ...fontBody,
                transition: 'all 0.2s'
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
