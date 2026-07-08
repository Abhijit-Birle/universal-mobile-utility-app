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
    // Breathe In
    const progress = (PHASES[0].duration - count) / Math.max(1, PHASES[0].duration - 1);
    scale = 1 + progress * 0.15;
  } else if (phaseIndex === 1) {
    // Hold
    scale = 1.15;
  } else if (phaseIndex === 2) {
    // Breathe Out
    const progress = (count - 1) / Math.max(1, PHASES[2].duration - 1);
    scale = 1 + progress * 0.15;
  }

  const fontDisplay = { fontFamily: "'Poppins', sans-serif" };
  const fontBody = { fontFamily: "'Inter', sans-serif" };

  return (
    <div style={{
      background: theme.bg,
      borderRadius: 20,
      minHeight: "100%",
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      ...fontBody
    }}>
      <style>
        {`
          @keyframes holdPulse {
            0% { box-shadow: 0 0 0 0 ${theme.accent}66; }
            70% { box-shadow: 0 0 0 15px ${theme.accent}00; }
            100% { box-shadow: 0 0 0 0 ${theme.accent}00; }
          }
        `}
      </style>

      {/* Hero section */}
      <div style={{ padding: "10px 18px 2px", textAlign: "center", paddingTop: 32, ...fontDisplay }}>
         <div style={{ fontSize: 10, letterSpacing: "0.06em", color: theme.accent, textTransform: "uppercase", fontWeight: 700 }}>MINDFULNESS</div>
         <div style={{ fontSize: 19, fontWeight: 500, marginTop: 2, color: theme.textPrimary }}>Take a deep breath</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          {phaseIndex === 0 && <ArrowUpCircle size={18} color={theme.accent} />}
          {phaseIndex === 1 && <PauseCircle size={18} color={theme.accent} />}
          {phaseIndex === 2 && <ArrowDownCircle size={18} color={theme.accent} />}
          <p style={{
            fontSize: 14,
            fontWeight: 700,
            color: theme.textSecondary,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: 0,
            ...fontBody
          }}>
            {PHASES[phaseIndex].label}
          </p>
        </div>

        <div style={{
          width: 210,
          height: 210,
          borderRadius: '50%',
          background: theme.bg,
          boxShadow: theme.shadowInset,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
        }}>
          <div
            style={{
              width: 172,
              height: 172,
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
              fontSize: 52,
              fontWeight: 500,
              fontFamily: "Outfit, system-ui, sans-serif"
            }}>{count}</span>
          </div>
        </div>

        {/* Round indicator dots */}
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 32,
        }}>
          {PHASES.map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: i === phaseIndex ? theme.accent : (darkMode ? "#3a4051" : "#c9cfda"),
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>

        {/* Play/Reset buttons */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
          <button
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: theme.bg,
              boxShadow: isRunning ? theme.shadowInset : theme.shadowRaisedSm,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isRunning ? theme.accent : theme.textPrimary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setIsRunning((r) => !r)}
          >
            {isRunning ? <Pause size={21} /> : <Play size={21} style={{ marginLeft: 3 }} />}
          </button>
          <button
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: theme.bg,
              boxShadow: theme.shadowRaisedSm,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={handleReset}
          >
            <RotateCcw size={19} />
          </button>
        </div>

        <p style={{
          fontSize: 12,
          color: theme.textSecondary,
          margin: 0,
          fontWeight: 500,
          ...fontBody
        }}>
          Round {round} of {totalRounds} · 4-7-8 Relaxing Breath
        </p>
      </div>

      {/* Quote Footer */}
      <div style={{
        fontSize: 12,
        fontStyle: 'italic',
        color: theme.textSecondary,
        padding: "0 24px 16px",
        textAlign: "center",
        ...fontBody
      }}>
        "Focus on the breath, and the mind will follow."
      </div>
    </div>
  );
}
