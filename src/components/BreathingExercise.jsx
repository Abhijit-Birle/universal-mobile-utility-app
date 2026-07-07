import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from "lucide-react";

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
  const intervalRef = useRef(null);

  const tick = useCallback(() => {
    setCount((prev) => {
      if (prev > 1) return prev - 1;

      setPhaseIndex((prevPhase) => {
        const next = (prevPhase + 1) % PHASES.length;
        if (next === 0) {
          setRound((r) => (r < totalRounds ? r + 1 : r));
        }
        return next;
      });
      return null; 
    });
  }, []);

  useEffect(() => {
    setCount(PHASES[phaseIndex].duration);
  }, [phaseIndex]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, tick]);

  const handleReset = () => {
    setIsRunning(false);
    setPhaseIndex(0);
    setRound(1);
    setCount(PHASES[0].duration);
  };

  let scale = 1;
  if (phaseIndex === 0) {
    const progress = (PHASES[0].duration - count + 1) / PHASES[0].duration; 
    scale = 1 + progress * 0.3;
  } else if (phaseIndex === 1) {
    scale = 1.3;
  } else if (phaseIndex === 2) {
    const progress = (count - 1) / PHASES[2].duration; 
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
      <p style={{
        fontSize: 13,
        fontWeight: 600,
        color: theme.textSecondary,
        marginBottom: 24,
        letterSpacing: '0.05em',
      }}>
        {PHASES[phaseIndex].label.toUpperCase()}
      </p>

      <div style={{
        width: 160,
        height: 160,
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
            transition: 'transform 1s ease-in-out',
            transform: `scale(${scale})`,
          }}
        >
          <span style={{
            color: '#fff',
            fontSize: 32,
            fontWeight: 700,
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
