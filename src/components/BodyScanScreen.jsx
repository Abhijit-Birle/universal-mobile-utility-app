import React, { useState, useEffect } from 'react';
import { User, Play, Pause, ChevronDown, Music, CheckCircle2 } from 'lucide-react';
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const Particles = React.lazy(() => import('./reactbits/Particles.jsx'));

const REGIONS = [
  { name: 'Head', prompt: "Notice any tension in your face or jaw. Let it soften." },
  { name: 'Shoulders', prompt: "Allow your shoulders to drop away from your ears." },
  { name: 'Arms', prompt: "Feel the weight of your arms resting naturally." },
  { name: 'Chest', prompt: "Observe the gentle rise and fall of your chest." },
  { name: 'Abdomen', prompt: "Let your belly soften with each breath." },
  { name: 'Legs', prompt: "Notice the sensation of your legs connecting with the surface." },
  { name: 'Feet', prompt: "Bring awareness to the soles of your feet." },
];

function pad(n) { return String(n).padStart(2, '0'); }
const DURATIONS = [5, 10, 15]; // in minutes

export default function BodyScanScreen({ onClose, onComplete, activeSource, musicOptions = [], onChangeSource }) {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const totalTargetSeconds = selectedDuration * 60;
  const timePerRegion = totalTargetSeconds / REGIONS.length;

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
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, totalTargetSeconds, sessionCompleted]);

  const handleComplete = () => {
    if (onComplete) {
      onComplete({
        type: 'body-scan',
        duration: Math.floor(elapsed / 60),
        completed: elapsed >= totalTargetSeconds
      });
    }
    onClose();
  };

  if (!sessionStarted) {
    return (
      <div 
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: '#0F1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
          touchAction: 'none',
          overscrollBehavior: 'none'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 30, left: 24, background: 'none', border: 'none', color: '#8B8FA3', fontSize: 28, cursor: 'pointer' }}>×</button>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: '#1C1F26', boxShadow: 'inset 4px 4px 10px #0c0d12, inset -4px -4px 10px #2c313a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <User size={36} color="#6366F1" />
        </div>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily: 'sans-serif' }}>Body Scan</h1>
        <p style={{ color: '#8B8FA3', fontSize: 15, marginBottom: 40, textAlign: 'center' }}>Bring awareness to each part of your body</p>

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
      <div 
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: '#0F1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
          touchAction: 'none',
          overscrollBehavior: 'none'
      }}>
        <CheckCircle2 size={80} color="#5dcaa5" style={{ marginBottom: 32 }} />
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily: 'sans-serif' }}>Session Complete</h1>
        <p style={{ color: '#8B8FA3', fontSize: 15, marginBottom: 40, textAlign: 'center' }}>You completed {selectedDuration} minutes of Body Scan.</p>
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

  const regionIndex = Math.min(Math.floor(elapsed / timePerRegion), REGIONS.length - 1);
  const currentRegion = REGIONS[regionIndex];

  return (
    <div 
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: '#0F1117', overflow: 'hidden',
        touchAction: 'none',
        overscrollBehavior: 'none'
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: -1, opacity: 0.3, pointerEvents: 'none' }}>
        <React.Suspense fallback={null}>
          <Particles particleColors={['#ffffff', '#ffffff']} particleCount={150} particleSpread={10} speed={0.1} particleBaseSize={100} moveParticlesOnHover={false} alphaParticles={true} disableRotation={false} />
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

        {/* Progress Bar */}
        <div style={{ width: '100%', padding: '20px 20px', display: 'flex', gap: 4 }}>
          {REGIONS.map((r, i) => (
            <div key={r.name} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i < regionIndex ? '#6366F1' : i === regionIndex ? '#4F46E5' : '#2A2D35',
              opacity: i === regionIndex ? (Math.sin(elapsed) * 0.2 + 0.8) : 1, // subtle pulse
              transition: 'background 0.5s ease'
            }} />
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', padding: '0 32px' }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#6366F1', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>
            {currentRegion.name}
          </div>
          <div style={{ fontSize: 24, color: '#fff', textAlign: 'center', lineHeight: 1.4, minHeight: 80, transition: 'opacity 1s ease' }}>
            {currentRegion.prompt}
          </div>
          
          <div style={{ marginTop: 40, fontSize: 18, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }}>
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
