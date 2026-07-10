import React from 'react';

export default function LiquidWave({ progress, color, backgroundColor, size = 108 }) {
  // progress: 0 = empty (bottom), 1 = full (top)
  // topPercent: 100% = at bottom (not visible), 0% = full
  // map progress to go slightly above 0% to account for the wave mask cutting into the top
  const topPercent = 100 - (progress * 110);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        pointerEvents: 'none',
        boxShadow: `inset 0 0 10px rgba(0,0,0,0.3)`
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          left: '-50%',
          top: `${topPercent}%`,
          background: color,
          transition: 'top 1.1s linear, background 1s linear',
          opacity: 0.85
        }}
      >
        <style>{`
          @keyframes liquidSpin {
            0%   { transform: translateX(-50%) rotate(0deg); }
            100% { transform: translateX(-50%) rotate(360deg); }
          }
          .liquid-wave-mask1 {
            position: absolute; width: 100%; height: 100%;
            top: -95%; left: 50%;
            background: ${backgroundColor};
            border-radius: 40%;
            animation: liquidSpin 5s infinite linear;
          }
          .liquid-wave-mask2 {
            position: absolute; width: 100%; height: 100%;
            top: -95%; left: 50%;
            background: ${backgroundColor};
            border-radius: 45%; opacity: 0.5;
            animation: liquidSpin 7s infinite linear;
          }
        `}</style>
        <div className="liquid-wave-mask1" />
        <div className="liquid-wave-mask2" />
      </div>
    </div>
  );
}
