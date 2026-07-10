import React from 'react';
import { motion } from 'framer-motion';

export default function RisingBubbles() {
  const bubbles = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 4 + 4,
  }));

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#13192b' }}>
      
      {/* Wave Background */}
      <svg
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '45%',
          zIndex: 1
        }}
      >
        <path
          d="M0,80 C100,120 200,20 400,80 L400,200 L0,200 Z"
          fill="#2a8baf"
        />
      </svg>

      {/* Rising Bubbles */}
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          initial={{ y: 300, opacity: 0.2 }}
          animate={{ y: -50, opacity: [0, 0.6, 0] }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "linear",
          }}
          style={{
            position: 'absolute',
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            zIndex: 2,
          }}
        />
      ))}
    </div>
  );
}
