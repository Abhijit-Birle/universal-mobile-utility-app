import { useState } from 'react';
import TaskEditor from '../components/tasks/TaskEditor.jsx';
import ExpenseEditor from '../components/expenses/ExpenseEditor.jsx';
import Icon from '../components/ui/Icon.jsx';
import QuickCapture from '../components/expenses/QuickCapture.jsx';
import InlineTimer from '../components/tasks/InlineTimer.jsx';
import MoodCard from '../components/tracker/MoodCard.jsx';
import { EXPENSE_CATEGORIES } from '../constants/categories.js';
import '../styles/insights.css';
import '../styles/tasks.css';
import '../styles/expenses.css';

export default function TodayTab({
  isReadOnly,
  selectedDate,
  todayTasks,
  todayExpenses,
  todayTotal,
  latestMoodLog,
  onSaveMood,
  expenses,
  settings,
  updateSettings,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onQuickCapture,
  onUpdateExpense,
  onDeleteExpense,
  recurringExpenses,
  noSpendStreak,
  onStartTimer,
  
  routine,
  toggleHabit,
  addHabit,
  updateHabit,
  deleteHabit,
  getHabitStreak,
  getDateStr,
  
  timerState,
  selectTimerTask,
  setTimerCustomTitle,
  setTimerDuration,
  setTimerMode,
  startTimer,
  stopTimer,
  pauseTimer,
  addTime,
  saveSession,
  deleteHistoryItem,
}) {
  const [taskEditor, setTaskEditor] = useState(null);
  const [addingTask, setAddingTask] = useState(false);
  const [expenseEditor, setExpenseEditor] = useState(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [newHabit, setNewHabit] = useState('');
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editHabitTitle, setEditHabitTitle] = useState('');

  const handleSaveTask = (taskData) => {
    if (!taskData.id) {
      onAddTask(taskData);
    } else {
      onUpdateTask(taskData.id, taskData);
    }
  };

  const handleSaveExpense = (expData) => {
    onUpdateExpense(expData.id, expData);
  };

  // Budget calculations
  const budgetTotal = settings?.monthlyBudget || 50000;
  const thisMonthExpenses = expenses.filter(e => {
    const d = new Date(e.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthSpend = thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const budgetPercent = Math.min(100, Math.round((monthSpend / budgetTotal) * 100));
  const r = 36;
  const c = 2 * Math.PI * r;
  const dashoffset = c - (budgetPercent / 100) * c;

  // Study minutes today
  const studyTasks = todayTasks.filter(t => t.domain === 'study' && t.status === 'done');
  const studyMins = studyTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
  
  // Tasks done
  const tasksDone = todayTasks.filter(t => t.status === 'done').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div className="scroll-content" style={{ paddingBottom: 100 }}>
        
        {isReadOnly && (
          <div style={{ 
            background: 'var(--accent-secondary)', 
            color: '#fff', 
            padding: '8px 16px', 
            borderRadius: 8, 
            marginBottom: 16, 
            fontSize: 13, 
            fontWeight: 500, 
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(224, 138, 92, 0.3)'
          }}>
            Viewing {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (Read Only)
          </div>
        )}

        <MoodCard 
          dateStr={getDateStr(selectedDate)}
          latestLog={latestMoodLog}
          onSave={onSaveMood}
        />

        {/* ── Day Summary Strip ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div className="neu-card-sm" style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Spend</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-primary)', marginTop: 4 }}>₹{todayTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="neu-card-sm" style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Tasks</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{tasksDone}/{todayTasks.length}</span>
          </div>
          <div className="neu-card-sm" style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Study</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{studyMins}m</span>
          </div>
        </div>

        {/* ── Budget Card ── */}
        <div 
          className="neu-card" 
          style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
          onClick={() => {
            setBudgetInput(settings.monthlyBudget?.toString() || '0');
            setIsEditingBudget(true);
          }}
        >
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r={r} fill="none" stroke="var(--divider-strong)" strokeWidth="6" />
              <circle 
                cx="40" cy="40" r={r} fill="none" 
                stroke="var(--accent-primary)" 
                strokeWidth="6"
                strokeDasharray={c}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{budgetPercent}%</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 4px 0', fontWeight: 500 }}>Monthly budget</h3>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              ₹{monthSpend.toLocaleString('en-IN')} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>of ₹{budgetTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              ₹{todayTotal.toLocaleString('en-IN')} spent today
            </div>
          </div>
        </div>

        {/* ── Quick Capture ── */}
        {!isReadOnly && (
          <div style={{ marginBottom: 24 }}>
            <QuickCapture 
              onCaptureExpense={onQuickCapture}
              onCaptureTask={onAddTask}
              onCaptureHabit={addHabit}
              onOpenEditor={() => setExpenseEditor({})} 
            />
          </div>
        )}

        {/* ── Today's Expenses ── */}
        {todayExpenses.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>Today's Expenses</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todayExpenses.map(exp => {
                const cat = EXPENSE_CATEGORIES[exp.category] || EXPENSE_CATEGORIES.other;
                return (
                  <div key={exp.id} onClick={() => setExpenseEditor(exp)} className="neu-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-app)', boxShadow: 'var(--shadow-raised-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color }}>
                        <Icon name={cat.icon} size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{exp.note || cat.label}</div>
                        {exp.note && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cat.label}</div>}
                      </div>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>₹{exp.amount?.toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Timers Row ── */}
        <div style={{ marginBottom: 24, overflowX: 'auto', paddingBottom: 16, margin: '0 -16px', padding: '0 16px', display: 'flex', gap: 16 }}>
          <div className="neu-card" style={{ width: 140, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16 }}>
            <Icon name="book" size={24} color="var(--accent-primary)" />
            <span style={{ fontSize: 13, fontWeight: 500, marginTop: 12, marginBottom: 4 }}>Study</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>25:00</span>
            <button className="neu-btn-circle" style={{ width: 40, height: 40 }}>
              <Icon name="play" size={16} color="var(--accent-primary)" />
            </button>
          </div>
          <div className="neu-card" style={{ width: 140, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16 }}>
            <Icon name="activity" size={24} color="var(--accent-secondary)" />
            <span style={{ fontSize: 13, fontWeight: 500, marginTop: 12, marginBottom: 4 }}>Workout</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>45:00</span>
            <button className="neu-btn-circle" style={{ width: 40, height: 40 }}>
              <Icon name="play" size={16} color="var(--accent-secondary)" />
            </button>
          </div>
          <div className="neu-inset" style={{ width: 140, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, border: '1px dashed var(--text-muted)' }}>
            <Icon name="plus" size={24} color="var(--text-muted)" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Custom</span>
          </div>
        </div>

        {/* ── Habits Card ── */}
        {routine && (
          <div className="neu-card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>Daily Habits</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {routine.habits.map(habit => {
                const dateStr = getDateStr(selectedDate);
                const done = habit.logs && habit.logs[dateStr];
                const streak = getHabitStreak(habit.id);
                // Last 7 days grid
                const past7Days = Array.from({length: 7}).map((_, i) => {
                  const d = new Date(selectedDate || new Date());
                  d.setDate(d.getDate() - (6 - i));
                  const ds = getDateStr(d);
                  return habit.logs && habit.logs[ds];
                });
                
                return (
                  <div key={habit.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {editingHabitId === habit.id && !isReadOnly ? (
                        <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
                          <input 
                            value={editHabitTitle}
                            onChange={(e) => setEditHabitTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editHabitTitle.trim()) updateHabit(habit.id, { title: editHabitTitle.trim() });
                                setEditingHabitId(null);
                              } else if (e.key === 'Escape') {
                                setEditingHabitId(null);
                              }
                            }}
                            autoFocus
                            style={{
                              flex: 1, border: 'none', background: 'var(--bg-input)', outline: 'none',
                              padding: '4px 8px', borderRadius: 4, color: 'var(--text-primary)'
                            }}
                          />
                          <button onClick={() => {
                            if (editHabitTitle.trim()) updateHabit(habit.id, { title: editHabitTitle.trim() });
                            setEditingHabitId(null);
                          }} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                            <Icon name="check" size={16} />
                          </button>
                          <button onClick={() => {
                            deleteHabit(habit.id);
                            setEditingHabitId(null);
                          }} style={{ background: 'transparent', border: 'none', color: 'var(--accent-transport)', cursor: 'pointer' }}>
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span 
                            style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', cursor: isReadOnly ? 'default' : 'pointer' }}
                            onClick={() => {
                              if (!isReadOnly) {
                                setEditingHabitId(habit.id);
                                setEditHabitTitle(habit.title);
                              }
                            }}
                          >
                            {habit.title}
                          </span>
                          {streak > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-secondary)' }}>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{streak}</span>
                              <Icon name="flame" size={14} color="var(--accent-secondary)" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                      {past7Days.map((isDone, idx) => {
                        const isToday = idx === 6;
                        return (
                          <div 
                            key={idx}
                            onClick={() => {
                              if (isToday && !isReadOnly) {
                                toggleHabit(habit.id, selectedDate);
                              }
                            }}
                            style={{
                              aspectRatio: '1',
                              borderRadius: 4,
                              background: isDone ? habit.color : 'var(--bg-app)',
                              boxShadow: isDone ? 'var(--shadow-raised-sm)' : 'var(--shadow-inset)',
                              border: isToday ? `1px solid ${habit.color}` : 'none',
                              cursor: (isToday && !isReadOnly) ? 'pointer' : 'default'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Add Habit Input (hidden in read-only) */}
            {!isReadOnly && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <input
                  type="text"
                  placeholder="Add new habit..."
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newHabit.trim()) {
                      addHabit(newHabit.trim());
                      setNewHabit('');
                    }
                  }}
                  style={{
                    flex: 1, height: 40, borderRadius: 20, border: 'none',
                    background: 'var(--bg-input)', boxShadow: 'var(--shadow-inset)',
                    padding: '0 16px', fontSize: 14, color: 'var(--text-primary)', outline: 'none'
                  }}
                />
                <button
                  onClick={() => {
                    if (newHabit.trim()) {
                      addHabit(newHabit.trim());
                      setNewHabit('');
                    }
                  }}
                  style={{
                    height: 40, padding: '0 16px', borderRadius: 20, border: 'none',
                    background: 'var(--bg-app)', boxShadow: 'var(--shadow-raised-sm)',
                    color: 'var(--accent-primary)', fontSize: 14, fontWeight: 500, cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tasks Preview ── */}
        <div className="neu-inset" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>Today's Tasks</h3>
          {todayTasks.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', opacity: 0.5 }}>
              <Icon name="check" size={32} color="var(--text-muted)" />
              <span style={{ fontSize: 13, marginTop: 12 }}>No tasks due today</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todayTasks.map((task) => {
                const done = task.status === 'done';
                return (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => !isReadOnly && setTaskEditor(task)}>
                    <button
                      disabled={isReadOnly}
                      onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                      style={{
                        width: 24, height: 24, borderRadius: 6,
                        border: 'none',
                        background: done ? 'var(--accent-primary)' : 'var(--bg-app)',
                        boxShadow: done ? 'var(--shadow-inset)' : 'var(--shadow-raised-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: isReadOnly ? 'default' : 'pointer'
                      }}
                    >
                      {done && <Icon name="check" size={14} color="white" />}
                    </button>
                    <span style={{ 
                      flex: 1, 
                      fontSize: 14, 
                      color: done ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: done ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Editors */}
      {(taskEditor || addingTask) && (
        <TaskEditor
          task={taskEditor || null}
          expenses={expenses}
          onSave={handleSaveTask}
          onDelete={onDeleteTask}
          onClose={() => { setTaskEditor(null); setAddingTask(false); }}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onDeleteSubtask={onDeleteSubtask}
        />
      )}

      {expenseEditor && (
        <ExpenseEditor
          expense={expenseEditor.id ? expenseEditor : null}
          onClose={() => setExpenseEditor(null)}
          onSave={(exp) => {
            if (expenseEditor.id) onUpdateExpense(expenseEditor.id, exp);
            else onQuickCapture(exp);
            setExpenseEditor(null);
          }}
          onDelete={(id) => {
            onDeleteExpense(id);
            setExpenseEditor(null);
          }}
          recurringExpenses={recurringExpenses}
        />
      )}

      {/* ── Budget Editor Modal ── */}
      {isEditingBudget && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
        }}>
          <div className="neu-card" style={{ margin: 16, padding: 24, borderRadius: 24 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: 'var(--text-primary)' }}>Edit Monthly Budget</h3>
            <div className="neu-inset" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: 16, marginBottom: 24 }}>
              <span style={{ fontSize: 18, color: 'var(--text-secondary)' }}>₹</span>
              <input 
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', padding: '16px 8px'
                }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setIsEditingBudget(false)}
                style={{
                  flex: 1, padding: '14px 0', borderRadius: 16, border: 'none',
                  background: 'var(--bg-app)', boxShadow: 'var(--shadow-raised)',
                  fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const val = parseInt(budgetInput, 10);
                  if (!isNaN(val) && val >= 0 && updateSettings) {
                    updateSettings({ monthlyBudget: val });
                  }
                  setIsEditingBudget(false);
                }}
                style={{
                  flex: 1, padding: '14px 0', borderRadius: 16, border: 'none',
                  background: 'var(--bg-app)', boxShadow: 'var(--shadow-raised)',
                  fontSize: 16, fontWeight: 600, color: 'var(--accent-primary)', cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
