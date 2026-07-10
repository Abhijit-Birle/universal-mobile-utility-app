import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Bell } from 'lucide-react';
import LiquidWave from './ui/LiquidWave.jsx';
import WheelPicker from './ui/WheelPicker.jsx';

const CX = 145, CY = 145;          // SVG center
const R_OUTER = 112;               // progress ring radius
const R_NEEDLE = 82;               // needle tip radius (inside inner circle)
const TICK_COUNT = 60;

function polarToXY(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export default function MeditationTimerCard({
  theme,
  fontDisplay,
  fontBody,
  meditationDuration,
  setMeditationDuration,
  meditationTimeLeft,
  setMeditationTimeLeft,
  isMeditating,
  setIsMeditating,
}) {
  const totalSeconds = meditationDuration * 60;
  const progress = isMeditating
    ? (totalSeconds - meditationTimeLeft) / totalSeconds
    : 0;

  const circumference = 2 * Math.PI * R_OUTER;
  const strokeDashoffset = circumference * (1 - progress);
  const needleAngle = progress * 360; // 0° = top, clockwise

  const needleTip = polarToXY(CX, CY, R_NEEDLE, needleAngle);

  const formatTime = (s) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsMeditating(false);
    setMeditationTimeLeft(meditationDuration * 60);
  };

  // Tick marks (every 6° = 1 minute tick, every 30° = 5 min tick)
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const angle = (i / TICK_COUNT) * 360;
    const isMajor = i % 5 === 0;
    const r1 = R_OUTER + (isMajor ? 14 : 9);
    const r2 = R_OUTER + (isMajor ? 22 : 16);
    const p1 = polarToXY(CX, CY, r1, angle);
    const p2 = polarToXY(CX, CY, r2, angle);
    return { p1, p2, isMajor, angle };
  });

  const [showCustom, setShowCustom] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMins, setCustomMins] = useState(0);

  const handleSetCustom = () => {
    const totalMins = customHours * 60 + customMins;
    if (totalMins > 0) {
      setMeditationDuration(totalMins);
      setMeditationTimeLeft(totalMins * 60);
    }
    setShowCustom(false);
  };

  // Colors adapted to theme
  const isDark = theme.bg.includes('1c') || theme.bg.includes('22') || theme.bg.includes('1e') || theme.bg.includes('2b');
  const trackColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const tickDimColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  // Continuous smooth color interpolation
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  };

  const interpolateRgb = (color1, color2, factor) => {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    const r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
    const g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
    const b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
    return `rgb(${r}, ${g}, ${b})`;
  };

  let dynamicColor = theme.accent;
  if (isMeditating) {
    const remainingRatio = meditationTimeLeft / totalSeconds;
    if (remainingRatio > 0.5) {
      // Top 50%: fade from Accent to Amber (#F59E0B)
      // factor goes from 0 (at 100%) to 1 (at 50%)
      const factor = (1 - remainingRatio) * 2;
      dynamicColor = interpolateRgb(theme.accent, '#F59E0B', factor);
    } else {
      // Bottom 50%: fade from Amber to Red (#EF4444)
      // factor goes from 0 (at 50%) to 1 (at 0%)
      const factor = (0.5 - remainingRatio) * 2;
      dynamicColor = interpolateRgb('#F59E0B', '#EF4444', factor);
    }
  }
  const tickLitColor = dynamicColor;

  const lightShadow = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.4)';
  const darkShadow = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)';

  return (
    <div style={{
      background: theme.bg,
      borderRadius: 32,
      padding: '28px 20px 32px',
      boxShadow: theme.shadowRaised,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>

      {/* ── Dial ── */}
      <div style={{ position: 'relative', width: 290, height: 290, marginBottom: 28 }}>
        <svg
          width="100%" height="100%"
          viewBox="0 0 290 290"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* === Layer 0 — tick ring (outermost) === */}
          {ticks.map((t, i) => {
            const lit = progress > 0 && (i / TICK_COUNT) <= progress;
            return (
              <line
                key={i}
                x1={t.p1.x} y1={t.p1.y}
                x2={t.p2.x} y2={t.p2.y}
                stroke={lit ? tickLitColor : tickDimColor}
                strokeWidth={t.isMajor ? 2.5 : 1.5}
                strokeLinecap="round"
                style={{ transition: 'stroke 1s linear' }}
              />
            );
          })}

          {/* === Layer 1 — track ring === */}
          <circle
            cx={CX} cy={CY} r={R_OUTER}
            fill="none"
            stroke={trackColor}
            strokeWidth={14}
          />

          {/* === Layer 2 — progress arc (glowing) === */}
          <circle
            cx={CX} cy={CY} r={R_OUTER}
            fill="none"
            stroke={dynamicColor}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{
              transition: 'stroke-dashoffset 1s linear, stroke 1s linear, filter 1s linear',
              filter: `drop-shadow(0 0 6px ${dynamicColor}80)`,
            }}
          />

          {/* === Layer 3 — outer recessed circle === */}
          <circle
            cx={CX} cy={CY} r={R_OUTER - 18}
            fill={theme.bg}
            style={{
              filter: `drop-shadow(2px 2px 5px ${darkShadow}) drop-shadow(-2px -2px 5px ${lightShadow})`,
            }}
          />

          {/* === Layer 4 — middle raised platform === */}
          <circle
            cx={CX} cy={CY} r={72}
            fill={theme.bg}
            style={{
              filter: `drop-shadow(-3px -3px 6px ${lightShadow}) drop-shadow(3px 3px 6px ${darkShadow})`,
            }}
          />

          {/* === Layer 5 — innermost recessed center === */}
          <circle
            cx={CX} cy={CY} r={54}
            fill={theme.bg}
            style={{
              filter: `drop-shadow(inset 2px 2px 5px ${darkShadow}) drop-shadow(inset -2px -2px 5px ${lightShadow})`,
            }}
          />

          {/* === Needle === */}
          {isMeditating && (
            <>
              {/* Needle shadow */}
              <line
                x1={CX + 1} y1={CY + 1}
                x2={needleTip.x + 1} y2={needleTip.y + 1}
                stroke={darkShadow}
                strokeWidth={3}
                strokeLinecap="round"
              />
              {/* Needle body */}
              <line
                x1={CX} y1={CY}
                x2={needleTip.x} y2={needleTip.y}
                stroke={dynamicColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                style={{ transition: 'x2 1s linear, y2 1s linear, stroke 1s linear' }}
              />
              {/* Pivot dot */}
              <circle cx={CX} cy={CY} r={5} fill={dynamicColor} style={{ transition: 'fill 1s linear' }} />
              <circle cx={CX} cy={CY} r={2.5} fill={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.8)'} />
              {/* Needle tip orb (glowing cap) */}
              <circle
                cx={needleTip.x} cy={needleTip.y} r={5}
                fill={dynamicColor}
                style={{
                  filter: `drop-shadow(0 0 4px ${dynamicColor})`,
                  transition: 'cx 1s linear, cy 1s linear, fill 1s linear, filter 1s linear',
                }}
              />
            </>
          )}
        </svg>

        {/* Dynamic Liquid Wave Visualization */}
        {isMeditating && (
          <div style={{
            position: 'absolute',
            top: CY - 54,
            left: CX - 54,
            width: 108,
            height: 108,
            borderRadius: '50%',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}>
            <LiquidWave 
              progress={progress}
              color={dynamicColor}
              backgroundColor={theme.bg}
              size={108}
            />
          </div>
        )}

        {/* Time text — center of the dial, overlaid via absolute div */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 2,
        }}>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: theme.textPrimary,
            letterSpacing: '-1px',
            lineHeight: 1,
            ...fontDisplay,
          }}>
            {formatTime(isMeditating ? meditationTimeLeft : meditationDuration * 60)}
          </div>
          <div style={{
            fontSize: 9,
            fontWeight: 700,
            color: theme.textSecondary,
            marginTop: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            ...fontBody,
          }}>
            {isMeditating ? 'remaining' : 'set time'}
          </div>
        </div>
      </div>

      {/* ── Preset chips & Custom Time ── */}
      {!isMeditating && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          {showCustom ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, height: 120 }}>
                <WheelPicker
                  options={Array.from({ length: 13 }, (_, i) => i)}
                  value={customHours}
                  onChange={setCustomHours}
                  label="hrs"
                  theme={theme}
                  itemHeight={36}
                  fontSize={20}
                />
                <WheelPicker
                  options={Array.from({ length: 60 }, (_, i) => i)}
                  value={customMins}
                  onChange={setCustomMins}
                  label="min"
                  theme={theme}
                  itemHeight={36}
                  fontSize={20}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowCustom(false)}
                  style={{
                    padding: '8px 20px', borderRadius: 20, border: 'none',
                    background: theme.bg, color: theme.textSecondary,
                    boxShadow: theme.shadowRaisedSm, cursor: 'pointer',
                    fontWeight: 600, ...fontBody
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetCustom}
                  style={{
                    padding: '8px 20px', borderRadius: 20, border: 'none',
                    background: theme.accent, color: '#fff',
                    boxShadow: `0 4px 12px ${theme.accent}60`, cursor: 'pointer',
                    fontWeight: 600, ...fontBody
                  }}
                >
                  Set Timer
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 14 }}>
              {[5, 10, 15, 20].map(min => {
                const active = meditationDuration === min;
                return (
                  <button
                    key={min}
                    onClick={() => { setMeditationDuration(min); setMeditationTimeLeft(min * 60); }}
                    style={{
                      width: 58, height: 58,
                      background: theme.bg,
                      color: active ? theme.accent : theme.textSecondary,
                      boxShadow: active ? theme.shadowInset : theme.shadowRaisedSm,
                      border: 'none', borderRadius: 16,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.25s',
                      outline: active ? `2px solid ${theme.accent}55` : 'none',
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, ...fontDisplay }}>
                      {String(min).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: 9, marginTop: 3, letterSpacing: '0.05em', ...fontBody }}>min</div>
                  </button>
                );
              })}
              {/* Custom button */}
              <button
                onClick={() => {
                  setCustomHours(Math.floor(meditationDuration / 60));
                  setCustomMins(meditationDuration % 60);
                  setShowCustom(true);
                }}
                style={{
                  width: 58, height: 58,
                  background: theme.bg,
                  color: theme.textSecondary,
                  boxShadow: theme.shadowRaisedSm,
                  border: 'none', borderRadius: 16,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, ...fontBody }}>...</div>
                <div style={{ fontSize: 9, marginTop: 2, ...fontBody }}>custom</div>
              </button>
            </div>
          )}
        </div>
      )}

      {isMeditating && (
        /* Subtle progress text while running */
        <div style={{
          marginBottom: 24, fontSize: 13, color: theme.textSecondary,
          fontWeight: 600, ...fontBody,
        }}>
          {Math.round(progress * 100)}% complete · {meditationDuration} min session
        </div>
      )}

      {/* ── Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>

        {/* Reset */}
        <button
          onClick={handleReset}
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: theme.bg,
            boxShadow: theme.shadowRaisedSm,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: theme.textSecondary,
          }}
        >
          <RotateCcw size={18} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={() => setIsMeditating(r => !r)}
          style={{
            width: 76, height: 76, borderRadius: '50%',
            background: isMeditating ? theme.bg : theme.accent,
            boxShadow: isMeditating
              ? theme.shadowInset
              : `0 6px 20px ${theme.accent}70, 0 2px 6px ${theme.accent}50`,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isMeditating ? theme.accent : '#fff',
            transition: 'all 0.25s',
          }}
        >
          {isMeditating
            ? <Pause size={30} />
            : <Play size={30} style={{ marginLeft: 4 }} />}
        </button>

        {/* Bell (accent inset) */}
        <button
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: theme.bg,
            boxShadow: theme.shadowInset,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: theme.accent,
          }}
        >
          <Bell size={18} />
        </button>

      </div>
    </div>
  );
}
