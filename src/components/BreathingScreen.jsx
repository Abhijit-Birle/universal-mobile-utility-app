import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronDown, Music } from 'lucide-react';

const PHASES = [
  { label: 'Breathe In…',  duration: 4, kind: 'in'   },
  { label: 'Hold…',        duration: 7, kind: 'hold'  },
  { label: 'Breathe out…', duration: 8, kind: 'out'   },
];

const PHASE_COLORS = {
  in: {
    bg:      '#1a241e',
    orb:     '#2d6e52',
    orbGlow: '#3a8a68',
    label:   '#e8e6e3',
    timer:   '#a8c4b4',
    homeBar: '#3a4a3e',
    dark:    '#0f1a14',
    light:   '#253328',
  },
  hold: {
    bg:      '#1e1e24',
    orb:     '#3a3558',
    orbGlow: '#4a4570',
    label:   '#e8e6e3',
    timer:   '#9a9ab0',
    homeBar: '#3a3a4e',
    dark:    '#101014',
    light:   '#282830',
  },
  out: {
    bg:      '#241d1a',
    orb:     '#6e3d2d',
    orbGlow: '#8a4e3a',
    label:   '#e8e6e3',
    timer:   '#c4a898',
    homeBar: '#4a3a3e',
    dark:    '#180f0c',
    light:   '#322622',
  },
};

function pad(n) { return String(n).padStart(2, '0'); }

// Orb starts at 120px diameter. At scale 1 it's tiny, at scale ~12 it covers ~1440px (full screen).
const ORB_BASE = 120;

export default function BreathingScreen({ onClose, activeSource, musicOptions = [], onChangeSource }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount]           = useState(PHASES[0].duration);
  const [isRunning, setIsRunning]   = useState(false);
  const [elapsed, setElapsed]       = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const phase  = PHASES[phaseIndex];
  const colors = PHASE_COLORS[isRunning ? phase.kind : 'hold'];

  useEffect(() => {
    if (!isRunning) return;
    const id = setTimeout(() => {
      setElapsed(e => e + 1);
      if (count > 1) {
        setCount(c => c - 1);
      } else {
        const next = (phaseIndex + 1) % PHASES.length;
        setPhaseIndex(next);
        setCount(PHASES[next].duration);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [isRunning, count, phaseIndex]);

  // Progress 0→1 within the current phase
  let orbScale = 0.12; // resting small
  if (isRunning) {
    if (phase.kind === 'in') {
      const prog = (PHASES[0].duration - count) / Math.max(1, PHASES[0].duration);
      orbScale = 0.12 + prog * 0.88; // 0.12 → 1.0
    } else if (phase.kind === 'hold') {
      orbScale = 1.0; // fully expanded
    } else if (phase.kind === 'out') {
      const prog = count / Math.max(1, PHASES[2].duration);
      orbScale = 0.12 + prog * 0.88; // 1.0 → 0.12
    }
  }

  // At scale=1 the orb is ORB_BASE px. We need it to cover ~200vw at full.
  // So the "full screen" scale factor = viewport diagonal / ORB_BASE ≈ 1600/120 ≈ 13.3
  const fullScreenScale = orbScale * 13.5;

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const currentLabel = isRunning ? phase.label : 'Paused';
  const currentSound = (musicOptions.find(m => m.id === activeSource) || {}).label || activeSource || 'Ambient';

  const btnShadow = isRunning
    ? `inset 4px 4px 8px ${colors.dark}, inset -4px -4px 8px ${colors.light}`
    : `5px 5px 10px ${colors.dark}, -5px -5px 10px ${colors.light}`;

  const transitionDuration = phase.kind === 'in'
    ? `${PHASES[0].duration}s`
    : phase.kind === 'out'
    ? `${PHASES[2].duration}s`
    : '0.6s';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: colors.bg,
      overflow: 'hidden',
      transition: 'background 1.2s ease',
    }}>

      {/* Breathing orb — absolutely centered, expands to fill screen */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: ORB_BASE, height: ORB_BASE,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${colors.orbGlow}, ${colors.orb} 60%, ${colors.dark} 100%)`,
        transform: `translate(-50%, -50%) scale(${fullScreenScale})`,
        transition: `transform ${transitionDuration} linear, background 1.2s ease`,
        pointerEvents: 'none',
        opacity: 0.92,
      }} />

      {/* Multiple concentric layers for depth */}
      {[1.04, 1.15, 1.3, 1.5, 1.8].map((multiplier, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: ORB_BASE + (i * 30), height: ORB_BASE + (i * 30),
          borderRadius: '50%',
          background: i === 0 ? `${colors.orbGlow}22` : i % 2 !== 0 ? `${colors.orbGlow}0a` : 'transparent',
          border: `1px solid ${colors.orbGlow}${Math.max(10, 44 - i * 8).toString(16)}`,
          transform: `translate(-50%, -50%) scale(${fullScreenScale * multiplier})`,
          transition: `transform ${transitionDuration} linear, background 1.2s ease, border-color 1.2s ease`,
          pointerEvents: 'none',
          boxShadow: i === 1 ? `0 0 40px ${colors.orbGlow}33` : 'none',
        }} />
      ))}

      {/* UI overlay — top bar, center labels, bottom controls */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 20px 28px',
      }}>

        {/* Top bar */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(28,28,34,0.6)', backdropFilter: 'blur(8px)',
              border: 'none', borderRadius: 50, cursor: 'pointer',
              color: '#e8e6e3', fontSize: 22, lineHeight: 1,
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>

          {/* Ambience Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPicker(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(28,28,34,0.7)', backdropFilter: 'blur(8px)',
                boxShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                border: 'none', borderRadius: 50,
                padding: '8px 14px', cursor: 'pointer',
              }}
            >
              <Music size={14} color="#8fd4b0" />
              <span style={{ color: '#e8e6e3', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>{currentSound}</span>
              <ChevronDown size={13} color="#8a8892" />
            </button>
            {showPicker && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, zIndex: 10,
                background: 'rgba(28,28,34,0.95)', backdropFilter: 'blur(12px)',
                borderRadius: 14,
                boxShadow: '6px 6px 16px rgba(0,0,0,0.5)',
                overflow: 'hidden', minWidth: 150,
              }}>
                {musicOptions.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { onChangeSource(m.id); setShowPicker(false); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 16px', background: 'none', border: 'none',
                      cursor: 'pointer',
                      color: m.id === activeSource ? '#5dcaa5' : '#e8e6e3',
                      fontSize: 13, fontFamily: 'Inter, sans-serif',
                      fontWeight: m.id === activeSource ? 700 : 400,
                    }}
                  >{m.label}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ width: 36 }} />
        </div>

        {/* Center: state label + timer */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: 28, fontWeight: 600,
            color: '#ffffff',
            fontFamily: 'Poppins, sans-serif',
            textShadow: '0 2px 16px rgba(0,0,0,0.5)',
            letterSpacing: '-0.3px',
            transition: 'opacity 0.5s',
          }}>{currentLabel}</div>

          <div style={{
            marginTop: 10, fontSize: 15,
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'Inter, sans-serif',
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
          }}>{pad(mins)}:{pad(secs)}</div>
        </div>

        {/* Bottom: play/pause button */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <button
            onClick={() => setIsRunning(r => !r)}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(28,28,34,0.75)',
              backdropFilter: 'blur(10px)',
              boxShadow: btnShadow,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'box-shadow 0.2s ease',
            }}
          >
            {isRunning
              ? <Pause size={24} color="#5dcaa5" />
              : <Play  size={24} color="#5dcaa5" style={{ marginLeft: 3 }} />
            }
          </button>

          {/* Home indicator */}
          <div style={{
            width: 44, height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,0.2)',
          }} />
        </div>

      </div>
    </div>
  );
}
