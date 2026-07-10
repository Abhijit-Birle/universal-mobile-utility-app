import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const CARD_WIDTH = 220;
const CARD_HEIGHT = 340;
const CENTER_X = CARD_WIDTH / 2;
const CENTER_Y = CARD_HEIGHT / 2;

const generatePositions = () => {
  const positions = [];
  const particleCount = 28; 
  const baseRadius = 60;
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * (Math.PI * 2);
    const startX = CENTER_X + Math.cos(angle) * (baseRadius + Math.random() * 20);
    const startY = CENTER_Y + Math.sin(angle) * (baseRadius + Math.random() * 20);
    const endX = CENTER_X + Math.cos(angle) * (5 + Math.random() * 10);
    const endY = CENTER_Y + Math.sin(angle) * (5 + Math.random() * 10);
    positions.push({ startX, startY, endX, endY });
  }
  return positions;
};

export default function MagneticAttraction() {
  const particlesConfig = useMemo(() => {
    return generatePositions().map((pos, i) => ({
      id: i,
      delay: Math.random() * 2.5,
      duration: 1.8 + Math.random() * 0.8,
      size: 4 + Math.random() * 5,
      color: ['#2dd4ff', '#ff2d95', '#7c3dff'][Math.floor(Math.random() * 3)],
      ...pos
    }));
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#1e1b3a' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 12, height: 12, backgroundColor: '#ffffff', borderRadius: 6, opacity: 0.8 }} />
      </div>
      {particlesConfig.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: p.startX, y: p.startY, opacity: 0.3 }}
          animate={{
            x: [p.startX, p.endX],
            y: [p.startY, p.endY],
            opacity: [0.3, 0.8, 0]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            times: [0, 0.8, 1]
          }}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: p.size, height: p.size,
            backgroundColor: p.color,
            borderRadius: p.size / 2
          }}
        />
      ))}
    </div>
  );
}
