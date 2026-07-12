import React from "react";
import * as LucideIcons from "lucide-react";
import BreathingScreen from "../components/BreathingScreen.jsx";
import BoxBreathingScreen from "../components/BoxBreathingScreen.jsx";
import BodyScanScreen from "../components/BodyScanScreen.jsx";
import SilentMeditationScreen from "../components/SilentMeditationScreen.jsx";
import VipassanaScreen from "../components/VipassanaScreen.jsx";
import ReflectionHistory from "../components/ReflectionHistory.jsx";
import GuidedMeditationPlayer from "../components/GuidedMeditationPlayer.jsx";
import { getScriptForContext, calculateStressScore } from "../utils/zenContext.js";

const BreatheIllustration = () => (
  <svg width="80" height="90" viewBox="0 0 90 100" fill="none" style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.9, overflow: 'visible' }}>
    <circle cx="42" cy="18" r="12" fill="#FAECE7" opacity="0.85"/>
    <path d="M42 28 C 30 32, 22 30, 15 40 C 25 42, 28 50, 20 58 C 30 58, 32 66, 25 74" stroke="#F5C4B3" strokeWidth="2"/>
    <path d="M42 28 C 55 30, 68 26, 78 34 C 66 38, 66 46, 76 52 C 64 54, 64 62, 74 68" stroke="#F5C4B3" strokeWidth="2"/>
  </svg>
);

const BoxIllustration = () => (
  <svg width="80" height="90" viewBox="0 0 90 100" fill="none" style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.9, overflow: 'visible' }}>
    <circle cx="45" cy="16" r="11" fill="#E6F1FB" opacity="0.85"/>
    <rect x="20" y="30" width="50" height="50" rx="6" transform="rotate(45 45 55)" stroke="#B5D4F4" strokeWidth="2"/>
    <rect x="32" y="42" width="26" height="26" rx="4" transform="rotate(45 45 55)" stroke="#B5D4F4" strokeWidth="1.5" opacity="0.6"/>
  </svg>
);

const SilentIllustration = () => (
  <svg width="75" height="90" viewBox="0 0 90 110" fill="none" style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.9, overflow: 'visible' }}>
    <circle cx="45" cy="18" r="13" fill="#E1F5EE" opacity="0.85"/>
    <path d="M45 32 C 30 34, 22 44, 26 54 C 18 58, 16 66, 22 74 C 30 82, 38 86, 45 86 C 52 86, 60 82, 68 74 C 74 66, 72 58, 64 54 C 68 44, 60 34, 45 32 Z" stroke="#9FE1CB" strokeWidth="2"/>
  </svg>
);

const VipassanaIllustration = () => (
  <svg width="80" height="80" viewBox="0 0 90 90" fill="none" style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.9, overflow: 'visible' }}>
    <circle cx="45" cy="16" r="10" fill="#FBEAF0" opacity="0.85"/>
    <path d="M18 45 C 30 32, 60 32, 72 45 C 60 58, 30 58, 18 45 Z" stroke="#F4C0D1" strokeWidth="2"/>
    <circle cx="45" cy="45" r="7" fill="#FBEAF0"/>
    <path d="M14 45 L 4 40 M14 45 L 4 50 M76 45 L 86 40 M76 45 L 86 50" stroke="#F4C0D1" strokeWidth="1.5" opacity="0.5"/>
  </svg>
);

const ScanIllustration = () => (
  <svg width="60" height="90" viewBox="0 0 80 120" fill="none" style={{ position: 'absolute', right: 25, top: '50%', transform: 'translateY(-50%)', opacity: 0.9, overflow: 'visible' }}>
    <path d="M40 8 L 40 55 M28 20 L 40 8 L 52 20" stroke="#EF9F27" strokeWidth="2"/>
    <path d="M18 55 L 62 55 C 62 75, 52 90, 40 96 C 28 90, 18 75, 18 55 Z" stroke="#EF9F27" strokeWidth="2"/>
  </svg>
);

export default function ZenTab({
  theme, fontDisplay, fontBody,
  zenStreak, activeTechnique, setActiveTechnique, markZenActiveToday,
  showReflectionHistory, setShowReflectionHistory,
  activeSource, setActiveSource, MUSIC_OPTIONS, handleMeditationComplete,
  NeoSurface, todos, transactions,
}) {
  const stressResult = calculateStressScore(todos || [], transactions || []);
  const guidedScript = getScriptForContext(stressResult);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 16px", gap: 16, overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Zen</div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: theme.bg, boxShadow: theme.shadowRaisedSm,
          padding: "6px 12px", borderRadius: 20,
          fontSize: 13, fontWeight: 600, color: theme.accent, ...fontBody
        }}>
          <span>🔥</span> {zenStreak} Day Streak
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => setShowReflectionHistory(true)}
          style={{
            background: 'transparent', border: 'none', color: theme.accent,
            fontSize: 14, fontWeight: 600, cursor: 'pointer', ...fontBody
          }}
        >
          View Past Entries & Sessions
        </button>
      </div>
      
      <div style={{ height: 1, background: theme.border, margin: '8px 0' }} />
      
      <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay, marginTop: 8, padding: "0 4px" }}>Techniques</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Card 1: 4-7-8 Breathing */}
        <NeoSurface
          onClick={() => setActiveTechnique('4-7-8')}
          style={{
            background: '#D85A30', borderRadius: 22, padding: 16, height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', cursor: 'pointer', color: '#4A1B0C'
          }}
        >
          <div style={{ fontSize: 16, lineHeight: 1.3, zIndex: 2, position: 'relative', fontFamily: 'sans-serif' }}>
            <span style={{ fontWeight: 800 }}>Breathe</span> in, out,<br />for calm
          </div>
          <BreatheIllustration />
          <div style={{ width: 32, height: 32, borderRadius: 16, background: '#4A1B0C', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <LucideIcons.ArrowRight size={16} color="#ffffff" strokeWidth={2.5} />
          </div>
        </NeoSurface>

        {/* Card 2: Box Breathing */}
        <NeoSurface
          onClick={() => setActiveTechnique('box')}
          style={{
            background: '#85B7EB', borderRadius: 22, padding: 16, height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', cursor: 'pointer', color: '#042C53'
          }}
        >
          <div style={{ fontSize: 16, lineHeight: 1.3, zIndex: 2, position: 'relative', fontFamily: 'sans-serif' }}>
            <span style={{ fontWeight: 800 }}>Box</span><br />Breathing
          </div>
          <BoxIllustration />
          <div style={{ width: 32, height: 32, borderRadius: 16, background: '#042C53', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <LucideIcons.ArrowRight size={16} color="#ffffff" strokeWidth={2.5} />
          </div>
        </NeoSurface>

        {/* Card 3: Silent Meditation */}
        <NeoSurface
          onClick={() => setActiveTechnique('silent')}
          style={{
            background: '#5DCAA5', borderRadius: 22, padding: 16, height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', cursor: 'pointer', color: '#04342C'
          }}
        >
          <div style={{ fontSize: 16, lineHeight: 1.3, zIndex: 2, position: 'relative', fontFamily: 'sans-serif' }}>
            <span style={{ fontWeight: 800 }}>Silent</span><br />Meditation
          </div>
          <SilentIllustration />
          <div style={{ width: 32, height: 32, borderRadius: 16, background: '#04342C', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <LucideIcons.ArrowRight size={16} color="#ffffff" strokeWidth={2.5} />
          </div>
        </NeoSurface>

        {/* Card 4: Vipassana */}
        <NeoSurface
          onClick={() => setActiveTechnique('vipassana')}
          style={{
            background: '#D4537E', borderRadius: 22, padding: 16, height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', cursor: 'pointer', color: '#4B1528'
          }}
        >
          <div style={{ fontSize: 16, lineHeight: 1.3, zIndex: 2, position: 'relative', fontFamily: 'sans-serif' }}>
            <span style={{ fontWeight: 800 }}>Vipassana</span>
          </div>
          <VipassanaIllustration />
          <div style={{ width: 32, height: 32, borderRadius: 16, background: '#4B1528', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <LucideIcons.ArrowRight size={16} color="#ffffff" strokeWidth={2.5} />
          </div>
        </NeoSurface>

        {/* Card 5: Body Scan (Banner) */}
        <NeoSurface
          onClick={() => setActiveTechnique('bodyscan')}
          style={{
            background: '#FAC775', borderRadius: 22, padding: 16, height: 110, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', cursor: 'pointer', color: '#412402'
          }}
        >
          <div style={{ fontSize: 16, lineHeight: 1.3, zIndex: 2, position: 'relative', fontFamily: 'sans-serif' }}>
            <span style={{ fontWeight: 800 }}>Body Scan</span>
          </div>
          <ScanIllustration />
          <div style={{ width: 32, height: 32, borderRadius: 16, background: '#412402', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, marginTop: 'auto' }}>
            <LucideIcons.ArrowRight size={16} color="#ffffff" strokeWidth={2.5} />
          </div>
        </NeoSurface>

        {/* Card 6: AI Guided (Banner) */}
        <NeoSurface
          onClick={() => setActiveTechnique('guided')}
          style={{
            background: 'linear-gradient(135deg, #1a0a2e, #0d2438)', gridColumn: '1 / -1',
            borderRadius: 22, padding: 16, height: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden', cursor: 'pointer',
            border: '1px solid rgba(93,202,165,0.25)',
          }}
        >
          <div style={{ zIndex: 2 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#5DCAA5', fontFamily: 'sans-serif' }}>🧘 AI Guided</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2, ...fontBody }}>{guidedScript.title} · {guidedScript.duration}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: '#5DCAA5', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <LucideIcons.Play size={16} color="#fff" fill="#fff" />
          </div>
        </NeoSurface>
      </div>

      <div style={{ height: 60 }} />

      {/* Full-screen Overlays */}
      {activeTechnique === '4-7-8' && (
        <BreathingScreen
          onClose={() => { setActiveTechnique(null); markZenActiveToday(); }}
          activeSource={activeSource} musicOptions={MUSIC_OPTIONS} onChangeSource={setActiveSource}
        />
      )}
      {activeTechnique === 'box' && (
        <BoxBreathingScreen
          onClose={() => setActiveTechnique(null)}
          onComplete={handleMeditationComplete}
          activeSource={activeSource} musicOptions={MUSIC_OPTIONS} onChangeSource={setActiveSource}
        />
      )}
      {activeTechnique === 'bodyscan' && (
        <BodyScanScreen
          onClose={() => setActiveTechnique(null)}
          onComplete={handleMeditationComplete}
          activeSource={activeSource} musicOptions={MUSIC_OPTIONS} onChangeSource={setActiveSource}
        />
      )}
      {activeTechnique === 'silent' && (
        <SilentMeditationScreen
          onClose={() => setActiveTechnique(null)}
          onComplete={handleMeditationComplete}
          activeSource={activeSource} musicOptions={MUSIC_OPTIONS} onChangeSource={setActiveSource}
        />
      )}
      {activeTechnique === 'vipassana' && (
        <VipassanaScreen
          onClose={() => setActiveTechnique(null)}
          onComplete={handleMeditationComplete}
          activeSource={activeSource} musicOptions={MUSIC_OPTIONS} onChangeSource={setActiveSource}
        />
      )}
      {activeTechnique === 'guided' && (
        <GuidedMeditationPlayer
          script={guidedScript}
          theme={theme}
          fontDisplay={fontDisplay}
          fontBody={fontBody}
          onClose={() => setActiveTechnique(null)}
          onComplete={() => { handleMeditationComplete(); setActiveTechnique(null); markZenActiveToday(); }}
        />
      )}
      
      {showReflectionHistory && (
        <ReflectionHistory
          onClose={() => setShowReflectionHistory(false)}
          theme={theme}
          fontDisplay={fontDisplay}
          fontBody={fontBody}
          NeoSurface={NeoSurface}
        />
      )}
    </div>
  );
}
