import React from 'react';
import { motion } from 'framer-motion';

const OrbitRing = ({ radius, duration, size, color, reverse }) => {
  return (
    <motion.div
      animate={{ rotate: [0, reverse ? -360 : 360] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div style={{ transform: `translateX(${radius}px)` }}>
        <div style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2, boxShadow: `0 0 10px ${color}` }} />
      </div>
    </motion.div>
  );
};

export default function OrbitingDots() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#1e1b3a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 2, height: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 16, height: 16, backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 0 20px rgba(255,255,255,0.8)', zIndex: 10 }} />
        <OrbitRing radius={40} duration={2} size={8} color="#2dd4ff" reverse={false} />
        <OrbitRing radius={70} duration={3.5} size={12} color="#ff2d95" reverse={true} />
        <OrbitRing radius={100} duration={5} size={6} color="#7c3dff" reverse={false} />
      </div>
    </div>
  );
}
