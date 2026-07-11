import { useState, useMemo, useEffect, useRef } from 'react';
import Icon from '../components/ui/Icon.jsx';
import TaskEditor from '../components/todos/TaskEditor.jsx';
import { useTodos, generateId } from '../hooks/useTodos.js';
import { getLocalDateString } from '../utils/date.js';
import DatePicker from '../components/ui/DatePicker.jsx';
import TimePicker from '../components/ui/TimePicker.jsx';
import ReminderPicker from '../components/ui/ReminderPicker.jsx';
import { parseTask, PRIORITY_CONFIG } from '../utils/nlp.js';

export default function TodoTab({ theme, NeoSurface, NeoInput, PrimaryButton, SectionLabel, fontDisplay, fontBody }) {
  const {
    todos, lists, loading,
    addTodo, updateTodo, toggleDone, deleteTodo, addList, deleteList
  } = useTodos();

  const [currentList, setCurrentList] = useState('myday');
  const [editorTask, setEditorTask] = useState(null);
  const [quickAddText, setQuickAddText] = useState('');
  const [showQuickAddExtras, setShowQuickAddExtras] = useState(false);
  const [quickAddDue, setQuickAddDue] = useState('');
  const [quickAddDueTime, setQuickAddDueTime] = useState('');
  const [quickAddReminder, setQuickAddReminder] = useState('');
  const [quickAddSubtasks, setQuickAddSubtasks] = useState([]);
  const [quickAddPriority, setQuickAddPriority] = useState(4);

  const quickAddRef = useRef(null);

  useEffect(() => {
    if (!showQuickAddExtras) return;
    const handleClickOutside = (e) => {
      if (quickAddRef.current && !quickAddRef.current.contains(e.target)) {
        setShowQuickAddExtras(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showQuickAddExtras]);

  const todayStr = getLocalDateString();

  // Live NLP parse as user types
  const nlpPreview = useMemo(() => {
    if (!quickAddText.trim()) return null;
    const parsed = parseTask(quickAddText);
    const changed = parsed.due !== null || parsed.dueTime !== null || parsed.priority < 4;
    return changed ? parsed : null;
  }, [quickAddText]);

  const smartLists = [
    { id: 'myday', name: 'My Day', icon: 'sun', color: '#ffb648' },
    { id: 'important', name: 'Important', icon: 'star', color: '#ff6b6b' },
    { id: 'planned', name: 'Planned', icon: 'calendar', color: theme.accent2 },
    { id: 'tasks', name: 'Tasks', icon: 'home', color: theme.accent }
  ];

  const allLists = [...smartLists, ...lists.filter(l => l.id !== 'default')];
  const activeListMeta = allLists.find(l => l.id === currentList) || smartLists[3];

  const filteredTodos = useMemo(() => {
    return todos.filter(t => {
      if (currentList === 'myday') return t.myDayDate === todayStr;
      if (currentList === 'important') return t.important;
      if (currentList === 'planned') return !!t.due;
      if (currentList === 'tasks') return t.listId === 'default';
      return t.listId === currentList;
    });
  }, [todos, currentList, todayStr]);

  // Sort by priority (P1 first), then creation order
  const incompleteTasks = useMemo(() =>
    filteredTodos
      .filter(t => !t.done)
      .sort((a, b) => (a.priority ?? 4) - (b.priority ?? 4)),
    [filteredTodos]
  );
  const completedTasks = filteredTodos.filter(t => t.done);

  const handleQuickAdd = () => {
    const raw = quickAddText.trim();
    if (!raw) return;

    // Parse NLP from text
    const parsed = parseTask(raw);

    const newTask = {
      text: parsed.text || raw,
      due: parsed.due || quickAddDue || null,
      dueTime: parsed.dueTime || quickAddDueTime || null,
      reminder: quickAddReminder || null,
      priority: parsed.priority < 4 ? parsed.priority : quickAddPriority,
      subtasks: quickAddSubtasks.filter(s => s.text.trim().length > 0).map(s => ({ ...s, subtasks: [] }))
    };

    if (currentList === 'myday') { newTask.myDayDate = todayStr; newTask.listId = 'default'; }
    else if (currentList === 'important') { newTask.important = true; newTask.listId = 'default'; }
    else if (currentList === 'planned') { newTask.due = newTask.due || todayStr; newTask.listId = 'default'; }
    else if (currentList === 'tasks') { newTask.listId = 'default'; }
    else { newTask.listId = currentList; }

    addTodo(newTask);
    setQuickAddText('');
    setQuickAddDue('');
    setQuickAddDueTime('');
    setQuickAddReminder('');
    setQuickAddSubtasks([]);
    setQuickAddPriority(4);
    setShowQuickAddExtras(false);
  };

  const handleAddCustomList = () => {
    const name = prompt('Enter list name:');
    if (name && name.trim()) addList(name.trim());
  };

  if (loading) {
    return <div style={{ padding: 20, color: theme.textSecondary, ...fontBody }}>Loading tasks...</div>;
  }

  const renderTask = (t) => {
    const p = t.priority ?? 4;
    const pCfg = PRIORITY_CONFIG[p];
    const totalSubtasks = (t.subtasks || []).reduce((sum, s) => sum + 1 + (s.subtasks?.length || 0), 0);
    const doneSubtasks = (t.subtasks || []).reduce((sum, s) => sum + (s.done ? 1 : 0) + (s.subtasks?.filter(ss => ss.done).length || 0), 0);

    return (
      <NeoSurface
        key={t.id}
        style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 16, borderLeft: p < 4 ? `3px solid ${pCfg.color}` : '3px solid transparent' }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); toggleDone(t.id); }}
          style={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
            border: t.done ? 'none' : `2px solid ${p < 4 ? pCfg.color : theme.textSecondary}`,
            background: t.done ? theme.accent : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0
          }}
        >
          {t.done && <Icon name="check" size={16} color="#fff" />}
        </button>

        <div onClick={() => setEditorTask(t)} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {p < 4 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: pCfg.color, background: pCfg.bg, padding: '1px 5px', borderRadius: 6, ...fontBody }}>
                {pCfg.label}
              </span>
            )}
            <span style={{
              fontSize: 15,
              color: t.done ? theme.textSecondary : theme.textPrimary,
              textDecoration: t.done ? 'line-through' : 'none',
              ...fontBody,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {t.text}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {t.listId !== 'default' && currentList !== t.listId && (
              <span style={{ fontSize: 11, color: theme.textSecondary, ...fontBody }}>
                {lists.find(l => l.id === t.listId)?.name || 'Tasks'}
              </span>
            )}
            {t.myDayDate === todayStr && currentList !== 'myday' && (
              <span style={{ fontSize: 11, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 3, ...fontBody }}>
                <Icon name="sun" size={10} color="#ffb648" /> My Day
              </span>
            )}
            {(t.due || t.dueTime) && (
              <span style={{ fontSize: 11, color: t.due && t.due < todayStr && !t.done ? '#ef4444' : theme.accent2, display: 'flex', alignItems: 'center', gap: 3, ...fontBody }}>
                <Icon name="calendar" size={10} />
                {t.due ? (t.due === todayStr ? 'Today' : t.due) : ''}
                {t.due && t.dueTime ? ' · ' : ''}
                {t.dueTime || ''}
              </span>
            )}
            {t.reminder && (
              <span style={{ fontSize: 11, color: theme.accent, display: 'flex', alignItems: 'center', gap: 3, ...fontBody }}>
                <Icon name="bell" size={10} />
              </span>
            )}
            {totalSubtasks > 0 && (
              <span style={{ fontSize: 11, color: doneSubtasks === totalSubtasks ? theme.accent : theme.textSecondary, display: 'flex', alignItems: 'center', gap: 3, ...fontBody }}>
                <Icon name="git-commit" size={10} /> {doneSubtasks}/{totalSubtasks}
              </span>
            )}
            {t.note && <Icon name="file-text" size={10} color={theme.textSecondary} />}
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); updateTodo(t.id, { important: !t.important }); }}
          style={{ background: 'none', border: 'none', color: t.important ? theme.accent : theme.textSecondary, cursor: 'pointer', padding: 4 }}
        >
          <Icon name={t.important ? "star-fill" : "star"} size={20} />
        </button>
      </NeoSurface>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

      {/* Horizontal List Nav */}
      <div style={{ padding: '24px 18px 12px', display: 'flex', gap: 12, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {allLists.map(list => {
          const isActive = currentList === list.id;
          return (
            <button
              key={list.id}
              onClick={() => setCurrentList(list.id)}
              style={{
                flexShrink: 0,
                background: isActive ? theme.accent : theme.bg,
                color: isActive ? '#fff' : theme.textSecondary,
                boxShadow: isActive ? 'none' : theme.shadowRaisedSm,
                border: 'none', borderRadius: 20,
                padding: '8px 16px',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', ...fontBody
              }}
            >
              <Icon name={list.icon} size={14} color={isActive ? '#fff' : (list.color || theme.textSecondary)} />
              {list.name}
            </button>
          );
        })}
        <button
          onClick={handleAddCustomList}
          style={{
            flexShrink: 0, background: 'transparent', color: theme.accent,
            border: `2px dashed ${theme.border}`, borderRadius: 20,
            padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', ...fontBody
          }}
        >
          <Icon name="plus" size={14} /> New List
        </button>
      </div>

      {/* Main Content */}
      <div className="scroll-content" style={{ padding: '12px 18px 160px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {incompleteTasks.map(renderTask)}

          {completedTasks.length > 0 && (
            <>
              <div style={{ marginTop: 16, marginBottom: 8 }}>
                <SectionLabel label={`Completed (${completedTasks.length})`} />
              </div>
              {completedTasks.map(renderTask)}
            </>
          )}

          {filteredTodos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: theme.textSecondary, ...fontBody }}>
              <Icon name="check-circle" size={48} color={theme.border} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Nothing to do here!</p>
              <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>Add a task below to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Bar */}
      <div ref={quickAddRef} style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 10 }}>
        <div style={{ width: '100%', height: 32, background: `linear-gradient(to top, ${theme.bg}, transparent)` }} />
        <div style={{ background: theme.bg, padding: '0 18px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* NLP Preview Chips */}
          {nlpPreview && quickAddText.trim() && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 4 }}>
              <span style={{ fontSize: 11, color: theme.textSecondary, ...fontBody }}>Detected:</span>
              {nlpPreview.due && (
                <span style={{ fontSize: 11, color: theme.accent2, background: `${theme.accent2}20`, padding: '2px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, ...fontBody }}>
                  <Icon name="calendar" size={10} /> {nlpPreview.due === todayStr ? 'Today' : nlpPreview.due}
                </span>
              )}
              {nlpPreview.dueTime && (
                <span style={{ fontSize: 11, color: theme.accent, background: `${theme.accent}20`, padding: '2px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, ...fontBody }}>
                  <Icon name="clock" size={10} /> {nlpPreview.dueTime}
                </span>
              )}
              {nlpPreview.priority < 4 && (
                <span style={{ fontSize: 11, color: PRIORITY_CONFIG[nlpPreview.priority].color, background: PRIORITY_CONFIG[nlpPreview.priority].bg, padding: '2px 8px', borderRadius: 8, fontWeight: 700, ...fontBody }}>
                  {PRIORITY_CONFIG[nlpPreview.priority].label}
                </span>
              )}
            </div>
          )}

          {showQuickAddExtras && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Priority quick select */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4].map(p => {
                  const cfg = PRIORITY_CONFIG[p];
                  const isActive = quickAddPriority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setQuickAddPriority(p)}
                      style={{
                        flex: 1, padding: '6px 4px', borderRadius: 10,
                        border: `2px solid ${isActive ? (cfg.color || theme.border) : 'transparent'}`,
                        background: isActive ? (cfg.bg || theme.pressed) : theme.bg,
                        color: isActive ? (cfg.color || theme.textPrimary) : theme.textSecondary,
                        fontWeight: isActive ? 700 : 500, fontSize: 12,
                        cursor: 'pointer', boxShadow: isActive ? 'none' : theme.shadowRaisedSm,
                        transition: 'all 0.15s', ...fontBody
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <NeoSurface pressed style={{ flex: 1, padding: '10px 14px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DatePicker value={quickAddDue} onChange={setQuickAddDue} theme={theme} fontBody={fontBody} placeholder="Due date" />
                </NeoSurface>
                <NeoSurface pressed style={{ flex: 1, padding: '10px 14px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TimePicker value={quickAddDueTime} onChange={setQuickAddDueTime} theme={theme} fontBody={fontBody} placeholder="Due time" />
                </NeoSurface>
              </div>

              <NeoSurface pressed style={{ padding: '10px 14px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ReminderPicker value={quickAddReminder} onChange={setQuickAddReminder} theme={theme} fontBody={fontBody} placeholder="Set reminder" />
              </NeoSurface>

              {quickAddSubtasks.map((st, i) => (
                <NeoSurface pressed key={st.id} style={{ padding: '10px 14px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="git-commit" size={16} color={st.text ? theme.accent : theme.textSecondary} />
                  <input
                    type="text"
                    placeholder={`Subtask ${i + 1}`}
                    value={st.text}
                    onChange={(e) => {
                      const next = [...quickAddSubtasks];
                      next[i].text = e.target.value;
                      setQuickAddSubtasks(next);
                    }}
                    style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', color: theme.textPrimary, fontSize: 14, outline: 'none', ...fontBody }}
                  />
                  <button
                    onClick={() => setQuickAddSubtasks(prev => prev.filter((_, idx) => idx !== i))}
                    style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    <Icon name="x" size={14} />
                  </button>
                </NeoSurface>
              ))}

              {quickAddSubtasks.length < 5 && (
                <button
                  onClick={() => setQuickAddSubtasks(p => [...p, { id: generateId(), text: '', done: false }])}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer', fontSize: 13, alignSelf: 'flex-start', ...fontBody }}
                >
                  <Icon name="plus" size={14} /> Add subtask
                </button>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <NeoSurface pressed style={{ padding: '4px 8px', borderRadius: 24, display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => setShowQuickAddExtras(!showQuickAddExtras)}
                  style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: showQuickAddExtras || quickAddDue || quickAddReminder || quickAddPriority < 4 ? theme.accent : theme.textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Icon name="sliders" size={18} />
                </button>
                <input
                  type="text"
                  placeholder={`Add to "${activeListMeta.name}" · use #p1 or "tomorrow"`}
                  value={quickAddText}
                  onChange={(e) => setQuickAddText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                  style={{
                    flex: 1, background: 'transparent', border: 'none',
                    color: theme.textPrimary, fontSize: 15, padding: '8px 12px',
                    outline: 'none', ...fontBody
                  }}
                />
                <button
                  onClick={handleQuickAdd}
                  style={{ width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: quickAddText.trim() ? theme.accent : theme.textSecondary, border: 'none', cursor: quickAddText.trim() ? 'pointer' : 'default', padding: 0, transition: 'background 0.2s' }}
                >
                  <Icon name="arrow-up" size={18} />
                </button>
              </NeoSurface>
            </div>
          </div>
        </div>
      </div>

      {editorTask && (
        <TaskEditor
          task={editorTask}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
          onClose={() => setEditorTask(null)}
          theme={theme}
          fontDisplay={fontDisplay}
          fontBody={fontBody}
          NeoSurface={NeoSurface}
          PrimaryButton={PrimaryButton}
          NeoInput={NeoInput}
        />
      )}
    </div>
  );
}
