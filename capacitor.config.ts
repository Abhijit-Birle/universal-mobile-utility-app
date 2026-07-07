import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.konto.personal',
  appName: 'Konto',
  webDir: 'dist',
  plugins: {
    Preferences: {
      group: 'LedgerStorage',
    },
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
