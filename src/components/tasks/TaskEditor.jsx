import { useState, useRef, useEffect } from 'react';
import Icon from '../ui/Icon.jsx';
import SubtaskList from './SubtaskList.jsx';
import { TASK_DOMAINS, TASK_PRIORITIES } from '../../constants/domains.js';
import '../../styles/tasks.css';

/**
 * Slide-up sheet for creating and editing tasks.
 * Handles: title, domain, priority, due date, estimated minutes,
 * subtasks, expense linking, and delete (with undo, no confirm dialog).
 */
export default function TaskEditor({
  task,
  expenses,
  onSave,
  onDelete,
  onClose,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onLinkExpense,
}) {
  const isNew = !task?.id;
  const [title, setTitle]   = useState(task?.title || '');
  const [domain, setDomain] = useState(task?.domain || 'personal');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [dueDate, setDueDate]   = useState(task?.dueDate || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(task?.estimatedMinutes || '');
  const [newSubtask, setNewSubtask] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    if (titleRef.current) {
      setTimeout(() => titleRef.current?.focus(), 200);
    }
  }, []);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...task,
      title: title.trim(),
      domain,
      priority,
      dueDate: dueDate || null,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    onAddSubtask(task.id, newSubtask.trim());
    setNewSubtask('');
  };

  // Overlay click closes
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="sheet-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={isNew ? 'New task' : 'Edit task'}>
      <div className="sheet">
        <div className="sheet-handle" />

        {/* Header */}
        <div className="sheet-header">
          <span className="sheet-title">{isNew ? 'New task' : 'Edit task'}</span>
          <div style={{ display: 'flex', gap: 0 }}>
            {!isNew && (
              <button className="btn-clay btn-clay-danger" onClick={handleDelete} id="btn-delete-task">
                Delete
              </button>
            )}
            <button className="btn-clay" onClick={onClose} id="btn-cancel-task">Cancel</button>
            <button
              className="btn-clay btn-clay-primary"
              onClick={handleSave}
              id="btn-save-task"
              disabled={!title.trim()}
            >
              Save
            </button>
          </div>
        </div>

        <div className="sheet-body">
          {/* Title */}
          <div className="field">
            <label className="field-label" htmlFor="task-title-input">Task</label>
            <input
              id="task-title-input"
              ref={titleRef}
              className="field-input"
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoComplete="off"
            />
          </div>

          {/* Domain */}
          <div className="field">
            <label className="field-label">Domain</label>
            <div className="domain-grid">
              {Object.entries(TASK_DOMAINS).map(([key, d]) => (
                <button
                  key={key}
                  className={`domain-chip${domain === key ? ' active' : ''}`}
                  onClick={() => setDomain(key)}
                  id={`domain-chip-${key}`}
                >
                  <div className="dot" style={{ background: d.color }} />
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="field">
            <label className="field-label">Priority</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Object.entries(TASK_PRIORITIES).map(([key, p]) => (
                <button
                  key={key}
                  className={`domain-chip${priority === key ? ' active' : ''}`}
                  onClick={() => setPriority(key)}
                  id={`priority-chip-${key}`}
                >
                  <div className="dot" style={{ background: p.color }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div className="field">
            <label className="field-label" htmlFor="task-due-date">Due date</label>
            <input
              id="task-due-date"
              className="field-input field-input-mono"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Estimated minutes */}
          <div className="field">
            <label className="field-label" htmlFor="task-est-minutes">Estimated (minutes)</label>
            <input
              id="task-est-minutes"
              className="field-input field-input-mono"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 30"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              min="1"
              max="999"
            />
          </div>

          {/* Subtasks — only for existing tasks */}
          {!isNew && (
            <div className="field">
              <label className="field-label">Subtasks</label>
              <SubtaskList
                subtasks={task.subtasks || []}
                taskId={task.id}
                onToggle={onToggleSubtask}
                onDelete={onDeleteSubtask}
              />
              {/* Add subtask inline */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  className="field-input"
                  type="text"
                  placeholder="Add subtask…"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  id="subtask-input"
                  style={{ flex: 1 }}
                />
                <button
                  className="btn-icon"
                  onClick={handleAddSubtask}
                  aria-label="Add subtask"
                  id="btn-add-subtask"
                  style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 8, background: 'var(--bg-surface)' }}
                >
                  <Icon name="plus" size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Linked expense — only for existing tasks */}
          {!isNew && task.linkedExpenseId && (
            <div className="field">
              <label className="field-label">Linked expense</label>
              {(() => {
                const exp = expenses?.find((e) => e.id === task.linkedExpenseId);
                return exp ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="link" size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {exp.note || exp.category}
                    </span>
                    <span className="amount-muted" style={{ marginLeft: 'auto' }}>
                      ₹{exp.amount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
