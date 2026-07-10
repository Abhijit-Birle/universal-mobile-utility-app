import React, { useState, useEffect } from 'react';
import { Eye, Play, Pause, ChevronDown, Music, CheckCircle2 } from 'lucide-react';
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const Waves = React.lazy(() => import('./reactbits/Waves.jsx'));

function pad(n) { return String(n).padStart(2, '0'); }
const DURATIONS = [5, 10, 15, 20, 30, 45, 60]; // in minutes

export default function VipassanaScreen({ onClose, onComplete, activeSource, musicOptions = [], onChangeSource }) {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(20);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const totalTargetSeconds = selectedDuration * 60;

  useEffect(() => {
    if (!isRunning || sessionCompleted) return;
    const id = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (next >= totalTargetSeconds) {
          setIsRunning(false);
          setSessionCompleted(true);
          try { Haptics.impact({ style: ImpactStyle.Heavy }); } catch(e) {}
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, totalTargetSeconds, sessionCompleted]);

  const handleComplete = () => {
    if (onComplete) {
      onComplete({
        type: 'vipassana',
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
        background: '#0F1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 30, left: 24, background: 'none', border: 'none', color: '#8B8FA3', fontSize: 28, cursor: 'pointer' }}>×</button>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: '#1C1F26', boxShadow: 'inset 4px 4px 10px #0c0d12, inset -4px -4px 10px #2c313a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <Eye size={36} color="#6366F1" />
        </div>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily: 'sans-serif' }}>Vipassana</h1>
        <p style={{ color: '#8B8FA3', fontSize: 15, marginBottom: 40, textAlign: 'center' }}>Observe sensations with equanimity</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 48, justifyContent: 'center', maxWidth: 300 }}>
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
                  width: 64, height: 44, borderRadius: 22,
                  background: '#1C1F26', border: 'none', cursor: 'pointer',
                  color: isSel ? '#6366F1' : '#8B8FA3', fontWeight: 600, fontSize: 15,
                  boxShadow: isSel ? 'inset 3px 3px 6px #0c0d12, inset -3px -3px 6px #2c313a' : '3px 3px 6px #0c0d12, -3px -3px 6px #2c313a'
                }}
              >{d}m</button>
            )
          })}
        </div>

        <button
          onClick={() => {
            try { Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) {}
            setSessionStarted(true);
            setIsRunning(true);
          }}
          style={{
            padding: '16px 48px', borderRadius: 32, background: '#6366F1', border: 'none',
            color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)'
          }}
        >Begin Practice</button>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: '#0F1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24
      }}>
        <CheckCircle2 size={80} color="#5dcaa5" style={{ marginBottom: 32 }} />
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily: 'sans-serif' }}>Practice Complete</h1>
        <p style={{ color: '#8B8FA3', fontSize: 15, marginBottom: 40, textAlign: 'center' }}>You completed {selectedDuration} minutes of Vipassana.</p>
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

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  
  const currentSound = (musicOptions.find(m => m.id === activeSource) || {}).label || activeSource || 'Ambient';

  const btnShadow = isRunning
    ? `inset 4px 4px 8px #0c0d12, inset -4px -4px 8px #2c313a`
    : `5px 5px 10px #0c0d12, -5px -5px 10px #2c313a`;

  // Gentle guiding prompt for Vipassana (rotates very slowly)
  const prompts = [
    "Observe the sensation of breath at the tip of your nose",
    "Notice sensations as they arise and pass away",
    "Maintain equanimity. React to nothing.",
    "Scan your awareness through the body",
    "Everything is impermanent. Just observe."
  ];
  const currentPrompt = prompts[Math.floor(elapsed / 15) % prompts.length];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: '#0F1117', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: -1, opacity: 0.2, pointerEvents: 'none' }}>
        <React.Suspense fallback={null}>
          <Waves lineColor="#ffffff" backgroundColor="transparent" />
        </React.Suspense>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 20px 28px' }}>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0, flexShrink: 0 }}>
          <button
            onClick={handleComplete}
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
                borderRadius: 14, boxShadow: '6px 6px 16px rgba(0,0,0,0.5)', overflow: 'hidden', minWidth: 150,
              }}>
                {musicOptions.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { onChangeSource(m.id); setShowPicker(false); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                      color: m.id === activeSource ? '#5dcaa5' : '#e8e6e3',
                      fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: m.id === activeSource ? 700 : 400,
                    }}
                  >{m.label}</button>
                ))}
              </div>
            )}
          </div>
          <div style={{ width: 36 }} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', padding: '0 32px' }}>
          <div style={{ opacity: 0.2, marginBottom: 20 }}>
            <Eye size={48} color="#ffffff" />
          </div>
          <div style={{ fontSize: 20, color: '#fff', textAlign: 'center', lineHeight: 1.4, minHeight: 80, transition: 'opacity 2s ease' }}>
            {currentPrompt}
          </div>
          
          <div style={{ marginTop: 20, fontSize: 16, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
            {pad(mins)}:{pad(secs)}
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <button
            onClick={() => {
              try { Haptics.impact({ style: ImpactStyle.Light }); } catch(e) {}
              setIsRunning(r => !r);
            }}
            style={{
              width: 64, height: 64, borderRadius: '50%', background: '#1C1F26',
              boxShadow: btnShadow, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'box-shadow 0.2s ease',
            }}
          >
            {isRunning ? <Pause size={24} color="#6366F1" /> : <Play size={24} color="#6366F1" style={{ marginLeft: 3 }} />}
          </button>
          <div style={{ width: 44, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>
    </div>
  );
}
