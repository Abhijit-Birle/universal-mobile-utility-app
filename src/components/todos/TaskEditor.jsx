import { useState, useEffect } from 'react';
import Icon from '../ui/Icon.jsx';
import { getLocalDateString } from '../../utils/date.js';
import DatePicker from '../ui/DatePicker.jsx';
import TimePicker from '../ui/TimePicker.jsx';
import ReminderPicker from '../ui/ReminderPicker.jsx';

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
  const [myDayDate, setMyDayDate] = useState(task.myDayDate || null);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newStep, setNewStep] = useState('');

  const todayStr = getLocalDateString();
  const isMyDay = myDayDate === todayStr;

  useEffect(() => {
    // Only save when unmounting (or explicit close), but for now we'll save on close button
  }, []);

  const handleSave = () => {
    if (!text.trim()) return;
    onUpdate(task.id, {
      text: text.trim(),
      note: note.trim(),
      due: due || null,
      dueTime: dueTime || null,
      reminder: reminder || null,
      important,
      myDayDate,
      subtasks
    });
    onClose();
  };

  const handleToggleMyDay = () => {
    setMyDayDate(isMyDay ? null : todayStr);
  };

  const handleAddStep = () => {
    if (!newStep.trim()) return;
    setSubtasks([...subtasks, { id: Date.now().toString(), text: newStep.trim(), done: false }]);
    setNewStep('');
  };

  const handleToggleStep = (id) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const handleRemoveStep = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) handleSave(); }} 
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}
      role="dialog" 
      aria-modal="true"
    >
      <div style={{ width: '100%', background: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 30px rgba(0,0,0,0.2)' }}>
        
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}` }}>
          <NeoInput 
            type="text" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Task title"
            style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, border: 'none', background: 'transparent', boxShadow: 'none', padding: 0, margin: 0, ...fontDisplay }}
          />
          <button onClick={() => setImportant(!important)} style={{ background: 'none', border: 'none', color: important ? theme.accent : theme.textSecondary, cursor: 'pointer' }}>
            <Icon name={important ? "star-fill" : "star"} size={22} />
          </button>
        </div>

        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Steps */}
          <NeoSurface pressed style={{ padding: '12px 16px', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {subtasks.map(step => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button 
                  onClick={() => handleToggleStep(step.id)}
                  style={{ 
                    width: 20, height: 20, borderRadius: '50%', 
                    border: `2px solid ${step.done ? theme.accent : theme.textSecondary}`, 
                    background: step.done ? theme.accent : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: 0
                  }}
                >
                  {step.done && <Icon name="check" size={14} color="#fff" />}
                </button>
                <span style={{ flex: 1, fontSize: 14, color: step.done ? theme.textSecondary : theme.textPrimary, textDecoration: step.done ? 'line-through' : 'none', ...fontBody }}>
                  {step.text}
                </span>
                <button onClick={() => handleRemoveStep(step.id)} style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}>
                  <Icon name="trash-2" size={16} />
                </button>
              </div>
            ))}
            
            {subtasks.length < 5 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            )}
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
              <DatePicker
                value={due}
                onChange={setDue}
                theme={theme}
                fontBody={fontBody}
                placeholder="Due date"
              />
            </NeoSurface>
            <NeoSurface style={{ flex: 1, padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <TimePicker
                value={dueTime}
                onChange={setDueTime}
                theme={theme}
                fontBody={fontBody}
                placeholder="Due time"
              />
            </NeoSurface>
          </div>

          {/* Reminder */}
          <NeoSurface style={{ padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <ReminderPicker
              value={reminder}
              onChange={setReminder}
              theme={theme}
              fontBody={fontBody}
              placeholder="Set reminder"
            />
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
          <span style={{ fontSize: 12, color: theme.textSecondary, ...fontBody }}>Created on {task.id.includes('_') ? 'Unknown' : new Date(parseInt(task.id)).toLocaleDateString()}</span>
          <button 
            onClick={() => { onDelete(task.id); onClose(); }} 
            style={{ background: 'none', border: 'none', color: '#ff6b6b', fontWeight: 600, fontSize: 14, cursor: 'pointer', ...fontBody }}
          >
            <Icon name="trash" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
