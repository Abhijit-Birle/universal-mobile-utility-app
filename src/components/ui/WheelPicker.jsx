import { useRef, useEffect } from 'react';

export default function WheelPicker({ options, value, onChange, label, disabled = false, width = 60, fontSize = 24, formatOption, theme, fontDisplay, fontBody, itemHeight = 44 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const idx = options.indexOf(value);
    if (idx !== -1 && containerRef.current) {
      if (disabled) {
        containerRef.current.scrollTo({ top: idx * itemHeight, behavior: 'smooth' });
      } else {
        containerRef.current.scrollTop = idx * itemHeight;
      }
    }
  }, [value, options, disabled, itemHeight]);

  const handleScroll = (e) => {
    const idx = Math.round(e.target.scrollTop / itemHeight);
    if (options[idx] !== undefined && options[idx] !== value) {
      onChange(options[idx]);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: itemHeight * 3,
          width: width,
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          position: 'relative',
          pointerEvents: disabled ? 'none' : 'auto'
        }}
      >
        <div style={{ height: itemHeight }} /> {/* padding top */}
        {options.map((opt) => (
          <div
            key={opt}
            style={{
              height: itemHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scrollSnapAlign: 'center',
              fontSize: fontSize,
              fontWeight: 700,
              color: opt === value ? theme.textPrimary : theme.textSecondary,
              opacity: opt === value ? 1 : 0.3,
              transition: 'all 0.2s',
              ...(fontDisplay || {})
            }}
          >
            {formatOption ? formatOption(opt) : opt.toString().padStart(2, '0')}
          </div>
        ))}
        <div style={{ height: itemHeight }} /> {/* padding bottom */}
      </div>
      {label && (
        <div style={{ color: theme.textSecondary, fontSize: 14, fontWeight: 600, ...(fontBody || {}) }}>
          {label}
        </div>
      )}
    </div>
  );
}
