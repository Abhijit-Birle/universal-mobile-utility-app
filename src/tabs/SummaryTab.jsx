import { useState, useEffect, useRef } from 'react';
import { useTodos, generateId } from '../hooks/useTodos.js';


import { getLocalDateString } from '../utils/date.js';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { Flame, Check, ChevronLeft, ChevronRight, Upload, Plus, Play, Pause, RotateCcw, ArrowUp, X, User } from 'lucide-react';
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import Strands from '../components/Strands.jsx';
import WheelPicker from '../components/ui/WheelPicker.jsx';
import LiquidWave from '../components/ui/LiquidWave.jsx';
import Icon from '../components/ui/Icon.jsx';
import DatePicker from '../components/ui/DatePicker.jsx';
import TimePicker from '../components/ui/TimePicker.jsx';
import ReminderPicker from '../components/ui/ReminderPicker.jsx';

const fmt = (n) => `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const pad = (n) => String(n).padStart(2, '0');

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

function interpolateRgb(color1, color2, factor) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
  const g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
  const b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
  return `rgb(${r}, ${g}, ${b})`;
}

function polarToXY(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// ponytail: interactive focus timer for Summary
function SummaryFocusTimer({ theme, fontDisplay, fontBody, timerState, liveRemaining, setDuration, startTimer, pauseTimer, stopTimer, onNavigate, addTime }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMins, setCustomMins] = useState(0);

  const isRunning = timerState.isRunning;
  const isPaused = !isRunning && liveRemaining < timerState.durationSeconds && liveRemaining > 0;
  
  const totalSeconds = timerState.durationSeconds || 1;
  const progress = isRunning || isPaused ? (totalSeconds - liveRemaining) / totalSeconds : 1;
  
  const CX = 145, CY = 145;
  const R_OUTER = 112;
  const R_NEEDLE = 82;
  const TICK_COUNT = 60;
  
  const circumference = 2 * Math.PI * R_OUTER;
  const strokeDashoffset = circumference * (1 - progress);
  const needleAngle = progress * 360;
  const needleTip = polarToXY(CX, CY, R_NEEDLE, needleAngle);
  
  const isDark = theme.bg.includes('1c') || theme.bg.includes('22') || theme.bg.includes('1e') || theme.bg.includes('2b');
  const trackColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const tickDimColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const lightShadow = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.4)';
  const darkShadow = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)';
  
  let dynamicColor = theme.accent;
  if (isRunning || isPaused) {
    const remainingRatio = liveRemaining / totalSeconds;
    if (remainingRatio > 0.5) {
      const factor = (1 - remainingRatio) * 2;
      dynamicColor = interpolateRgb(theme.accent, '#F59E0B', factor);
    } else {
      const factor = (0.5 - remainingRatio) * 2;
      dynamicColor = interpolateRgb('#F59E0B', '#EF4444', factor);
    }
  }
  const tickLitColor = dynamicColor;

  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const angle = (i / TICK_COUNT) * 360;
    const isMajor = i % 5 === 0;
    const r1 = R_OUTER + (isMajor ? 14 : 9);
    const r2 = R_OUTER + (isMajor ? 22 : 16);
    const p1 = polarToXY(CX, CY, r1, angle);
    const p2 = polarToXY(CX, CY, r2, angle);
    return { p1, p2, isMajor, angle };
  });

  const handleStart = (e) => { e.stopPropagation(); try { Haptics.impact({ style: ImpactStyle.Light }); } catch(err) {} startTimer(); };
  const handlePause = (e) => { e.stopPropagation(); try { Haptics.impact({ style: ImpactStyle.Light }); } catch(err) {} pauseTimer(liveRemaining); };
  const handleStop = (e) => { e.stopPropagation(); try { Haptics.impact({ style: ImpactStyle.Light }); } catch(err) {} stopTimer(); };
  
  const setPreset = (mins, e) => {
    if (e) e.stopPropagation();
    setShowCustom(false);
    setDuration(mins * 60);
  };
  const handleSetCustom = (e) => {
    e.stopPropagation();
    setShowCustom(false);
    setDuration(customHours * 3600 + customMins * 60);
  };

  const formatTime = (s) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', padding: '4px 0' }}>
      
      {/* LEFT: Timer Circle */}
      <div 
        onClick={onNavigate}
        style={{ position: 'relative', width: 100, height: 100, flexShrink: 0, cursor: 'pointer' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: 290, height: 290, transform: 'scale(0.3448)', transformOrigin: 'top left' }}>
           <svg width="100%" height="100%" viewBox="0 0 290 290" style={{ position: 'absolute', top: 0, left: 0 }}>
             {/* === Layer 0 — tick ring (outermost) === */}
             {ticks.map((t, i) => {
               const lit = progress > 0 && (i / TICK_COUNT) <= progress;
               return (
                 <line key={i} x1={t.p1.x} y1={t.p1.y} x2={t.p2.x} y2={t.p2.y} stroke={lit ? tickLitColor : tickDimColor} strokeWidth={t.isMajor ? 2.5 : 1.5} strokeLinecap="round" style={{ transition: 'stroke 1s linear' }} />
               );
             })}

             {/* === Layer 1 — track ring === */}
             <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke={trackColor} strokeWidth={14} />

             {/* === Layer 2 — progress arc (glowing) === */}
             <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke={dynamicColor} strokeWidth={14} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} transform={`rotate(-90 ${CX} ${CY})`} style={{ transition: 'stroke-dashoffset 1s linear, stroke 1s linear, filter 1s linear', filter: `drop-shadow(0 0 6px ${dynamicColor}80)` }} />

             {/* === Layer 3 — outer recessed circle === */}
             <circle cx={CX} cy={CY} r={R_OUTER - 18} fill={theme.bg} style={{ filter: `drop-shadow(2px 2px 5px ${darkShadow}) drop-shadow(-2px -2px 5px ${lightShadow})` }} />

             {/* === Layer 4 — middle raised platform === */}
             <circle cx={CX} cy={CY} r={72} fill={theme.bg} style={{ filter: `drop-shadow(-3px -3px 6px ${lightShadow}) drop-shadow(3px 3px 6px ${darkShadow})` }} />

             {/* === Layer 5 — innermost recessed center === */}
             <circle cx={CX} cy={CY} r={54} fill={theme.bg} style={{ filter: `drop-shadow(inset 2px 2px 5px ${darkShadow}) drop-shadow(inset -2px -2px 5px ${lightShadow})` }} />

             {/* === Needle === */}
             {(isRunning || isPaused) && (
               <>
                 <line x1={CX + 1} y1={CY + 1} x2={needleTip.x + 1} y2={needleTip.y + 1} stroke={darkShadow} strokeWidth={3} strokeLinecap="round" />
                 <line x1={CX} y1={CY} x2={needleTip.x} y2={needleTip.y} stroke={dynamicColor} strokeWidth={2.5} strokeLinecap="round" style={{ transition: 'x2 1s linear, y2 1s linear, stroke 1s linear' }} />
                 <circle cx={CX} cy={CY} r={5} fill={dynamicColor} style={{ transition: 'fill 1s linear' }} />
                 <circle cx={CX} cy={CY} r={2.5} fill={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.8)'} />
                 <circle cx={needleTip.x} cy={needleTip.y} r={5} fill={dynamicColor} style={{ filter: `drop-shadow(0 0 4px ${dynamicColor})`, transition: 'cx 1s linear, cy 1s linear, fill 1s linear, filter 1s linear' }} />
               </>
             )}
           </svg>

           {/* Dynamic Liquid Wave Visualization */}
           {(isRunning || isPaused) && (
             <div style={{ position: 'absolute', top: CY - 54, left: CX - 54, width: 108, height: 108, borderRadius: '50%', overflow: 'hidden', pointerEvents: 'none' }}>
               <LiquidWave progress={progress} color={dynamicColor} backgroundColor={theme.bg} size={108} />
             </div>
           )}

           <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
             <div style={{ fontSize: 36, fontWeight: 700, color: theme.textPrimary, letterSpacing: '-0.5px', ...fontDisplay }}>
               {formatTime(liveRemaining)}
             </div>
             <div style={{ fontSize: 16, fontWeight: 700, color: theme.textSecondary, textTransform: 'uppercase', marginTop: 4, ...fontBody }}>
               {isRunning ? 'remaining' : 'set time'}
             </div>
           </div>
        </div>
      </div>

      {/* RIGHT: Controls */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        {!isRunning && (
          showCustom ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
               <div style={{ height: 90, display: 'flex', gap: 16, background: theme.surface, borderRadius: 16, padding: '4px 16px', boxShadow: `inset 2px 2px 5px ${darkShadow}, inset -2px -2px 5px ${lightShadow}` }}>
                 <WheelPicker options={Array.from({length:13},(_,i)=>i)} value={customHours} onChange={setCustomHours} label="h" theme={theme} itemHeight={28} fontSize={16} />
                 <WheelPicker options={Array.from({length:60},(_,i)=>i)} value={customMins} onChange={setCustomMins} label="m" theme={theme} itemHeight={28} fontSize={16} />
               </div>
               <button onClick={handleSetCustom} style={{ padding: '6px 20px', borderRadius: 12, background: theme.accent, color: '#fff', border: 'none', fontWeight: 600, ...fontBody, cursor: 'pointer' }}>
                 Set
               </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[5, 10, 15, 20].map(min => {
                const active = (timerState.durationSeconds === min * 60);
                return (
                  <button key={min} onClick={(e) => setPreset(min, e)} style={{ 
                    height: 28, padding: '0 12px',
                    background: theme.bg, color: active ? theme.accent : theme.textSecondary,
                    boxShadow: active ? theme.shadowInset : theme.shadowRaisedSm,
                    border: 'none', borderRadius: 14, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    outline: active ? `2px solid ${theme.accent}55` : 'none',
                    transition: 'all 0.25s'
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1, ...fontDisplay }}>
                      {String(min).padStart(2, '0')}m
                    </div>
                  </button>
                );
              })}
              <button onClick={(e) => { 
                e.stopPropagation(); 
                setCustomHours(Math.floor(timerState.durationSeconds / 3600));
                setCustomMins(Math.floor((timerState.durationSeconds % 3600) / 60));
                setShowCustom(true); 
              }} style={{ 
                height: 28, padding: '0 12px',
                background: theme.bg, color: theme.textSecondary,
                boxShadow: theme.shadowRaisedSm, border: 'none', borderRadius: 14, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', transition: 'all 0.25s'
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, ...fontBody }}>...</div>
              </button>
            </div>
          )
        )}
        {liveRemaining <= 15 && liveRemaining > 0 && timerState.isRunning && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 4 }}>
            <button
              onClick={(e) => { e.stopPropagation(); if (addTime) addTime(60); }}
              style={{
                background: theme.bg, border: "none", color: theme.textSecondary,
                padding: "6px 14px", borderRadius: 12, boxShadow: theme.shadowRaisedSm,
                fontSize: 12, fontWeight: 700, cursor: "pointer", ...fontBody
              }}
            >
              +1 min
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (addTime) addTime(300); }}
              style={{
                background: theme.bg, border: "none", color: theme.textSecondary,
                padding: "6px 14px", borderRadius: 12, boxShadow: theme.shadowRaisedSm,
                fontSize: 12, fontWeight: 700, cursor: "pointer", ...fontBody
              }}
            >
              +5 min
            </button>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          {isPaused && (
             <button onClick={handleStop} style={{ 
               width: 36, height: 36, borderRadius: '50%', background: theme.bg, 
               boxShadow: theme.shadowRaisedSm, border: 'none', color: theme.textSecondary, 
               display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
             }}>
                <RotateCcw size={16} />
             </button>
          )}
          {(!isRunning || isPaused || isRunning) && !showCustom && (
             <button onClick={isRunning ? handlePause : handleStart} style={{ 
               width: 44, height: 44, borderRadius: '50%', 
               background: isRunning ? theme.bg : theme.accent, 
               boxShadow: isRunning ? theme.shadowInset : `0 4px 12px ${theme.accent}70, 0 2px 4px ${theme.accent}50`, 
               border: 'none', color: isRunning ? theme.accent : '#fff', 
               display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.25s' 
             }}>
               {isRunning ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 3 }} />}
             </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SummaryTab({ theme, NeoSurface, NeoInput, fontDisplay, fontBody, onNavigate, transactions = [], streak = 0, activeDays = [], monthlyActiveCount = 0, daysInMonth = 30, yearlyActiveCount = 0, daysInYear = 365, onShowForm, isImporting, onImportStatement, totalBudget = 0, focusTimer }) {
  const { todos, toggleDone, addTodo } = useTodos();
  const { timerState, setDuration, startTimer, pauseTimer, stopTimer } = focusTimer;

  const [showMonthly, setShowMonthly] = useState(false);
  const [viewMonthDate, setViewMonthDate] = useState(new Date());
  const [magicText, setMagicText] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [showQuickAddExtras, setShowQuickAddExtras] = useState(false);
  const [quickAddDue, setQuickAddDue] = useState('');
  const [quickAddDueTime, setQuickAddDueTime] = useState('');
  const [quickAddReminder, setQuickAddReminder] = useState('');
  const [quickAddSubtasks, setQuickAddSubtasks] = useState([]);
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
      if (e.date === 'Today' || e.date === today) return true;
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);
  const safeToSpend = Math.max(0, Math.floor((totalBudget - monthSpend) / daysLeft));

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

  // Timer live countdown is handled by App.jsx passing down timerState.remainingSeconds

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
          
          {/* Label */}
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.textPrimary, ...fontBody, marginBottom: 4 }}>
            Daily check-in
          </div>
          
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
            <div style={{ fontSize: 22, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>{fmt(totalBudget > 0 ? safeToSpend : todaySpend)}</div>
            <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2, ...fontBody }}>
              {totalBudget > 0 ? 'Safe to spend/day' : 'Today\'s Spend'}
            </div>
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
              <div style={{ position: "relative", zIndex: 1, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", overflow: "hidden" }}>
                <Strands colors={["#F97316","#7C3AED","#06B6D4"]} count={4} speed={1.7} amplitude={2.1} waviness={1.6} thickness={0.7} glow={2.6} taper={3} spread={1} intensity={0.7} saturation={1.5} opacity={1} scale={1.3} glass refraction={1.35} dispersion={1} glassSize={1} hueShift={0.26} />
              </div>
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
      <div 
        style={{ ...card, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
        onClick={() => onNavigate('todo')}
      >
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
                  onClick={(e) => { e.stopPropagation(); toggleDone(task.id); }}
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
        <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 14 }}>
          {showQuickAddExtras && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <NeoSurface pressed style={{ flex: 1, padding: '10px 14px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DatePicker
                    value={quickAddDue}
                    onChange={setQuickAddDue}
                    theme={theme}
                    fontBody={fontBody}
                    placeholder="Due date"
                  />
                </NeoSurface>
                <NeoSurface pressed style={{ flex: 1, padding: '10px 14px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TimePicker
                    value={quickAddDueTime}
                    onChange={setQuickAddDueTime}
                    theme={theme}
                    fontBody={fontBody}
                    placeholder="Due time"
                  />
                </NeoSurface>
              </div>
              <NeoSurface pressed style={{ padding: '10px 14px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ReminderPicker
                  value={quickAddReminder}
                  onChange={setQuickAddReminder}
                  theme={theme}
                  fontBody={fontBody}
                  placeholder="Set reminder"
                />
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
                    style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', color: st.text ? theme.accent : theme.textPrimary, fontSize: 14, outline: 'none', ...fontBody }}
                  />
                  <button 
                    onClick={() => setQuickAddSubtasks(prev => prev.filter((_, idx) => idx !== i))}
                    style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    <Icon name="trash-2" size={14} />
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
          <form onSubmit={(e) => {
            e.preventDefault();
            if (newTaskText.trim()) {
              addTodo({ 
                text: newTaskText.trim(), 
                myDayDate: today,
                due: quickAddDue || null,
                dueTime: quickAddDueTime || null,
                reminder: quickAddReminder || null,
                subtasks: quickAddSubtasks.filter(s => s.text.trim().length > 0)
              });
              setNewTaskText('');
              setQuickAddDue('');
              setQuickAddDueTime('');
              setQuickAddReminder('');
              setQuickAddSubtasks([]);
              setShowQuickAddExtras(false);
            }
          }}>
            <NeoSurface pressed style={{ padding: '4px 8px', borderRadius: 24, display: 'flex', alignItems: 'center' }}>
              <button 
                type="button"
                onClick={() => setShowQuickAddExtras(!showQuickAddExtras)}
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: showQuickAddExtras || quickAddDue || quickAddReminder ? theme.accent : theme.textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <Icon name="sliders" size={18} />
              </button>
              <input 
                type="text"
                placeholder="Add a task for today..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                style={{ 
                  flex: 1, background: 'transparent', border: 'none', 
                  color: theme.textPrimary, fontSize: 15, padding: '8px 12px', 
                  outline: 'none', ...fontBody 
                }}
              />
              <button 
                type="submit" 
                disabled={!newTaskText.trim()}
                style={{ 
                  width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: '#fff', background: newTaskText.trim() ? theme.accent : theme.textSecondary, 
                  border: 'none', cursor: newTaskText.trim() ? 'pointer' : 'default', padding: 0, transition: 'background 0.2s'
                }}
              >
                <ArrowUp size={18} />
              </button>
            </NeoSurface>
          </form>
        </div>
      </div>

      {/* Focus Timer */}
      <div style={{ 
        ...card, 
        position: 'relative', 
        overflow: 'hidden',
        animation: timerState.isRunning ? 'pulseTimer 2s infinite' : 'none',
        padding: '16px 20px'
      }}>
        <style>{`
          @keyframes pulseTimer {
            0% { box-shadow: 0 0 0 0 ${theme.accent}40; }
            70% { box-shadow: 0 0 0 10px ${theme.accent}00; }
            100% { box-shadow: 0 0 0 0 ${theme.accent}00; }
          }
        `}</style>
        
        <SummaryFocusTimer
          theme={theme}
          fontDisplay={fontDisplay}
          fontBody={fontBody}
          timerState={timerState}
          liveRemaining={timerState.remainingSeconds}
          setDuration={setDuration}
          startTimer={startTimer}
          pauseTimer={pauseTimer}
          stopTimer={stopTimer}
          addTime={focusTimer.addTime}
          onNavigate={() => onNavigate('timer')}
        />
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
