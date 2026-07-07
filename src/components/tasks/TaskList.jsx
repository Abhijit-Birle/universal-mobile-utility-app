import { useState } from 'react';
import TaskRow from './TaskRow.jsx';
import Icon from '../ui/Icon.jsx';
import { TASK_DOMAINS } from '../../constants/domains.js';
import '../../styles/tasks.css';

const VIEWS = [
  { id: 'all',   label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'week',  label: 'This week' },
  { id: 'someday', label: 'Someday' },
];

const SORTS = [
  { id: 'createdAt', label: 'Recent' },
  { id: 'dueDate',   label: 'Due date' },
  { id: 'priority',  label: 'Priority' },
];

/**
 * Full task list with filters (domain, status), sort control, and view toggle.
 */
export default function TaskList({ tasks, onToggle, onEdit, onAdd, getFilteredSortedTasks }) {
  const [view, setView]     = useState('all');
  const [domain, setDomain] = useState('all');
  const [status, setStatus] = useState('open');
  const [sortBy, setSortBy] = useState('createdAt');

  const filtered = getFilteredSortedTasks(
    { domain, status, view },
    sortBy
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="tasks-header">
        <h1 className="tasks-title">Tasks</h1>
        <button className="btn-icon" onClick={onAdd} aria-label="Add new task" id="btn-add-task">
          <Icon name="plus" size={20} />
        </button>
      </div>

      {/* View segmented control */}
      <div className="view-seg">
        <div className="segmented" role="group" aria-label="Task view">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className={`seg-option${view === v.id ? ' active' : ''}`}
              onClick={() => setView(v.id)}
              aria-pressed={view === v.id}
              id={`view-seg-${v.id}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter strip: domain pills */}
      <div className="filter-strip" role="group" aria-label="Filter by domain">
        <button
          className={`pill${domain === 'all' ? ' active' : ''}`}
          onClick={() => setDomain('all')}
          id="filter-domain-all"
        >
          All
        </button>
        {Object.entries(TASK_DOMAINS).map(([key, d]) => (
          <button
            key={key}
            className={`pill${domain === key ? ' active' : ''}`}
            onClick={() => setDomain(domain === key ? 'all' : key)}
            id={`filter-domain-${key}`}
          >
            <div className="dot" style={{ background: d.color }} />
            {d.label}
          </button>
        ))}
      </div>

      {/* Sort row */}
      <div className="sort-row">
        <span className="sort-label">Sort</span>
        {SORTS.map((s) => (
          <button
            key={s.id}
            className={`pill${sortBy === s.id ? ' active' : ''}`}
            onClick={() => setSortBy(s.id)}
            id={`sort-${s.id}`}
            style={{ minHeight: 0 }}
          >
            {s.label}
          </button>
        ))}
        {/* Status toggle */}
        <button
          className={`pill${status === 'open' ? ' active' : ''}`}
          onClick={() => setStatus(status === 'open' ? 'all' : 'open')}
          id="filter-status-open"
          style={{ marginLeft: 'auto' }}
        >
          Open only
        </button>
      </div>

      {/* List */}
      <div className="scroll-content" role="list" aria-label="Task list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✓</div>
            <p className="empty-state-title">Nothing here</p>
            <p className="empty-state-sub">Tap + to add a task</p>
          </div>
        ) : (
          filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}
