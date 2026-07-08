import { useState, useMemo } from 'react';
import Icon from '../components/ui/Icon.jsx';
import TaskEditor from '../components/todos/TaskEditor.jsx';
import { useTodos } from '../hooks/useTodos.js';
import { getLocalDateString } from '../utils/date.js';

export default function TodoTab({ theme, NeoSurface, NeoInput, PrimaryButton, SectionLabel, fontDisplay, fontBody }) {
  const {
    todos, lists, loading,
    addTodo, updateTodo, toggleDone, deleteTodo, addList, deleteList
  } = useTodos();

  const [currentList, setCurrentList] = useState('myday');
  const [editorTask, setEditorTask] = useState(null);
  const [quickAddText, setQuickAddText] = useState('');
  
  const todayStr = getLocalDateString();

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

  const incompleteTasks = filteredTodos.filter(t => !t.done);
  const completedTasks = filteredTodos.filter(t => t.done);

  const handleQuickAdd = () => {
    if (!quickAddText.trim()) return;
    
    const newTask = { text: quickAddText.trim() };
    if (currentList === 'myday') {
      newTask.myDayDate = todayStr;
      newTask.listId = 'default';
    } else if (currentList === 'important') {
      newTask.important = true;
      newTask.listId = 'default';
    } else if (currentList === 'planned') {
      newTask.due = todayStr;
      newTask.listId = 'default';
    } else if (currentList === 'tasks') {
      newTask.listId = 'default';
    } else {
      newTask.listId = currentList;
    }

    addTodo(newTask);
    setQuickAddText('');
  };

  const handleAddCustomList = () => {
    const name = prompt("Enter list name:");
    if (name && name.trim()) {
      addList(name.trim());
    }
  };

  if (loading) {
    return <div style={{ padding: 20, color: theme.textSecondary, ...fontBody }}>Loading tasks...</div>;
  }

  const renderTask = (t) => (
    <NeoSurface 
      key={t.id} 
      style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 16 }}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); toggleDone(t.id); }}
        style={{ 
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          border: t.done ? 'none' : `2px solid ${theme.textSecondary}`, 
          background: t.done ? theme.accent : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0
        }}
      >
        {t.done && <Icon name="check" size={16} color="#fff" />}
      </button>

      <div onClick={() => setEditorTask(t)} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
        <span style={{ 
          fontSize: 15, 
          color: t.done ? theme.textSecondary : theme.textPrimary, 
          textDecoration: t.done ? 'line-through' : 'none', 
          ...fontBody, 
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
        }}>
          {t.text}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          {t.listId !== 'default' && currentList !== t.listId && (
            <span style={{ fontSize: 11, color: theme.textSecondary, ...fontBody }}>
              {lists.find(l => l.id === t.listId)?.name || 'Tasks'}
            </span>
          )}
          {t.myDayDate === todayStr && currentList !== 'myday' && (
            <span style={{ fontSize: 11, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 4, ...fontBody }}>
              <Icon name="sun" size={10} color="#ffb648" /> My Day
            </span>
          )}
          {t.due && (
            <span style={{ fontSize: 11, color: theme.accent2, display: 'flex', alignItems: 'center', gap: 4, ...fontBody }}>
              <Icon name="calendar" size={10} /> {t.due === todayStr ? 'Today' : t.due}
            </span>
          )}
          {t.subtasks && t.subtasks.length > 0 && (
            <span style={{ fontSize: 11, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 4, ...fontBody }}>
              <Icon name="git-commit" size={10} /> {t.subtasks.filter(s=>s.done).length}/{t.subtasks.length}
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
                border: 'none',
                borderRadius: 20,
                padding: '8px 16px',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                ...fontBody
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
            flexShrink: 0,
            background: 'transparent',
            color: theme.accent,
            border: `2px dashed ${theme.border}`,
            borderRadius: 20,
            padding: '6px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            ...fontBody
          }}
        >
          <Icon name="plus" size={14} /> New List
        </button>
      </div>

      {/* Main Content */}
      <div className="scroll-content" style={{ padding: '12px 18px 100px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Icon name={activeListMeta.icon} size={28} color={activeListMeta.color || theme.accent} />
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: theme.textPrimary, margin: 0, ...fontDisplay }}>
              {activeListMeta.name}
            </h2>
            {currentList === 'myday' && (
              <p style={{ fontSize: 13, color: theme.textSecondary, margin: '4px 0 0 0', ...fontBody }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Task List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, width: '100%', 
        padding: '16px 18px 32px', 
        background: `linear-gradient(to top, ${theme.bg} 80%, transparent)`,
        display: 'flex', alignItems: 'center', gap: 12, zIndex: 10
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <NeoSurface pressed style={{ padding: '4px 8px', borderRadius: 24, display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={handleQuickAdd}
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Icon name="plus" size={20} />
            </button>
            <input 
              type="text"
              placeholder={`Add a task to "${activeListMeta.name}"`}
              value={quickAddText}
              onChange={(e) => setQuickAddText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              style={{ 
                flex: 1, background: 'transparent', border: 'none', 
                color: theme.textPrimary, fontSize: 15, padding: '8px 12px', 
                outline: 'none', ...fontBody 
              }}
            />
          </NeoSurface>
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
