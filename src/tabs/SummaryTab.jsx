import { useState, useEffect, useRef } from 'react';
import { useTodos } from '../hooks/useTodos.js';
import { useMoodTracker } from '../hooks/useMoodTracker.js';
import { useFocusTimer } from '../hooks/useFocusTimer.js';
import { getLocalDateString } from '../utils/date.js';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { Flame, Check, ChevronLeft, ChevronRight, Upload, Plus } from 'lucide-react';

const fmt = (n) => `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const pad = (n) => String(n).padStart(2, '0');

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ponytail: circular progress — pure inline SVG, no dependency
function MiniTimer({ remainingSeconds, durationSeconds, isRunning, onNavigate }) {
  const pct = durationSeconds > 0 ? remainingSeconds / durationSeconds : 1;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  return (
    <div onClick={onNavigate} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: 6 }}>
      <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(46,204,156,0.15)" strokeWidth={5} />
        <circle
          cx={36} cy={36} r={r} fill="none"
          stroke="#2ecc9c" strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s linear' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#2ecc9c', letterSpacing: '-0.5px', marginTop: 26 }}>
          {pad(mins)}:{pad(secs)}
        </span>
      </div>
      <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', fontWeight: 500 }}>
        {isRunning ? '● Focusing' : 'Tap to focus'}
      </span>
    </div>
  );
}

export default function SummaryTab({ theme, NeoSurface, NeoInput, fontDisplay, fontBody, onNavigate, transactions = [], streak = 0, activeDays = [], monthlyActiveCount = 0, daysInMonth = 30, yearlyActiveCount = 0, daysInYear = 365, onShowForm, isImporting, onImportStatement }) {
  const { todos, toggleDone, addTodo } = useTodos();
  const { timerState } = useFocusTimer();
  const { moodLogs, addLog: logMood } = useMoodTracker();
  const [showMonthly, setShowMonthly] = useState(false);
  const [viewMonthDate, setViewMonthDate] = useState(new Date());
  const [magicText, setMagicText] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const inputRef = useRef(null);
  
  const today = getLocalDateString();

  const expenseList = transactions.filter(t => t.type === 'expense');

  // Today's spend from expenses
  const todaySpend = expenseList
    .filter(e => e.date === today || e.date === 'Today')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  // Month total
  const now = new Date();
  const monthSpend = expenseList
    .filter(e => {
      const d = (e.date === 'Today') ? new Date() : new Date(e.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  // Last 7 days chart data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = getLocalDateString(d);
    const isToday = i === 6;
    
    const amount = expenseList
      .filter(e => e.date === dateStr || (isToday && e.date === 'Today'))
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), amount };
  });

  // Top 3 My Day tasks (uncompleted, due today or in myDayDate)
  let pendingMyDay = todos.filter(t => !t.done && (t.myDayDate === today || t.due === today));

  // Fallback: just take uncompleted tasks if no My Day tasks
  if (pendingMyDay.length === 0) {
    pendingMyDay = todos.filter(t => !t.done);
  }

  // Sort by priority (important first), then take top 3
  const taskList = pendingMyDay
    .sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0))
    .slice(0, 3);

  // Timer live countdown (recalculate remaining if running)
  const [liveRemaining, setLiveRemaining] = useState(timerState.remainingSeconds);
  useEffect(() => {
    if (!timerState.isRunning || !timerState.endTime) {
      setLiveRemaining(timerState.remainingSeconds);
      return;
    }
    const tick = () => {
      const r = Math.max(0, Math.round((timerState.endTime - Date.now()) / 1000));
      setLiveRemaining(r);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timerState.isRunning, timerState.endTime, timerState.remainingSeconds]);

  const handleMagicSubmit = (e) => {
    e.preventDefault();
    if (!magicText.trim()) return;
    // ponytail: stub — LLM routing comes in follow-up task
    console.log('[Magic Input]', magicText);
    setMagicText('');
  };

  const card = {
    background: theme.bg,
    borderRadius: 20,
    padding: '18px 20px',
    boxShadow: theme.shadowRaised,
    marginBottom: 14,
  };

  const label = {
    fontSize: 10, fontWeight: 700, color: theme.textSecondary,
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
    ...fontBody,
  };

  return (
    <div className="scroll-content" style={{ padding: '4px 18px 100px', flex: 1 }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ ...fontDisplay, fontSize: 24, fontWeight: 700, margin: 0, color: theme.textPrimary }}>
          {greeting()} 👋
        </h2>
        <p style={{ ...fontBody, fontSize: 13, color: theme.textSecondary, margin: '4px 0 0' }}>
          Let's make today count.
        </p>
      </div>

      {/* Strict Neumorphic Streak Card (2-Column) */}
      <NeoSurface 
        onClick={() => setShowMonthly(true)}
        style={{ 
          padding: 18, 
          borderRadius: 24, 
          display: 'flex', 
          gap: 16,
          marginBottom: 20,
          cursor: 'pointer',
        }}
      >
        {/* Left Column: Icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 70, flexShrink: 0 }}>
          <NeoSurface pressed={true} style={{
            width: 60, height: 60, borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Flame size={28} color={theme.accent} strokeWidth={2.5} style={{ opacity: 0.9 }} />
          </NeoSurface>
        </div>
        
        {/* Right Column: Progress & Strip */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* Monthly Progress Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, minWidth: 50 }}>
              <span style={{ fontSize: 20, fontWeight: 800, ...fontDisplay, color: theme.textPrimary, lineHeight: 1 }}>{monthlyActiveCount}</span>
              <span style={{ fontSize: 12, fontWeight: 600, ...fontDisplay, color: theme.textSecondary, lineHeight: 1.1 }}>/ {daysInMonth}</span>
            </div>
            
            {/* Progress Track */}
            <NeoSurface pressed={true} style={{ height: 10, borderRadius: 5, flex: 1, position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', top: 2, left: 2, bottom: 2, 
                width: `${Math.min((monthlyActiveCount / daysInMonth) * 100, 100)}%`, 
                background: theme.accent, borderRadius: 3,
                transition: 'width 0.5s ease'
              }} />
            </NeoSurface>
          </div>


          {/* 7-Day Inset Well */}
          <NeoSurface pressed={true} style={{ padding: '10px 14px', borderRadius: 18, display: 'flex', justifyContent: 'space-between' }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const dateStr = getLocalDateString(d);
              const dayInitial = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
              const isStreakDay = activeDays.includes(dateStr);
              
              return (
                <NeoSurface 
                  key={i} 
                  pressed={!isStreakDay}
                  style={{ 
                    width: 28, height: 28, borderRadius: '50%', 
                    background: isStreakDay ? theme.accent : undefined,
                    boxShadow: isStreakDay ? theme.shadowRaisedSm : undefined,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isStreakDay ? '#fff' : theme.textSecondary,
                    fontSize: 11, fontWeight: isStreakDay ? 800 : 600,
                    ...fontDisplay
                  }}
                >
                  {dayInitial}
                </NeoSurface>
              )
            })}
          </NeoSurface>
        </div>
      </NeoSurface>

      {/* Mood Tracker */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, color: theme.textPrimary, fontSize: 14 }}>How are you feeling?</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {['😠', '😔', '😐', '🙂', '🤩'].map((emoji, index) => {
            const score = index + 1;
            const isSelected = moodLogs[today] === score;
            return (
              <NeoSurface
                key={score}
                pressed={isSelected}
                onClick={() => logMood(today, score)}
                style={{
                  width: 46, height: 46, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  filter: !isSelected && moodLogs[today] ? 'grayscale(100%) opacity(0.5)' : 'none'
                }}
              >
                {emoji}
              </NeoSurface>
            );
          })}
        </div>
      </div>

      {/* Financial Snapshot */}
      <NeoSurface 
        pressed={true}
        onClick={() => onNavigate('expense')}
        style={{ ...card, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <div style={{ ...label, marginBottom: 0 }}>Financial Snapshot</div>

        {/* Magic Input (moved inside) */}
        <form onSubmit={handleMagicSubmit} onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
          <NeoInput
            ref={inputRef}
            value={magicText}
            onChange={e => setMagicText(e.target.value)}
            placeholder="What's on your mind? (e.g. Spent ₹200 on lunch)"
            style={{ paddingRight: 48 }}
          />
          {magicText && (
            <button
              type="submit"
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: theme.accent, border: 'none', borderRadius: 10,
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff', fontSize: 18, lineHeight: 1,
              }}
            >›</button>
          )}
        </form>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>{fmt(todaySpend)}</div>
            <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2, ...fontBody }}>Today's Spend</div>
          </div>
          <div style={{ width: 1, background: theme.border }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>{fmt(monthSpend)}</div>
            <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2, ...fontBody }}>This Month</div>
          </div>
        </div>
        
        {/* Sparkline Chart */}
        <div style={{ height: 60, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.accent} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={theme.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis hide domain={[0, max => Math.max(max, 100)]} />
              <Area type="monotone" dataKey="amount" stroke={theme.accent} strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 4 }} onClick={e => e.stopPropagation()}>
          <NeoSurface 
            style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 16, cursor: isImporting ? "wait" : "pointer", color: theme.accent, overflow: "hidden" }}
          >
            {!isImporting && <input type="file" accept=".csv,.txt,.xls,.xlsx" multiple onChange={onImportStatement} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 10 }} title="Import Statement" />}
            {isImporting ? (
              <div style={{ fontSize: 10, color: theme.textSecondary }}>...</div>
            ) : (
              <Upload size={18} strokeWidth={2.5} style={{ position: "relative", zIndex: 1 }} />
            )}
          </NeoSurface>
          
          <NeoSurface 
            onClick={onShowForm}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 24px", borderRadius: 16, cursor: "pointer", background: theme.accent, color: "#fff", fontWeight: 600, fontSize: 15, ...fontDisplay }}
          >
            <Plus size={16} strokeWidth={2.5} /> New Transaction
          </NeoSurface>
        </div>
      </NeoSurface>

      {/* My Day Tasks */}
      <div style={card}>
        <div style={label}>My Day</div>
        {taskList.length === 0 ? (
          <div style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', padding: '12px 0', ...fontBody }}>
            No tasks for today 🎉
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {taskList.map(task => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => toggleDone(task.id)}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', border: `2px solid ${theme.accent}`,
                    background: task.done ? theme.accent : 'transparent',
                    cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {task.done && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                </button>
                <span style={{
                  fontSize: 14, color: task.done ? theme.textSecondary : theme.textPrimary,
                  textDecoration: task.done ? 'line-through' : 'none',
                  flex: 1, ...fontBody,
                }}>
                  {task.text || 'Untitled'}
                </span>
                {task.important && <span style={{ fontSize: 10, color: '#ef4444' }}>★</span>}
              </div>
            ))}
          </div>
        )}

        {/* Quick Add Task */}
        <form onSubmit={(e) => {
          e.preventDefault();
          if (newTaskText.trim()) {
            addTodo({ text: newTaskText.trim(), myDayDate: today });
            setNewTaskText('');
          }
        }} style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <NeoInput 
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a task for today..."
            style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
          />
          <button 
            type="submit" 
            disabled={!newTaskText.trim()}
            style={{ 
              background: newTaskText.trim() ? theme.accent : theme.border, 
              color: '#fff', border: 'none', borderRadius: 10, 
              padding: '0 12px', cursor: newTaskText.trim() ? 'pointer' : 'default', 
              fontWeight: 600, fontSize: 13, transition: 'background 0.2s'
            }}
          >
            Add
          </button>
        </form>

        <button
          onClick={() => onNavigate('todo')}
          style={{
            marginTop: 14, width: '100%', background: 'transparent', border: 'none',
            color: theme.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', ...fontBody,
          }}
        >
          View All Tasks →
        </button>
      </div>

      {/* Focus Timer */}
      <div style={{ 
        ...card, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 20,
        position: 'relative', 
        overflow: 'hidden',
        animation: timerState.isRunning ? 'pulseTimer 2s infinite' : 'none' 
      }}>
        <style>{`
          @keyframes pulseTimer {
            0% { box-shadow: 0 0 0 0 ${theme.accent}40; }
            70% { box-shadow: 0 0 0 10px ${theme.accent}00; }
            100% { box-shadow: 0 0 0 0 ${theme.accent}00; }
          }
        `}</style>
        <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
          <MiniTimer
            remainingSeconds={liveRemaining}
            durationSeconds={timerState.durationSeconds}
            isRunning={timerState.isRunning}
            onNavigate={() => onNavigate('timer')}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={label}>Focus Timer</div>
          <div style={{ fontSize: 14, color: theme.textPrimary, fontWeight: 600, ...fontDisplay }}>
            {timerState.isRunning ? 'Session in progress' : 'Ready to focus?'}
          </div>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 3, ...fontBody }}>
            {timerState.history.length} sessions completed
          </div>
          {!timerState.isRunning && (
            <button
              onClick={() => onNavigate('timer')}
              style={{
                marginTop: 10, padding: '7px 16px', borderRadius: 10,
                background: `linear-gradient(135deg, ${theme.accent}, #5a4fcf)`,
                border: 'none', color: '#fff', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', ...fontBody,
              }}
            >
              Start Session
            </button>
          )}
        </div>
      </div>

      {/* Monthly Modal Overlay */}
      {showMonthly && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }} onClick={() => setShowMonthly(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: 360 }}>
            <NeoSurface style={{ padding: 24, borderRadius: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <button onClick={() => {
                  const d = new Date(viewMonthDate);
                  d.setMonth(d.getMonth() - 1);
                  setViewMonthDate(d);
                }} style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}>
                  <ChevronLeft size={24} />
                </button>
                <h3 style={{ margin: 0, ...fontDisplay, fontSize: 18, color: theme.textPrimary }}>
                  {viewMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => {
                    const d = new Date(viewMonthDate);
                    d.setMonth(d.getMonth() + 1);
                    setViewMonthDate(d);
                  }} style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}>
                    <ChevronRight size={24} />
                  </button>
                  <button onClick={() => setShowMonthly(false)} style={{ background: 'none', border: 'none', color: theme.textSecondary, fontSize: 24, cursor: 'pointer' }}>×</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                {/* Day of Week Headers */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={`header-${i}`} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: theme.textSecondary, ...fontBody }}>
                    {d}
                  </div>
                ))}
                
                {/* Blank Padding for First Day */}
                {Array.from({ length: new Date(viewMonthDate.getFullYear(), viewMonthDate.getMonth(), 1).getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}

                {/* Month Grid */}
                {Array.from({ length: new Date(viewMonthDate.getFullYear(), viewMonthDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                  const day = i + 1;
                  const currentYear = viewMonthDate.getFullYear();
                  const currentMonth = viewMonthDate.getMonth();
                  const dObj = new Date(currentYear, currentMonth, day);
                  const dateStr = getLocalDateString(dObj);
                  const isStreakDay = activeDays.includes(dateStr);
                  
                  return (
                    <NeoSurface 
                      key={day}
                      pressed={!isStreakDay} 
                      style={{ 
                        aspectRatio: '1', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: isStreakDay ? 800 : 600,
                        color: isStreakDay ? theme.accent : theme.textSecondary,
                        background: isStreakDay ? theme.bg : undefined,
                        boxShadow: isStreakDay ? theme.shadowRaisedSm : undefined
                      }}
                    >
                      {day}
                    </NeoSurface>
                  )
                })}
              </div>
            </NeoSurface>
          </div>
        </div>
      )}
    </div>
  );
}
