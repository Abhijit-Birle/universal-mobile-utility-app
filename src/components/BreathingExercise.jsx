import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowUpCircle, PauseCircle, ArrowDownCircle } from "lucide-react";

const PHASES = [
  { label: 'Breathe in', duration: 4 },
  { label: 'Hold', duration: 7 },
  { label: 'Breathe out', duration: 8 },
];

export default function BreathingExercise({ theme, darkMode }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(PHASES[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [round, setRound] = useState(1);
  const totalRounds = 4;
  useEffect(() => {
    if (!isRunning) return;
    
    const timer = setTimeout(() => {
      if (count > 1) {
        setCount(count - 1);
      } else {
        const nextPhase = (phaseIndex + 1) % PHASES.length;
        setPhaseIndex(nextPhase);
        setCount(PHASES[nextPhase].duration);
        if (nextPhase === 0) {
          setRound((r) => (r < totalRounds ? r + 1 : r));
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRunning, count, phaseIndex, totalRounds]);

  const handleReset = () => {
    setIsRunning(false);
    setPhaseIndex(0);
    setRound(1);
    setCount(PHASES[0].duration);
  };

  let scale = 1;
  if (phaseIndex === 0) {
    // Breathe In: Scale from 1.0 to 1.3
    const progress = (PHASES[0].duration - count) / Math.max(1, PHASES[0].duration - 1);
    scale = 1 + progress * 0.3;
  } else if (phaseIndex === 1) {
    // Hold: Stay at 1.3
    scale = 1.3;
  } else if (phaseIndex === 2) {
    // Breathe Out: Scale from 1.3 down to 1.0
    const progress = (count - 1) / Math.max(1, PHASES[2].duration - 1);
    scale = 1 + progress * 0.3;
  }

  return (
    <div style={{
      background: theme.bg,
      borderRadius: 24,
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 22,
      boxShadow: theme.shadowRaised,
    }}>
      <style>
        {`
          @keyframes holdPulse {
            0% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(108, 92, 231, 0); }
            100% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0); }
          }
        `}
      </style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        {phaseIndex === 0 && <ArrowUpCircle size={18} color={theme.accent} />}
        {phaseIndex === 1 && <PauseCircle size={18} color={theme.accent} />}
        {phaseIndex === 2 && <ArrowDownCircle size={18} color={theme.accent} />}
        <p style={{
          fontSize: 14,
          fontWeight: 700,
          color: theme.textSecondary,
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}>
          {PHASES[phaseIndex].label}
        </p>
      </div>

      <div style={{
        width: 170,
        height: 170,
        borderRadius: '50%',
        background: theme.bg,
        boxShadow: theme.shadowRaisedSm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
      }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.accent}, #6c5ce7)`,
            boxShadow: 'inset 4px 4px 10px rgba(0,0,0,0.1), inset -4px -4px 10px rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 1s linear',
            transform: `scale(${scale})`,
            animation: (phaseIndex === 1 && isRunning) ? 'holdPulse 2s infinite' : 'none'
          }}
        >
          <span style={{
            color: '#fff',
            fontSize: 36,
            fontWeight: 800,
            fontFamily: "Outfit, system-ui, sans-serif"
          }}>{count}</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
      }}>
        {PHASES.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i === phaseIndex ? theme.accent : (darkMode ? "#3a4051" : "#c9cfda"),
              transition: 'background 0.3s'
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <button
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: theme.bg,
            boxShadow: theme.shadowRaisedSm,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.textPrimary,
            cursor: 'pointer',
          }}
          onClick={() => setIsRunning((r) => !r)}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 3 }} />}
        </button>
        <button 
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: theme.bg,
            boxShadow: theme.shadowRaisedSm,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.textPrimary,
            cursor: 'pointer',
          }}
          onClick={handleReset}
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <p style={{
        fontSize: 12,
        color: theme.textSecondary,
        marginTop: 20,
        fontWeight: 500
      }}>
        Round {round} of {totalRounds} · 4-7-8 Relaxing Breath
      </p>
    </div>
  );
}
