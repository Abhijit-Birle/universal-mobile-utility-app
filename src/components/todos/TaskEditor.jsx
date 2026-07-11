import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import { getLocalDateString } from '../../utils/date.js';
import { generateId } from '../../hooks/useTodos.js';
import DatePicker from '../ui/DatePicker.jsx';
import TimePicker from '../ui/TimePicker.jsx';
import ReminderPicker from '../ui/ReminderPicker.jsx';
import { PRIORITY_CONFIG } from '../../utils/nlp.js';

export default function TaskEditor({
  task,
  onUpdate,
  onDelete,
  onClose,
  theme, fontDisplay, fontBody, NeoSurface, PrimaryButton, NeoInput
}) {
  const [text, setText] = useState(task.text || '');
  const [note, setNote] = useState(task.note || '');
  const [due, setDue] = useState(task.due || '');
  const [dueTime, setDueTime] = useState(task.dueTime || '');
  const [reminder, setReminder] = useState(task.reminder || '');
  const [important, setImportant] = useState(!!task.important);
  const [priority, setPriority] = useState(task.priority ?? 4);
  const [myDayDate, setMyDayDate] = useState(task.myDayDate || null);
  const [subtasks, setSubtasks] = useState(
    (task.subtasks || []).map(s => ({ ...s, subtasks: s.subtasks || [] }))
  );
  const [newStep, setNewStep] = useState('');
  const [newSubStep, setNewSubStep] = useState({}); // { [parentId]: text }

  const todayStr = getLocalDateString();
  const isMyDay = myDayDate === todayStr;

  const handleSave = () => {
    if (!text.trim()) return;
    onUpdate(task.id, {
      text: text.trim(),
      note: note.trim(),
      due: due || null,
      dueTime: dueTime || null,
      reminder: reminder || null,
      important,
      priority,
      myDayDate,
      subtasks
    });
    onClose();
  };

  const handleToggleMyDay = () => setMyDayDate(isMyDay ? null : todayStr);

  // --- Subtask helpers ---
  const handleAddStep = () => {
    if (!newStep.trim()) return;
    setSubtasks(prev => [...prev, { id: generateId(), text: newStep.trim(), done: false, subtasks: [] }]);
    setNewStep('');
  };
  const handleToggleStep = (id) =>
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  const handleRemoveStep = (id) =>
    setSubtasks(prev => prev.filter(s => s.id !== id));

  // --- Nested subtask helpers ---
  const handleAddSubStep = (parentId) => {
    const txt = (newSubStep[parentId] || '').trim();
    if (!txt) return;
    setSubtasks(prev => prev.map(s =>
      s.id === parentId
        ? { ...s, subtasks: [...(s.subtasks || []), { id: generateId(), text: txt, done: false }] }
        : s
    ));
    setNewSubStep(prev => ({ ...prev, [parentId]: '' }));
  };
  const handleToggleSubStep = (parentId, subId) =>
    setSubtasks(prev => prev.map(s =>
      s.id === parentId
        ? { ...s, subtasks: s.subtasks.map(ss => ss.id === subId ? { ...ss, done: !ss.done } : ss) }
        : s
    ));
  const handleRemoveSubStep = (parentId, subId) =>
    setSubtasks(prev => prev.map(s =>
      s.id === parentId ? { ...s, subtasks: s.subtasks.filter(ss => ss.id !== subId) } : s
    ));

  const p = PRIORITY_CONFIG[priority];

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleSave(); }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}
      role="dialog"
      aria-modal="true"
    >
      <div style={{ width: '100%', background: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 30px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            {priority < 4 && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            )}
            <NeoInput
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Task title"
              style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, border: 'none', background: 'transparent', boxShadow: 'none', padding: 0, margin: 0, ...fontDisplay }}
            />
          </div>
          <button onClick={() => setImportant(!important)} style={{ background: 'none', border: 'none', color: important ? theme.accent : theme.textSecondary, cursor: 'pointer' }}>
            <Icon name={important ? "star-fill" : "star"} size={22} />
          </button>
        </div>

        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Priority Picker */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4].map(p => {
              const cfg = PRIORITY_CONFIG[p];
              const isActive = priority === p;
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 12,
                    border: isActive ? `2px solid ${cfg.color || theme.border}` : `2px solid transparent`,
                    background: isActive ? (cfg.bg || theme.pressed) : theme.bg,
                    color: isActive ? (cfg.color || theme.textPrimary) : theme.textSecondary,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    boxShadow: isActive ? 'none' : theme.shadowRaisedSm,
                    transition: 'all 0.15s',
                    ...fontBody
                  }}
                >
                  <span style={{ fontSize: 16 }}>{p === 1 ? '🔴' : p === 2 ? '🟠' : p === 3 ? '🔵' : '⬜'}</span>
                  <span>{cfg.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.8 }}>{cfg.name}</span>
                </button>
              );
            })}
          </div>

          {/* Steps / Subtasks */}
          <NeoSurface pressed style={{ padding: '12px 16px', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {subtasks.map((step, si) => (
              <div key={step.id}>
                {/* Parent subtask row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: step.subtasks?.length > 0 ? 6 : 10 }}>
                  <button
                    onClick={() => handleToggleStep(step.id)}
                    style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${step.done ? theme.accent : theme.textSecondary}`,
                      background: step.done ? theme.accent : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
                    }}
                  >
                    {step.done && <Icon name="check" size={12} color="#fff" />}
                  </button>
                  <span style={{ flex: 1, fontSize: 14, color: step.done ? theme.textSecondary : theme.textPrimary, textDecoration: step.done ? 'line-through' : 'none', ...fontBody }}>
                    {step.text}
                  </span>
                  {step.subtasks?.length > 0 && (
                    <span style={{ fontSize: 11, color: theme.textSecondary, ...fontBody }}>
                      {step.subtasks.filter(s => s.done).length}/{step.subtasks.length}
                    </span>
                  )}
                  <button onClick={() => handleRemoveStep(step.id)} style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer', padding: 0 }}>
                    <Icon name="x" size={14} />
                  </button>
                </div>

                {/* Nested subtasks */}
                {step.subtasks?.map(ss => (
                  <div key={ss.id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 30, paddingBottom: 6 }}>
                    <button
                      onClick={() => handleToggleSubStep(step.id, ss.id)}
                      style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${ss.done ? theme.accent2 : theme.textSecondary}`,
                        background: ss.done ? theme.accent2 : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
                      }}
                    >
                      {ss.done && <Icon name="check" size={10} color="#fff" />}
                    </button>
                    <span style={{ flex: 1, fontSize: 13, color: ss.done ? theme.textSecondary : theme.textPrimary, textDecoration: ss.done ? 'line-through' : 'none', ...fontBody }}>
                      {ss.text}
                    </span>
                    <button onClick={() => handleRemoveSubStep(step.id, ss.id)} style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer', padding: 0 }}>
                      <Icon name="x" size={12} />
                    </button>
                  </div>
                ))}

                {/* Add nested subtask */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 30, paddingBottom: si < subtasks.length - 1 ? 12 : 4, borderBottom: si < subtasks.length - 1 ? `1px solid ${theme.border}` : 'none', marginBottom: si < subtasks.length - 1 ? 10 : 0 }}>
                  <div style={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="plus" size={12} color={theme.textSecondary} />
                  </div>
                  <input
                    type="text"
                    placeholder="Add sub-step"
                    value={newSubStep[step.id] || ''}
                    onChange={(e) => setNewSubStep(prev => ({ ...prev, [step.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubStep(step.id)}
                    style={{ flex: 1, background: 'transparent', border: 'none', color: theme.textSecondary, fontSize: 12, outline: 'none', ...fontBody }}
                  />
                </div>
              </div>
            ))}

            {/* Add parent step */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: subtasks.length > 0 ? 4 : 0 }}>
              <Icon name="plus" size={20} color={theme.accent} />
              <input
                type="text"
                placeholder="Add step"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                style={{ flex: 1, background: 'transparent', border: 'none', color: theme.textPrimary, fontSize: 14, outline: 'none', ...fontBody }}
              />
            </div>
          </NeoSurface>

          {/* Add to My Day */}
          <NeoSurface onClick={handleToggleMyDay} style={{ padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <Icon name="sun" size={20} color={isMyDay ? theme.accent : theme.textSecondary} />
            <span style={{ fontSize: 15, color: isMyDay ? theme.accent : theme.textPrimary, fontWeight: isMyDay ? 600 : 400, ...fontBody }}>
              {isMyDay ? 'Added to My Day' : 'Add to My Day'}
            </span>
          </NeoSurface>

          {/* Due Date & Time */}
          <div style={{ display: 'flex', gap: 12 }}>
            <NeoSurface style={{ flex: 1, padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <DatePicker value={due} onChange={setDue} theme={theme} fontBody={fontBody} placeholder="Due date" />
            </NeoSurface>
            <NeoSurface style={{ flex: 1, padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <TimePicker value={dueTime} onChange={setDueTime} theme={theme} fontBody={fontBody} placeholder="Due time" />
            </NeoSurface>
          </div>

          {/* Reminder */}
          <NeoSurface style={{ padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <ReminderPicker value={reminder} onChange={setReminder} theme={theme} fontBody={fontBody} placeholder="Set reminder" />
          </NeoSurface>

          {/* Notes */}
          <NeoSurface pressed style={{ padding: '12px 16px', borderRadius: 16, display: 'flex', flexDirection: 'column' }}>
            <textarea
              placeholder="Add note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ width: '100%', minHeight: 100, background: 'transparent', border: 'none', color: theme.textPrimary, fontSize: 14, outline: 'none', resize: 'none', ...fontBody }}
            />
          </NeoSurface>

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${theme.border}`, paddingBottom: 32 }}>
          <button
            onClick={handleSave}
            style={{ background: theme.accent, border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', borderRadius: 12, padding: '10px 28px', ...fontBody }}
          >
            Save
          </button>
          <button
            onClick={() => { onDelete(task.id); onClose(); }}
            style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, ...fontBody }}
          >
            <Icon name="trash" size={16} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
