import Icon from '../ui/Icon.jsx';
import '../../styles/tasks.css';

/**
 * Inline subtask checklist rendered inside the task editor.
 * Each item: circle checkbox + label + delete button.
 */
export default function SubtaskList({ subtasks, taskId, onToggle, onDelete }) {
  if (!subtasks || subtasks.length === 0) return null;

  return (
    <div className="subtask-list" role="list">
      {subtasks.map((st) => (
        <div key={st.id} className="subtask-item" role="listitem">
          <button
            className={`subtask-checkbox${st.done ? ' done' : ''}`}
            onClick={() => onToggle(taskId, st.id)}
            aria-label={st.done ? 'Mark subtask incomplete' : 'Mark subtask complete'}
            aria-pressed={st.done}
            id={`subtask-check-${st.id}`}
          >
            {st.done && <Icon name="check" size={8} color="white" />}
          </button>
          <span className={`subtask-label${st.done ? ' done' : ''}`}>{st.title}</span>
          <button
            className="btn-icon"
            onClick={() => onDelete(taskId, st.id)}
            aria-label={`Delete subtask: ${st.title}`}
            id={`subtask-delete-${st.id}`}
            style={{ width: 32, height: 32, minHeight: 0, minWidth: 0 }}
          >
            <Icon name="x" size={14} color="var(--text-muted)" />
          </button>
        </div>
      ))}
    </div>
  );
}
