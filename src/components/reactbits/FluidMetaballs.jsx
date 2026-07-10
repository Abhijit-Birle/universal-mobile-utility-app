import React from 'react';
import { motion } from 'framer-motion';

export default function FluidMetaballs() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#1e1b3a' }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox="0 0 220 340">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3dff" />
            <stop offset="100%" stopColor="#ff2d95" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2dd4ff" />
            <stop offset="100%" stopColor="#7c3dff" />
          </linearGradient>
        </defs>
        <motion.circle
          fill="url(#grad2)"
          animate={{
            cx: [140, 80, 140],
            cy: [185, 155, 185],
            r: [60, 40, 60]
          }}
          transition={{ duration: 3.7, ease: [0.42, 0, 0.58, 1], repeat: Infinity }}
        />
        <motion.circle
          fill="url(#grad1)"
          animate={{
            cx: [90, 130, 90],
            cy: [155, 185, 155],
            r: [50, 70, 50]
          }}
          transition={{ duration: 3.1, ease: [0.42, 0, 0.58, 1], repeat: Infinity }}
        />
      </svg>
    </div>
  );
}
