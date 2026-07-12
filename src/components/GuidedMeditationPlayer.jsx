import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

const CALM_VOICES_PREFERENCE = ['samantha', 'daniel', 'karen', 'moira', 'fiona', 'kate', 'victoria', 'zoe', 'google uk english female', 'google us english'];

function pickCalmestVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  for (const pref of CALM_VOICES_PREFERENCE) {
    const found = voices.find(v => v.name.toLowerCase().includes(pref));
    if (found) return found;
  }
  const enVoice = voices.find(v => v.lang.startsWith('en'));
  return enVoice || voices[0];
}

export default function GuidedMeditationPlayer({ script, theme, fontDisplay, fontBody, onClose, onComplete }) {
  const [phase, setPhase] = useState('ready'); // ready | playing | paused | done
  const [elapsed, setElapsed] = useState(0);
  const [voiceReady, setVoiceReady] = useState(false);
  const utteranceRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedAtRef = useRef(0);

  // Pre-load voices
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const tryLoad = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) setVoiceReady(true);
    };
    tryLoad();
    window.speechSynthesis.onvoiceschanged = tryLoad;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    clearInterval(intervalRef.current);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const startElapsedTimer = () => {
    clearInterval(intervalRef.current);
    startTimeRef.current = Date.now() - pausedAtRef.current * 1000;
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const handlePlay = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(script.script);
    utterance.rate = 0.78;
    utterance.pitch = 0.95;
    utterance.volume = 0.9;
    const voice = pickCalmestVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      clearInterval(intervalRef.current);
      setPhase('done');
      onComplete?.();
    };
    utterance.onerror = () => {
      clearInterval(intervalRef.current);
      setPhase('ready');
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPhase('playing');
    startElapsedTimer();
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    clearInterval(intervalRef.current);
    pausedAtRef.current = elapsed;
    setPhase('paused');
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
    startElapsedTimer();
    setPhase('playing');
  };

  const handleRestart = () => {
    stop();
    setElapsed(0);
    pausedAtRef.current = 0;
    setPhase('ready');
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: 'linear-gradient(160deg, #0f1a2e 0%, #0d2438 40%, #1a0a2e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 32,
    }}>
      {/* Close */}
      <button onClick={() => { stop(); onClose(); }} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 12,
        width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
      }}>
        <X size={18} />
      </button>

      {/* Pulsing circle */}
      <div style={{
        width: 160, height: 160, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(93,202,165,0.2) 0%, rgba(93,202,165,0.05) 60%, transparent 100%)',
        border: '1px solid rgba(93,202,165,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: phase === 'playing' ? 'zenPulse 4s ease-in-out infinite' : 'none',
        marginBottom: 32,
        position: 'relative',
      }}>
        <style>{`
          @keyframes zenPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(93,202,165,0.2); }
            50% { transform: scale(1.06); box-shadow: 0 0 40px 20px rgba(93,202,165,0.08); }
          }
        `}</style>
        <span style={{ fontSize: 52 }}>🧘</span>
      </div>

      {/* Title */}
      <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 8, ...fontDisplay }}>
        {script.title}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 40, textAlign: 'center', ...fontBody }}>
        {script.duration} guided session
      </div>

      {/* Voice status */}
      {!voiceReady && (
        <div style={{ fontSize: 12, color: 'rgba(255,200,100,0.8)', marginBottom: 20, ...fontBody }}>
          Loading voices...
        </div>
      )}

      {/* Done state */}
      {phase === 'done' && (
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
          <div style={{ fontSize: 16, color: '#5DCAA5', fontWeight: 600, ...fontDisplay }}>Session complete</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, ...fontBody }}>Take a moment before you continue</div>
        </div>
      )}

      {/* Elapsed */}
      {phase !== 'ready' && phase !== 'done' && (
        <div style={{ fontSize: 32, fontWeight: 300, color: 'rgba(255,255,255,0.8)', marginBottom: 32, letterSpacing: 2, ...fontDisplay }}>
          {fmtTime(elapsed)}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        {(phase === 'playing' || phase === 'paused' || phase === 'done') && (
          <button onClick={handleRestart} style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)',
          }}>
            <RotateCcw size={20} />
          </button>
        )}

        {(phase === 'ready' || phase === 'paused') && (
          <button onClick={phase === 'ready' ? handlePlay : handleResume} disabled={!voiceReady} style={{
            width: 72, height: 72, borderRadius: '50%',
            background: voiceReady ? 'linear-gradient(135deg, #5DCAA5, #3aa882)' : 'rgba(255,255,255,0.15)',
            border: 'none', cursor: voiceReady ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: voiceReady ? '0 0 30px rgba(93,202,165,0.4)' : 'none',
          }}>
            <Play size={28} fill="#fff" />
          </button>
        )}

        {phase === 'playing' && (
          <button onClick={handlePause} style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #5DCAA5, #3aa882)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: '0 0 30px rgba(93,202,165,0.4)',
          }}>
            <Pause size={28} fill="#fff" />
          </button>
        )}

        {phase === 'done' && (
          <button onClick={() => { stop(); onClose(); }} style={{
            padding: '14px 32px', borderRadius: 24,
            background: 'linear-gradient(135deg, #5DCAA5, #3aa882)',
            border: 'none', cursor: 'pointer', color: '#fff',
            fontSize: 15, fontWeight: 600, ...fontBody,
            boxShadow: '0 0 30px rgba(93,202,165,0.4)',
          }}>
            Done ✓
          </button>
        )}
      </div>

      {/* Script preview */}
      {phase === 'ready' && (
        <div style={{
          marginTop: 36, padding: '14px 20px', borderRadius: 16,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: 320, textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 6 }}>
            <Volume2 size={14} color='rgba(255,255,255,0.5)' />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', ...fontBody }}>VOICE NARRATION</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, ...fontBody }}>
            "{script.script.slice(0, 80).replace(/\n/g, ' ')}..."
          </div>
        </div>
      )}
    </div>
  );
}
