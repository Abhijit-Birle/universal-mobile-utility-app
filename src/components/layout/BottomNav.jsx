import Icon from '../ui/Icon.jsx';
import '../../styles/neumorphic.css';

export default function BottomNav({ activeTab, onTabChange, onAdd }) {
  return (
    <div className="neu-bottom-nav">
      <button
        className={`neu-nav-item ${activeTab === 'today' ? 'active' : ''}`}
        onClick={() => onTabChange('today')}
        aria-label="Home"
      >
        <Icon name="home" size={24} />
      </button>

      <button
        className={`neu-nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
        onClick={() => onTabChange('tasks')}
        aria-label="Tasks"
      >
        <Icon name="list" size={24} />
      </button>

      {/* Center FAB */}
      <button
        className="neu-nav-fab"
        onClick={onAdd}
        aria-label="Add"
      >
        <Icon name="plus" size={28} />
      </button>

      <button
        className={`neu-nav-item ${activeTab === 'money' ? 'active' : ''}`}
        onClick={() => onTabChange('money')}
        aria-label="Money"
      >
        <Icon name="coin" size={24} />
      </button>

      <button
        className={`neu-nav-item ${activeTab === 'insights' ? 'active' : ''}`}
        onClick={() => onTabChange('insights')}
        aria-label="Insights"
      >
        <Icon name="chart" size={24} />
      </button>
    </div>
  );
}
