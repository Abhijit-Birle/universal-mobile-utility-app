import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export default function NeoSelect({ value, onChange, options, theme, style, fontBody }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: "6px 12px", 
          borderRadius: 10, 
          background: theme.bg, 
          color: theme.textPrimary, 
          border: "none", 
          boxShadow: isOpen ? theme.shadowInset : theme.shadowRaisedSm, 
          fontSize: 11, 
          fontWeight: 600, 
          outline: "none", 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          cursor: 'pointer',
          transition: 'all 0.2s',
          ...fontBody
        }}
      >
        <span style={{ whiteSpace: 'nowrap' }}>{selectedOption ? selectedOption.label : value}</span>
        <ChevronDown size={12} style={{ transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              position: 'absolute',
              top: '100%',
              marginTop: 8,
              left: 0,
              minWidth: '100%',
              background: theme.bg,
              borderRadius: 12,
              padding: 4,
              boxShadow: '4px 4px 10px rgba(0,0,0,0.5), -2px -2px 8px rgba(255,255,255,0.05)',
              zIndex: 100,
              maxHeight: 200,
              overflowY: 'auto'
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  background: value === opt.value ? theme.accent + '22' : 'transparent',
                  color: value === opt.value ? theme.accent : theme.textPrimary,
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: value === opt.value ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  ...fontBody
                }}
              >
                <span style={{ whiteSpace: 'nowrap' }}>{opt.label}</span>
                {value === opt.value && <Check size={12} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
