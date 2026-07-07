import { useState } from 'react';
import TaskRow from '../components/tasks/TaskRow.jsx';
import TaskEditor from '../components/tasks/TaskEditor.jsx';
import Icon from '../components/ui/Icon.jsx';
import { TASK_DOMAINS } from '../constants/domains.js';
import '../styles/tasks.css';

const VIEWS = [
  { id: 'all',     label: 'All' },
  { id: 'today',   label: 'Today' },
  { id: 'week',    label: 'Week' },
  { id: 'someday', label: 'Someday' },
];

const SORTS = [
  { id: 'createdAt', label: 'Recent' },
  { id: 'dueDate',   label: 'Due date' },
  { id: 'priority',  label: 'Priority' },
];

export default function TasksTab({
  tasks,
  expenses,
  onAdd,
  onUpdate,
  onDelete,
  onToggle,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  getFilteredSortedTasks,
  onStartTimer,
}) {
  const [editingTask, setEditingTask] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [view, setView]     = useState('all');
  const [domain, setDomain] = useState('all');
  const [status, setStatus] = useState('open');
  const [sortBy, setSortBy] = useState('createdAt');

  const filtered = getFilteredSortedTasks({ domain, status, view }, sortBy);

  const handleAdd = () => { setEditingTask({}); setShowEditor(true); };
  const handleEdit = (task) => { setEditingTask(task); setShowEditor(true); };
  const handleClose = () => { setShowEditor(false); setEditingTask(null); };

  const handleSave = (taskData) => {
    if (!taskData.id) onAdd(taskData);
    else onUpdate(taskData.id, taskData);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div className="scroll-content">
        {/* Header row */}
        <div className="tasks-page-header">
          <h1 className="tasks-page-title">Tasks</h1>
        </div>

        {/* View segmented */}
        <div className="segmented">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className={`neu-pill${view === v.id ? ' active' : ''}`}
              onClick={() => setView(v.id)}
              aria-pressed={view === v.id}
              id={`view-seg-${v.id}`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Domain filter pills */}
        <div className="filter-strip" role="group" aria-label="Filter by domain">
          <button
            className={`neu-pill${domain === 'all' ? ' active' : ''}`}
            onClick={() => setDomain('all')}
            id="filter-domain-all"
          >
            All
          </button>
          {Object.entries(TASK_DOMAINS).map(([key, d]) => (
            <button
              key={key}
              className={`neu-pill${domain === key ? ' active' : ''}`}
              onClick={() => setDomain(domain === key ? 'all' : key)}
              id={`filter-domain-${key}`}
            >
              <div className="dot" style={{ background: d.color }} />
              {d.label}
            </button>
          ))}
        </div>

        {/* Sort + status */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {SORTS.map((s) => (
            <button
              key={s.id}
              className={`neu-pill${sortBy === s.id ? ' active' : ''}`}
              onClick={() => setSortBy(s.id)}
              id={`sort-${s.id}`}
              style={{ minHeight: 0 }}
            >
              {s.label}
            </button>
          ))}
          <button
            className={`neu-pill${status === 'open' ? ' active' : ''}`}
            onClick={() => setStatus(status === 'open' ? 'all' : 'open')}
            id="filter-status"
            style={{ minHeight: 0, marginLeft: 'auto' }}
          >
            Open only
          </button>
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✓</div>
            <p className="empty-state-title">Nothing here</p>
            <p className="empty-state-sub">Tap + to add a task</p>
          </div>
        ) : (
          <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={onToggle}
                onEdit={handleEdit}
                onStartTimer={onStartTimer}
              />
            ))}
          </div>
        )}
      </div>

      {showEditor && editingTask !== null && (
        <TaskEditor
          task={editingTask.id ? editingTask : null}
          expenses={expenses}
          onSave={handleSave}
          onDelete={onDelete}
          onClose={handleClose}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onDeleteSubtask={onDeleteSubtask}
        />
      )}
    </div>
  );
}
