import '../../styles/layout.css';

const TABS = [
  { id: 'today',    label: 'Today' },
  { id: 'tasks',    label: 'Tasks' },
  { id: 'money',    label: 'Money' },
  { id: 'insights', label: 'Insights' },
  { id: 'routine',  label: 'Routine' },
];

/**
 * Top tab bar with theme toggle (sun/moon) and settings gear.
 */
export default function TabBar({ activeTab, onTabChange, onSettingsOpen, theme, onThemeToggle }) {
  return (
    <div className="tabbar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          className={`tab-item${activeTab === tab.id ? ' active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
        >
          {tab.label}
        </button>
      ))}

      <div className="tabbar-right">
        {/* Light / Dark toggle */}
        <div className="theme-toggle" role="group" aria-label="Toggle theme">
          <button
            className={`theme-toggle-option${theme === 'light' ? ' active' : ''}`}
            onClick={() => onThemeToggle('light')}
            aria-label="Light mode"
            id="btn-theme-light"
          >
            ☀️
          </button>
          <button
            className={`theme-toggle-option${theme === 'dark' ? ' active' : ''}`}
            onClick={() => onThemeToggle('dark')}
            aria-label="Dark mode"
            id="btn-theme-dark"
          >
            🌙
          </button>
        </div>

        {/* Settings */}
        <button
          className="btn-icon"
          onClick={onSettingsOpen}
          aria-label="Open settings"
          id="btn-settings"
          style={{ width: 36, height: 36, borderRadius: 10, minHeight: 0, minWidth: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
