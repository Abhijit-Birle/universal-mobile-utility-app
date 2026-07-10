import React from 'react';
import { motion } from 'framer-motion';

const STAGGER = 0.4;

const FractalLayer = ({ delay, duration, color }) => {
  const path = "M50,0 60,35 95,45 60,55 50,90 40,55 5,45 40,35 Z";

  return (
    <motion.div
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{
        scale: [0.2, 1.6],
        opacity: [0, 0, 0.7, 0.7, 0, 0]
      }}
      transition={{
        duration: 1.6,
        delay: delay,
        repeat: Infinity,
        ease: [0.42, 0, 0.58, 1],
        times: [0, 0.14, 0.15, 0.71, 0.72, 1]
      }}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <svg width="180" height="180" viewBox="0 0 100 100">
        <path d={path} fill={color} />
      </svg>
    </motion.div>
  );
};

export default function FractalExpansion() {
  const layers = [
    { delay: 0, duration: 0.8, color: '#7c3dff' },
    { delay: STAGGER, duration: 0.8, color: '#ff2d95' },
    { delay: 2 * STAGGER, duration: 0.8, color: '#2dd4ff' },
    { delay: 3 * STAGGER, duration: 0.8, color: '#ff2d95' },
    { delay: 4 * STAGGER, duration: 0.8, color: '#7c3dff' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#1e1b3a' }}>
      {layers.map((l, i) => <FractalLayer key={i} {...l} />)}
    </div>
  );
}
