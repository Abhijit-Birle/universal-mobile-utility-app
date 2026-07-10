import React, { useState, useEffect } from 'react';
import { Wind, MoreHorizontal, ChevronsDown, Leaf, Play, Pause, ChevronDown, Music, CheckCircle2 } from 'lucide-react';
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const PHASES = [
  { label: 'Inhale', Icon: Wind, iconStyle: {}, duration: 4, kind: 'in' },
  { label: 'Hold', Icon: MoreHorizontal, iconStyle: {}, duration: 4, kind: 'hold_in' },
  { label: 'Exhale', Icon: ChevronsDown, iconStyle: { transform: 'rotate(180deg)' }, duration: 4, kind: 'out' },
  { label: 'Hold', Icon: MoreHorizontal, iconStyle: {}, duration: 4, kind: 'hold_out' },
];

const PHASE_COLORS = {
  in: {
    bg: '#1a2428', orb: '#2d6a8a', orbGlow: '#3a8eb5', dark: '#0f171a', light: '#25353b'
  },
  hold_in: {
    bg: '#1e1e24', orb: '#3a3558', orbGlow: '#4a4570', dark: '#101014', light: '#282830'
  },
  out: {
    bg: '#28221c', orb: '#8a5c3a', orbGlow: '#a87550', dark: '#1c1611', light: '#362d26'
  },
  hold_out: {
    bg: '#1e1e24', orb: '#3a3558', orbGlow: '#4a4570', dark: '#101014', light: '#282830'
  }
};

function pad(n) { return String(n).padStart(2, '0'); }

const ORB_BASE = 120;
const DURATIONS = [2, 5, 10]; // in minutes

export default function BoxBreathingScreen({ onClose, onComplete, activeSource, musicOptions = [], onChangeSource }) {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(5); // Default 5 mins
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(PHASES[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const totalTargetSeconds = selectedDuration * 60;
  const phase = PHASES[phaseIndex];
  const colors = PHASE_COLORS[phase.kind];

  const CurrentIcon = isRunning ? phase.Icon : Leaf;
  const currentStyle = isRunning ? phase.iconStyle : {};

  useEffect(() => {
    if (!isRunning || sessionCompleted) return;
    const id = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (next >= totalTargetSeconds) {
          setIsRunning(false);
          setSessionCompleted(true);
        }
        return next;
      });
      if (count > 1) {
        setCount(c => c - 1);
      } else {
        const next = (phaseIndex + 1) % PHASES.length;
        setPhaseIndex(next);
        setCount(PHASES[next].duration);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [isRunning, count, phaseIndex, totalTargetSeconds, sessionCompleted]);

  const handleComplete = () => {
    if (onComplete) {
      onComplete({
        type: 'box-breathing',
        duration: Math.floor(elapsed / 60),
        completed: elapsed >= totalTargetSeconds
      });
    }
    onClose();
  };

  if (!sessionStarted) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: '#0F1117',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 30, left: 24, background: 'none', border: 'none', color: '#8B8FA3', fontSize: 28, cursor: 'pointer' }}>×</button>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: '#1C1F26', boxShadow: 'inset 4px 4px 10px #0c0d12, inset -4px -4px 10px #2c313a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <Wind size={36} color="#6366F1" />
        </div>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily: 'sans-serif' }}>Box Breathing</h1>
        <p style={{ color: '#8B8FA3', fontSize: 15, marginBottom: 40, textAlign: 'center' }}>Inhale 4s, Hold 4s, Exhale 4s, Hold 4s</p>

        <div style={{ display: 'flex', gap: 16, marginBottom: 48 }}>
          {DURATIONS.map(d => {
            const isSel = selectedDuration === d;
            return (
              <button
                key={d}
                onClick={() => {
                  try { Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
                  setSelectedDuration(d);
                }}
                style={{
                  width: 80, height: 48, borderRadius: 24,
                  background: '#1C1F26', border: 'none', cursor: 'pointer',
                  color: isSel ? '#6366F1' : '#8B8FA3', fontWeight: 600, fontSize: 16,
                  boxShadow: isSel ? 'inset 3px 3px 6px #0c0d12, inset -3px -3px 6px #2c313a' : '3px 3px 6px #0c0d12, -3px -3px 6px #2c313a'
                }}
              >{d} min</button>
            )
          })}
        </div>

        <button
          onClick={() => {
            try { Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
            setSessionStarted(true);
            setIsRunning(true);
          }}
          style={{
            padding: '16px 48px', borderRadius: 32, background: '#6366F1', border: 'none',
            color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)'
          }}
        >Start Session</button>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: '#0F1117',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24
      }}>
        <CheckCircle2 size={80} color="#5dcaa5" style={{ marginBottom: 32 }} />
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily: 'sans-serif' }}>Session Complete</h1>
        <p style={{ color: '#8B8FA3', fontSize: 15, marginBottom: 40, textAlign: 'center' }}>You completed {selectedDuration} minutes of Box Breathing.</p>
        <button
          onClick={handleComplete}
          style={{
            padding: '16px 48px', borderRadius: 32, background: '#1C1F26', border: 'none',
            color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer',
            boxShadow: '4px 4px 10px #0c0d12, -4px -4px 10px #2c313a'
          }}
        >Done</button>
      </div>
    );
  }

  let orbScale = 0.12;
  if (isRunning) {
    if (phase.kind === 'in' || phase.kind === 'hold_in') {
      orbScale = 1.0;
    } else if (phase.kind === 'out' || phase.kind === 'hold_out') {
      orbScale = 0.12;
    }
  }

  const fullScreenScale = orbScale * 2.5;
  const cycleCount = Math.floor(elapsed / 16) + 1; // 16s per full cycle
  const totalCycles = Math.ceil(totalTargetSeconds / 16);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const currentSound = (musicOptions.find(m => m.id === activeSource) || {}).label || activeSource || 'Ambient';

  const btnShadow = isRunning
    ? `inset 4px 4px 8px ${colors.dark}, inset -4px -4px 8px ${colors.light}`
    : `5px 5px 10px ${colors.dark}, -5px -5px 10px ${colors.light}`;

  const transitionDuration = '4s';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: colors.bg,
      overflow: 'hidden',
      transition: 'background 1.2s ease',
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: ORB_BASE, height: ORB_BASE, borderRadius: '50%',
        backgroundColor: colors.orb,
        transform: `translate3d(-50%, -50%, 0) scale(${fullScreenScale})`,
        transition: `transform ${transitionDuration} linear, background-color 1.2s ease`,
        willChange: 'transform, background-color',
        pointerEvents: 'none', opacity: 0.95,
      }} />

      {[1.2, 1.5].map((multiplier, i) => (
        <div key={i} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: ORB_BASE + (i * 40), height: ORB_BASE + (i * 40), borderRadius: '50%',
          backgroundColor: i === 0 ? `${colors.orbGlow}22` : 'transparent',
          border: `1px solid ${colors.orbGlow}${i === 0 ? '44' : '22'}`,
          transform: `translate3d(-50%, -50%, 0) scale(${fullScreenScale * multiplier})`,
          transition: `transform ${transitionDuration} linear, background-color 1.2s ease, border-color 1.2s ease`,
          willChange: 'transform', pointerEvents: 'none',
        }} />
      ))}

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 20px 28px' }}>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0, flexShrink: 0 }}>
          <button
            onClick={() => {
              handleComplete(); // allow early exit
            }}
            style={{
              background: 'rgba(28,28,34,0.6)', backdropFilter: 'blur(8px)',
              border: 'none', borderRadius: 50, cursor: 'pointer',
              color: '#e8e6e3', fontSize: 22, lineHeight: 1,
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>

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
                borderRadius: 14, boxShadow: '6px 6px 16px rgba(0,0,0,0.5)',
                overflow: 'hidden', minWidth: 150,
              }}>
                {musicOptions.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { onChangeSource(m.id); setShowPicker(false); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
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

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {isRunning ? phase.label : "Paused"}
          </div>
          <div style={{ opacity: 0.8, filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.3))', transition: 'opacity 0.5s ease', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CurrentIcon size={48} color="#ffffff" style={{ transition: 'all 0.5s ease', ...currentStyle }} />
          </div>
          <div style={{ marginTop: 20, fontSize: 15, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
            {pad(mins)}:{pad(secs)}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Cycle {cycleCount} of {totalCycles}
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <button
            onClick={() => {
              try { Haptics.impact({ style: ImpactStyle.Light }); } catch(e) {}
              setIsRunning(r => !r);
            }}
            style={{
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(28,28,34,0.75)',
              backdropFilter: 'blur(10px)', boxShadow: btnShadow, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'box-shadow 0.2s ease',
            }}
          >
            {isRunning ? <Pause size={24} color="#5dcaa5" /> : <Play size={24} color="#5dcaa5" style={{ marginLeft: 3 }} />}
          </button>
          <div style={{ width: 44, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>
    </div>
  );
}
