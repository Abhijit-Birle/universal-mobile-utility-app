import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function FallingParticles() {
  const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 3,
    duration: 2.5 + Math.random() * 2,
    startX: Math.random() * 100, // percentage for width
    size: 4 + Math.random() * 6,
    color: ['#2dd4ff', '#ff2d95', '#7c3dff'][Math.floor(Math.random() * 3)]
  })), []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#1e1b3a' }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: 0, opacity: 1 }}
          animate={{
            y: [-20, 400],
            x: [0, 15, -15],
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.8, 1] // match opacity fade out
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.startX}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '50%'
          }}
        />
      ))}
    </div>
  );
}
