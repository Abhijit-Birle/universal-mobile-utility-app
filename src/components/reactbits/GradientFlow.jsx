import React from 'react';
import { motion } from 'framer-motion';

export default function GradientFlow() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#1e1b3a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          top: '-50%',
          left: '-50%'
        }}
      >
        <svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="flow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b3a" />
              <stop offset="30%" stopColor="#7c3dff" />
              <stop offset="70%" stopColor="#ff2d95" />
              <stop offset="100%" stopColor="#2dd4ff" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#flow)" />
        </svg>
      </motion.div>
    </div>
  );
}
