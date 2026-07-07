// ─── Design token constants ───────────────────────────────────────────────────
// Mirror of the CSS custom properties — for use in JS/JSX where inline styles
// or dynamic canvas drawing need the actual color values.

export const COLORS = {
  bgApp: '#1C1F26',
  textPrimary: '#ECE7DD',
  textSecondary: '#9498A4',
  textMuted: '#6B7280',
  dividerDark: '#26282F',
  dividerMid: '#33363F',
  spineDot: '#4A4E58',

  // Category accents
  accentStudy: '#5F7A5C',
  accentWork: '#6B5CA5',
  accentMoney: '#A6763F',
  accentFood: '#C97B4A',
  accentTransport: '#4F86A6',
  accentHealth: '#A6577A',
  accentRelocation: '#7A8471',
};

export const FONTS = {
  serif: "'Fraunces', Georgia, serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
};

export const UNDO_TIMEOUT_MS = 5000;
export const STORAGE_WARN_BYTES = 4 * 1024 * 1024; // 4 MB
