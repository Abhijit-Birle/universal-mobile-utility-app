import '../../styles/neumorphic.css';

import Icon from '../ui/Icon.jsx';

export default function TopBar({ title, theme, onThemeToggle, onSettingsOpen }) {
  return (
    <div className="neu-top-bar">
      <h1 className="neu-title">{title}</h1>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="neu-btn-circle"
          onClick={() => onThemeToggle(theme === 'light' ? 'dark' : 'light')}
          aria-label="Toggle theme"
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
        </button>
        <button
          className="neu-btn-circle"
          onClick={onSettingsOpen}
          aria-label="Open settings"
        >
          <Icon name="gear" size={18} />
        </button>
      </div>
    </div>
  );
}
