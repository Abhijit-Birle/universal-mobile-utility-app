import React from 'react';
import { motion } from 'framer-motion';

export default function OrbitNodes() {
  const satellites = [
    { id: 1, angle: 0, radius: 90, size: 10, duration: 15 },
    { id: 2, angle: 90, radius: 130, size: 14, duration: 20 },
    { id: 3, angle: 180, radius: 170, size: 8, duration: 25 },
    { id: 4, angle: 270, radius: 100, size: 12, duration: 18 },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      
      {/* Central Node */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          backgroundColor: '#5A9DF8',
          boxShadow: '0 0 40px rgba(90, 157, 248, 0.6)',
          zIndex: 10
        }}
      />

      {/* Orbiting Nodes */}
      {satellites.map((sat) => (
        <motion.div
          key={sat.id}
          initial={{ rotate: sat.angle }}
          animate={{ rotate: sat.angle + 360 }}
          transition={{ duration: sat.duration, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            width: sat.radius * 2,
            height: sat.radius * 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2 + sat.id, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: sat.size,
              height: sat.size,
              borderRadius: '50%',
              backgroundColor: '#9ca3af',
              boxShadow: '0 0 15px rgba(156, 163, 175, 0.5)',
              marginLeft: -sat.size / 2
            }}
          />
        </motion.div>
      ))}

    </div>
  );
}
