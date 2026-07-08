import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

// ponytail: strip audio from dist so Capacitor sync doesn't bundle 460MB of MP3s
const excludeAudioFromCapacitor = {
  name: 'exclude-audio',
  closeBundle() {
    const audioDir = resolve(__dirname, 'dist/audio');
    rmSync(audioDir, { recursive: true, force: true });
  },
};

export default defineConfig({
  plugins: [react(), excludeAudioFromCapacitor],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
});
