import { useState, useRef } from 'react';
import Icon from '../ui/Icon.jsx';
import { TASK_DOMAINS, TASK_PRIORITIES } from '../../constants/domains.js';
import '../../styles/tasks.css';

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const today = new Date();
  const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff < 7) return `${diff}d`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 0);
  return d < new Date();
}

export default function TaskRow({ task, onToggle, onEdit, onStartTimer }) {
  const domain = TASK_DOMAINS[task.domain] || TASK_DOMAINS.personal;
  const done = task.status === 'done';
  const doneCount = (task.subtasks || []).filter((s) => s.done).length;
  const totalCount = (task.subtasks || []).length;
  const dueDateLabel = formatDate(task.dueDate);
  const overdue = !done && isOverdue(task.dueDate);

  const [swipeOffset, setSwipeOffset] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggle(task.id);
  };

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    if (diff > 0 && diff < 100) { // swipe right to complete
      setSwipeOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 60) {
      onToggle(task.id);
    }
    setSwipeOffset(0);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, marginBottom: 8 }}>
      {/* Background showing check icon on swipe */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, 
        background: 'var(--accent-primary)', 
        display: 'flex', alignItems: 'center', paddingLeft: 24, color: 'white',
        opacity: swipeOffset / 60
      }}>
        <Icon name="check" size={24} />
      </div>

      <div
        className={done ? "neu-inset" : "neu-card"}
        onClick={() => onEdit(task)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          transform: `translateX(${swipeOffset}px)`, 
          transition: swipeOffset === 0 ? 'transform 0.2s' : 'none',
          padding: 16,
          display: 'flex', alignItems: 'center', gap: 12,
          position: 'relative', zIndex: 1
        }}
        role="listitem"
        aria-label={`Task: ${task.title}`}
      >
        <button
          onClick={handleCheckboxClick}
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
          aria-pressed={done}
          id={`checkbox-${task.id}`}
          style={{ 
            flexShrink: 0, width: 24, height: 24, borderRadius: 6, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            background: done ? 'var(--accent-primary)' : 'var(--bg-app)',
            boxShadow: done ? 'var(--shadow-inset)' : 'var(--shadow-raised-sm)',
            transition: 'all 0.2s'
          }}
        >
          {done && <Icon name="check" size={14} color="white" />}
        </button>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{ width: 6, height: 6, borderRadius: '50%', background: domain.color }}
              aria-label={`Domain: ${domain.label}`}
            />
            <span style={{ 
              fontSize: 15, color: done ? 'var(--text-secondary)' : 'var(--text-primary)',
              textDecoration: done ? 'line-through' : 'none'
            }}>
              {task.title || 'Untitled'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
            {dueDateLabel && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: overdue ? 'var(--accent-secondary)' : undefined }}>
                <Icon name="calendar" size={12} />
                {dueDateLabel}
              </span>
            )}
            {totalCount > 0 && (
              <span>{doneCount}/{totalCount}</span>
            )}
            {task.recurring && (
              <Icon name="repeat" size={12} />
            )}
            {task.estimatedMinutes > 0 && onStartTimer && (
              <button
                onClick={(e) => { e.stopPropagation(); onStartTimer(task); }}
                style={{ 
                  cursor: 'pointer', background: 'transparent', padding: 0, border: 'none', 
                  display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' 
                }}
                title="Start focus timer"
              >
                <Icon name="play" size={12} />
                {task.estimatedMinutes}m
              </button>
            )}
            {task.linkedExpenseId && (
              <Icon name="link" size={12} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
