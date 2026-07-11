import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import * as LucideIcons from 'lucide-react';
import { getLocalDateString, getLocalToday, getLocalTime } from '../utils/date.js';
import { formatCurrency } from '../utils/currency.js';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import LiquidWave from "../components/ui/LiquidWave.jsx";
import WheelPicker from "../components/ui/WheelPicker.jsx";
import SplitText from "../components/ui/SplitText.jsx";


export default function TimerTab(props) {
  const {
    show, setShow, copyMsg, setCopyMsg, activeTab, setActiveTab, swipeToast, setSwipeToast, swipeToastKey, setSwipeToastKey, swipeToastTimer, navBarRef, hasSeenNavHint, setHasSeenNavHint, history, setHistory, historyLoading, dailyGoalMinutes, setDailyGoalMinutes, hours, setHours, showCustomTimer, setShowCustomTimer, minutes, setMinutes, seconds, setSeconds, name, setName, isRunning, setIsRunning, remaining, setRemaining, activeSource, setActiveSource, audioUrl, setAudioUrl, youtubeId, setYoutubeId, isPlaying, setIsPlaying, volume, setVolume, isMuted, setIsMuted, activeCategoryPie, setActiveCategoryPie, fileInputRef, audioRef, audioCtxRef, oscillatorIntervalRef, alarmTimeoutRef, ytPlayerRef, ytLink, setYtLink, svgRef, mode, setMode, pomoPhase, setPomoPhase, pomoCycle, setPomoCycle, pomoFocusDuration, setPomoFocusDuration, pomoBreakDuration, setPomoBreakDuration, pomoMaxCycles, setPomoMaxCycles, transactions, setTransactions, transactionsLoading, linkedTodo, setLinkedTodo, showTodoPicker, setShowTodoPicker, showNoteModal, setShowNoteModal, sessionNote, setSessionNote, currentSessionId, setCurrentSessionId, migrationDoneRef, customCategories, setCustomCategories, customCategoryIcons, setCustomCategoryIcons, customIncomeCategories, setCustomIncomeCategories, todos, incrementPomodoro, toggleDone, updateTodo, categoryBudgets, setCategoryBudgets, upcomingBills, setUpcomingBills, billsLoading, showDailyGoalModal, setShowDailyGoalModal, tempDailyGoal, setTempDailyGoal, banks, setBanks, banksLoading, showBanksList, setShowBanksList, showBankForm, setShowBankForm, editingBankId, setEditingBankId, showCategoryForm, setShowCategoryForm, showManageCategories, setShowManageCategories, showCalendarWidget, setShowCalendarWidget, newCategoryName, setNewCategoryName, newCategoryIcon, setNewCategoryIcon, newCategoryType, setNewCategoryType, bankFormState, setBankFormState, showForm, setShowForm, showEditBalanceModal, setShowEditBalanceModal, editingBalanceAcc, setEditingBalanceAcc, tempBalance, setTempBalance, showBillModal, setShowBillModal, editingBill, setEditingBill, billFormState, setBillFormState, monthOffset, setMonthOffset, selectedDate, setSelectedDate, filterType, setFilterType, filterBank, setFilterBank, filterStartDate, setFilterStartDate, filterEndDate, setFilterEndDate, filterCategory, setFilterCategory, visibleTxCount, setVisibleTxCount, bankTxFilterType, setBankTxFilterType, bankTxFilterCategory, setBankTxFilterCategory, newAmount, setNewAmount, newDesc, setNewDesc, newCurrency, setNewCurrency, newExchangeRate, setNewExchangeRate, newCat, setNewCat, newType, setNewType, newDate, setNewDate, newTime, setNewTime, showCategoryDrawer, setShowCategoryDrawer, newMethod, setNewMethod, editingTxId, setEditingTxId, activeAccount, setActiveAccount, showBudgetModal, setShowBudgetModal, showBudgetDropdown, setShowBudgetDropdown, activeReminders, setActiveReminders, showBreathing, setShowBreathing, activeTechnique, setActiveTechnique, showReflectionHistory, setShowReflectionHistory, dailyIntention, setDailyIntention, dailyMood, setDailyMood, eveningReflection, setEveningReflection, dailyGratitude, setDailyGratitude, meditationDuration, setMeditationDuration, meditationTimeLeft, setMeditationTimeLeft, isMeditating, setIsMeditating, darkMode, setDarkMode, baseCurrency, setBaseCurrency, query, setQuery, loading, setLoading, insight, setInsight, askInput, setAskInput, askAnswer, setAskAnswer, asking, setAsking, generating, setGenerating, generatedInsight, setGeneratedInsight, apiKey, setApiKey, direction, setDirection, showInsights, setShowInsights, expenseView, setExpenseView, walletCardIndex, setWalletCardIndex, showRuleModal, setShowRuleModal, showWipeConfirm, setShowWipeConfirm, customCategoryRules, setCustomCategoryRules, importReviews, setImportReviews, updateBankBalance, setUpdateBankBalance, editableBankName, setEditableBankName, isImporting, setIsImporting, importErrorMsg, setImportErrorMsg, duplicateWarning, setDuplicateWarning, showImportConsent, setShowImportConsent, pendingImportFiles, setPendingImportFiles, showImportCelebration, setShowImportCelebration, importedCount, setImportedCount, lastImportSnapshot, setLastImportSnapshot, importSnapshotLoading, touchData, isOpen, setIsOpen, open, setOpen, containerRef, viewDate, setViewDate,
    theme, fontDisplay, fontBody, NeoSurface, NeoInput, PrimaryButton, IconBtn, SectionLabel, NeoSelect, CollapsibleSection, ALL_EXPENSE_CATEGORIES, ALL_INCOME_CATEGORIES, getDailyAvgSpend, markDayActive, updateBalanceForMethod, BankBadge, CATEGORY_KEYWORD_MAP, TX_CATEGORY_ICONS, ICON_OPTIONS, BANK_ICONS, handleFileUpload, handleImportStatement, PRESET_BANKS,
    NeoDatePicker, TimePicker, playAlarm, stopAlarm, initAudioCtx, autoTimerName, resetTimer, extractYoutubeId, handlePlayPause,
    methodLabel, dailyAvgSpend, currentMonthTx, spentThisMonth, incomeThisMonth, netSavings, monthlyBurnRate, spentByCategory, pieData, categoryPieData, txByDay, dayFiltered, targetYearStr, targetMonthStr, monthLabel, daysInMonth, BUDGETS, MUSIC_OPTIONS
  } = props;
  
  const { Play, Pause, Square, Music, Volume2, VolumeX, List, Check, X, Target, BarChart2, CheckCircle2, ChevronRight, Settings2, Clock, Upload, XCircle, LayoutDashboard, Settings, Edit, Bell, ListChecks, Flame, Plus, Trash2, Edit2, Search, ChevronDown, Download, Eye, Tag, RefreshCw, DollarSign, Filter, ShoppingCart, Smartphone, Landmark, Calendar, AlertTriangle, ArrowRight, ChevronLeft, Flower2, PiggyBank, Box, MonitorPlay, TimerIcon, Wallet, User, Notebook, Home, Building2, TrendingDown, TrendingUp, RotateCcw, StopCircle, PlayCircle, PauseCircle, Pencil, ChevronUp } = LucideIcons;

    const LINKABLE_TODOS = todos.filter(t => !t.done);

    // Pomodoro mode


    // Daily goal
    const now = new Date();
    const todayStr = now.toDateString();
    const minutesLoggedToday = history
      .filter(h => new Date(h.id).toDateString() === todayStr)
      .reduce((acc, curr) => acc + curr.minutes, 0);

    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);
    const daysThisWeekWithFocus = new Set(
      history
        .filter(h => h.id >= startOfWeek.getTime())
        .map(h => new Date(h.id).toDateString())
    ).size;

    // Post-session note

    // Analytics Data

    // Heatmap Data (Last 28 days)
    const last28Days = Array.from({ length: 28 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (27 - i));
      return d.toISOString().split("T")[0];
    });

    const heatmapData = last28Days.map(dateStr => {
      const sum = history.filter(h => h.date && h.date.startsWith(dateStr)).reduce((a, b) => a + b.minutes, 0);
      return { date: dateStr, minutes: sum };
    });

    // Time Distribution (Today)
    const historyToday = history.filter(h => h.date && (h.date.startsWith(todayStr) || h.date === "Just now"));
    const distribution = historyToday.reduce((acc, h) => {
      const cat = h.category || "Personal";
      acc[cat] = (acc[cat] || 0) + h.minutes;
      return acc;
    }, {});
    const catColors = { Work: theme.accent, Study: theme.accent2, Personal: "#ff9f43", undefined: "#9e9e9e" };
    const distTotal = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
    let distAccum = 0;

    const svgSize = 280;
    const center = svgSize / 2;
    const r = 90;
    const circumference = 2 * Math.PI * r;
    const progress = Math.min(minutes, 60) / 60;
    const dashOffset = circumference * (1 - progress);
    const angleRad = (progress * 360 - 90) * (Math.PI / 180);
    const knobX = center + r * Math.cos(angleRad);
    const knobY = center + r * Math.sin(angleRad);
    const ticks = Array.from({ length: 40 }).map((_, i) => {
      const a = (i / 40) * 360 * (Math.PI / 180);
      return {
        x1: center + 115 * Math.cos(a),
        y1: center + 115 * Math.sin(a),
        x2: center + 125 * Math.cos(a),
        y2: center + 125 * Math.sin(a)
      };
    });

    const toggleTimer = () => {
      stopAlarm();
      if (!isRunning && !name) setName(autoTimerName(minutes));

      const willRun = !isRunning;
      
      if (willRun && mode === "pomodoro" && pomoPhase === "Focus" && pomoCycle === 1) {
        setPomoFocusDuration(minutes);
      }

      setIsRunning(willRun);
      if (willRun) setIsPaused(false);

      initAudioCtx();
      setIsPlaying(willRun);
      if (willRun) {
        if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.playVideo) ytPlayerRef.current.playVideo();
        else if (audioRef.current) audioRef.current.play().catch(e => console.error("Audio error:", e));
      } else {
        if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
        else if (audioRef.current) audioRef.current.pause();
      }
    };

    const startTimerFor = (h, m, s) => {
      setHours(h); setMinutes(m); setSeconds(s); setRemaining(h * 3600 + m * 60 + s);
      stopAlarm();
      if (!name) setName(autoTimerName(m));
      if (mode === "pomodoro" && pomoPhase === "Focus" && pomoCycle === 1) {
        setPomoFocusDuration(m);
      }
      setIsRunning(true);
      setIsPaused(false);
      initAudioCtx();
      setIsPlaying(true);
      if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.playVideo) ytPlayerRef.current.playVideo();
      else if (audioRef.current) audioRef.current.play().catch(e => console.error("Audio error:", e));
    };

    return (
      <div style={{ padding: "18px 18px 100px" }}>

        <NeoSurface style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden", maxWidth: 460, margin: "0 auto" }}>

          {mode === "pomodoro" && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: pomoPhase === "Focus" ? theme.accent : theme.accent2, fontWeight: 700, fontSize: 12.5, ...fontBody }}>{pomoPhase} phase</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[...Array(pomoMaxCycles)].map((_, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i <= ((pomoCycle - 1) % pomoMaxCycles) + (pomoPhase === "Break" ? 1 : 0) ? theme.accent : (darkMode ? "#3a4051" : "#c9cfda") }} />
                  ))}
                </div>
                <span style={{ color: theme.textSecondary, fontSize: 11, ...fontBody }}>Cycle {pomoCycle}</span>
              </div>
              

            </div>
          )}

          <div style={{ width: "100%", position: "relative", zIndex: 1, marginBottom: 20 }}>
            <NeoInput
              placeholder={autoTimerName(minutes) + " (auto if left blank)"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ textAlign: "center", fontSize: 14, fontWeight: 600, padding: "10px 14px" }}
            />

            <button onClick={() => setShowTodoPicker((v) => !v)} style={{
              marginTop: 10, width: "100%", border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm,
              borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, color: linkedTodo ? theme.accent : theme.textSecondary, fontSize: 13, fontWeight: 600, ...fontBody, cursor: "pointer"
            }}>
              <Target size={16} />
              {linkedTodo ? `Focus on: ${todos.find(t => t.id === linkedTodo)?.text || 'Unknown Task'}` : "Link to a todo (optional)"}
              <ChevronDown size={16} style={{ marginLeft: "auto" }} />
            </button>
            {showTodoPicker && (
              <div style={{ position: "relative", zIndex: 2, width: "100%", marginTop: 8, display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto", padding: 4 }}>
                <button onClick={() => { setLinkedTodo(null); setShowTodoPicker(false); }} style={{
                  textAlign: "left", border: "none", background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 12,
                  padding: "10px 14px", color: theme.textSecondary, fontSize: 13, fontWeight: 500, ...fontBody, cursor: "pointer"
                }}>None</button>
                {LINKABLE_TODOS.map((t) => (
                  <button key={t.id} onClick={() => { setLinkedTodo(t.id); setShowTodoPicker(false); }} style={{
                    textAlign: "left", border: "none", background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 12,
                    padding: "10px 14px", color: theme.textPrimary, fontSize: 13, fontWeight: 500, ...fontBody, display: "flex", justifyContent: "space-between", cursor: "pointer"
                  }}>
                    <span>{t.text}</span>
                    <span style={{ color: theme.accent, fontSize: 12, fontWeight: 600 }}>🍅 {t.pomodorosCompleted || 0}</span>
                  </button>
                ))}
              </div>
            )}
            {linkedTodo && (() => {
              const t = todos.find(x => x.id === linkedTodo);
              if (!t) return null;
              return (
                <div style={{ marginTop: 14, width: "100%", position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, background: theme.bg, boxShadow: theme.shadowPressed }}>
                  <button onClick={() => toggleDone(t.id)} style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: theme.bg, boxShadow: t.done ? theme.shadowPressed : theme.shadowRaisedSm, color: t.done ? theme.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    {t.done && <Check size={14} />}
                  </button>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <span style={{ color: t.done ? theme.textSecondary : theme.textPrimary, fontSize: 14, textDecoration: t.done ? "line-through" : "none", fontWeight: 500, ...fontBody }}>{t.text}</span>
                    {t.note && <span style={{ color: theme.textSecondary, fontSize: 12, marginTop: 3, ...fontBody }}>{t.note.slice(0, 40)}{t.note.length > 40 ? '...' : ''}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${theme.accent}15`, padding: "6px 12px", borderRadius: 14 }}>
                    <span style={{ fontSize: 15 }}>🍅</span>
                    <span style={{ color: theme.accent, fontSize: 14, fontWeight: 700, ...fontDisplay }}>
                      {t.pomodorosCompleted || 0} <span style={{ opacity: 0.5 }}>/</span> {t.pomodorosEstimated || 0}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginLeft: 6 }}>
                      <button onClick={() => updateTodo(t.id, { pomodorosEstimated: (t.pomodorosEstimated || 0) + 1 })} style={{ width: 16, height: 16, borderRadius: 5, background: theme.bg, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: theme.textPrimary, boxShadow: theme.shadowRaisedSm }}><ChevronUp size={12} /></button>
                      <button onClick={() => updateTodo(t.id, { pomodorosEstimated: Math.max(0, (t.pomodorosEstimated || 0) - 1) })} style={{ width: 16, height: 16, borderRadius: 5, background: theme.bg, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: theme.textPrimary, boxShadow: theme.shadowRaisedSm }}><ChevronDown size={12} /></button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {(() => {
            const totalSecs = (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0) || 1;
            const isPaused = !isRunning && remaining < totalSecs && remaining > 0;
            const prog = isRunning || isPaused ? (remaining / totalSecs) : 0;
            const elapsed = 1 - prog;
            const CX = 145, CY = 145, R_OUTER = 112, R_NEEDLE = 82;
            const circumference = 2 * Math.PI * R_OUTER;
            const strokeDashoffset = circumference * (1 - elapsed);
            const needleAngle = elapsed * 360;
            const needleRad = (needleAngle - 90) * (Math.PI / 180);
            const needleTipX = CX + R_NEEDLE * Math.cos(needleRad);
            const needleTipY = CY + R_NEEDLE * Math.sin(needleRad);
            const isDark = darkMode;

            const hexToRgb = (hex) => {
              const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
              hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
              return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
            };

            const interpolateRgb = (color1, color2, factor) => {
              const c1 = hexToRgb(color1);
              const c2 = hexToRgb(color2);
              const r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
              const g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
              const b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
              return `rgb(${r}, ${g}, ${b})`;
            };

            let dynamicColor = theme.accent;
            if (isRunning || isPaused) {
              if (prog > 0.5) {
                const factor = (1 - prog) * 2;
                dynamicColor = interpolateRgb(theme.accent, '#F59E0B', factor);
              } else {
                const factor = (0.5 - prog) * 2;
                dynamicColor = interpolateRgb('#F59E0B', '#EF4444', factor);
              }
            }

            const TICK_COUNT = 60;
            const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
              const a = ((i / TICK_COUNT) * 360 - 90) * (Math.PI / 180);
              const isMajor = i % 5 === 0;
              const r1 = R_OUTER + (isMajor ? 14 : 9);
              const r2 = R_OUTER + (isMajor ? 22 : 16);
              return { x1: CX + r1 * Math.cos(a), y1: CY + r1 * Math.sin(a), x2: CX + r2 * Math.cos(a), y2: CY + r2 * Math.sin(a), isMajor, lit: (isRunning || isPaused) && ((i / TICK_COUNT) <= elapsed) };
            });

            const lightShadow = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.4)';
            const darkShadow = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)';
            
            const displaySecs = isRunning || isPaused ? remaining : totalSecs;

            return (
              <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: 260, width: "100%", marginBottom: 20 }}>
                <div 
                  onClick={toggleTimer}
                  style={{ position: "relative", width: 260, height: 260, cursor: "pointer", transition: "transform 0.1s" }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="100%" height="100%" viewBox="0 0 290 290" style={{ position: "absolute", top: 0, left: 0 }}>
                    {/* Tick marks */}
                    {ticks.map((t, i) => (
                      <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                        stroke={t.lit ? dynamicColor : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}
                        strokeWidth={t.isMajor ? 2.5 : 1.5} strokeLinecap="round"
                        style={{ transition: "stroke 1s linear" }} />
                    ))}
                    {/* Track */}
                    <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} strokeWidth={14} />
                    {/* Progress arc */}
                    <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke={dynamicColor} strokeWidth={14}
                      strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                      transform={`rotate(-90 ${CX} ${CY})`}
                      style={{ transition: "stroke-dashoffset 1s linear, stroke 1s linear, filter 1s linear", filter: `drop-shadow(0 0 6px ${dynamicColor}80)` }} />
                    {/* Inset bowl */}
                    <circle cx={CX} cy={CY} r={R_OUTER - 18} fill={theme.bg}
                      style={{ filter: `drop-shadow(2px 2px 5px ${darkShadow}) drop-shadow(-2px -2px 5px ${lightShadow})` }} />
                    {/* Middle raised */}
                    <circle cx={CX} cy={CY} r={72} fill={theme.bg}
                      style={{ filter: `drop-shadow(-3px -3px 6px ${lightShadow}) drop-shadow(3px 3px 6px ${darkShadow})` }} />
                    {/* Inner recessed */}
                    <circle cx={CX} cy={CY} r={54} fill={theme.bg}
                      style={{ filter: `drop-shadow(inset 2px 2px 5px ${darkShadow}) drop-shadow(inset -2px -2px 5px ${lightShadow})` }} />
                    {/* Needle */}
                    {(isRunning || isPaused) && (
                      <>
                        <line x1={CX+1} y1={CY+1} x2={needleTipX+1} y2={needleTipY+1} stroke={darkShadow} strokeWidth={3} strokeLinecap="round" />
                        <line x1={CX} y1={CY} x2={needleTipX} y2={needleTipY} stroke={dynamicColor} strokeWidth={2.5} strokeLinecap="round" style={{ transition: "x2 1s linear, y2 1s linear, stroke 1s linear" }} />
                        <circle cx={CX} cy={CY} r={5} fill={dynamicColor} style={{ transition: "fill 1s linear" }} />
                        <circle cx={CX} cy={CY} r={2.5} fill={isDark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.8)"} />
                        <circle cx={needleTipX} cy={needleTipY} r={5} fill={dynamicColor}
                          style={{ filter: `drop-shadow(0 0 4px ${dynamicColor})`, transition: "cx 1s linear, cy 1s linear, fill 1s linear, filter 1s linear" }} />
                      </>
                    )}
                  </svg>
                  
                  {/* Dynamic Liquid Wave Visualization */}
                  {(isRunning || isPaused) && (
                    <div style={{
                      position: 'absolute', top: CY - 54, left: CX - 54,
                      width: 108, height: 108, borderRadius: '50%',
                      overflow: 'hidden', pointerEvents: 'none'
                    }}>
                      <LiquidWave 
                        progress={1 - prog}
                        color={dynamicColor}
                        backgroundColor={theme.bg}
                        size={108}
                      />
                    </div>
                  )}

                  {/* Time text & Play Button */}
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                    {(!isRunning && remaining === 1500 && totalSecs === 1500) ? (
                      <div
                        style={{
                          width: 80, height: 80, borderRadius: "50%", border: 'none',
                          background: `linear-gradient(135deg, ${theme.accent}, #5a4fcf)`,
                          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.3)",
                        }}
                      >
                        <Play size={40} fill="currentColor" style={{ marginLeft: 6 }} />
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 42, fontWeight: 700, color: theme.textPrimary, letterSpacing: "-1px", lineHeight: 1, ...fontDisplay }}>
                          {Math.floor(displaySecs / 3600) > 0 ? `${Math.floor(displaySecs / 3600)}:` : ''}{Math.floor((displaySecs % 3600) / 60).toString().padStart(2, "0")}:{(displaySecs % 60).toString().padStart(2, "0")}
                        </div>
                        <div style={{ fontSize: 10, color: theme.textSecondary, fontWeight: 700, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.15em", ...fontBody }}>
                          {isRunning || isPaused ? 'remaining' : 'set time'}
                        </div>
                        {isPaused && (
                          <div style={{ marginTop: 10, color: theme.textSecondary }}>
                            <Play size={20} fill="currentColor" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {!isRunning && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20, zIndex: 1 }}>
              {showCustomTimer ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12, height: 100 }}>
                    <WheelPicker
                      options={Array.from({ length: 13 }, (_, i) => i)}
                      value={hours}
                      onChange={setHours}
                      label="hrs"
                      theme={theme}
                      itemHeight={32}
                      fontSize={18}
                    />
                    <WheelPicker
                      options={Array.from({ length: 60 }, (_, i) => i)}
                      value={minutes}
                      onChange={setMinutes}
                      label="min"
                      theme={theme}
                      itemHeight={32}
                      fontSize={18}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => setShowCustomTimer(false)}
                      style={{
                        padding: '6px 16px', borderRadius: 20, border: 'none',
                        background: theme.bg, color: theme.textSecondary,
                        boxShadow: theme.shadowRaisedSm, cursor: 'pointer',
                        fontWeight: 600, fontSize: 13, ...fontBody
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomTimer(false);
                        startTimerFor(hours, minutes, seconds);
                      }}
                      style={{
                        padding: '6px 16px', borderRadius: 20, border: 'none',
                        background: theme.accent, color: '#fff',
                        boxShadow: `0 4px 12px ${theme.accent}60`, cursor: 'pointer',
                        fontWeight: 600, fontSize: 13, ...fontBody
                      }}
                    >
                      Set Timer
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  {[5, 10, 15, 20].map(min => {
                    const active = hours === 0 && minutes === min && seconds === 0;
                    return (
                      <button
                        key={min}
                        onClick={() => startTimerFor(0, min, 0)}
                        style={{
                          width: 52, height: 52,
                          background: theme.bg,
                          color: active ? theme.accent : theme.textSecondary,
                          boxShadow: active ? theme.shadowInset : theme.shadowRaisedSm,
                          border: 'none', borderRadius: 14,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.25s',
                          outline: active ? `2px solid ${theme.accent}55` : 'none',
                        }}
                      >
                        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1, ...fontDisplay }}>
                          {String(min).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: 8, marginTop: 2, letterSpacing: '0.05em', ...fontBody }}>min</div>
                      </button>
                    );
                  })}
                  {/* Custom button */}
                  <button
                    onClick={() => setShowCustomTimer(true)}
                    style={{
                      width: 52, height: 52,
                      background: theme.bg,
                      color: theme.textSecondary,
                      boxShadow: theme.shadowRaisedSm,
                      border: 'none', borderRadius: 14,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.25s',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, ...fontBody }}>...</div>
                    <div style={{ fontSize: 8, marginTop: 1, ...fontBody }}>custom</div>
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === "pomodoro" && !isRunning && pomoPhase === "Focus" && pomoCycle === 1 && (
            <div style={{ display: "flex", gap: 16, marginBottom: 32, width: "100%" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginBottom: 8, letterSpacing: 1 }}>BREAK TIME (MIN)</div>
                <NeoSelect
                  value={pomoBreakDuration}
                  onChange={setPomoBreakDuration}
                  options={[
                    { value: 5, label: "5 Minutes" },
                    { value: 10, label: "10 Minutes" },
                    { value: 15, label: "15 Minutes" },
                    { value: 20, label: "20 Minutes" },
                    { value: 25, label: "25 Minutes" },
                    { value: 30, label: "30 Minutes" }
                  ]}
                  theme={theme}
                  fontBody={fontBody}
                />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginBottom: 8, letterSpacing: 1 }}>CYCLES</div>
                <NeoSelect
                  value={pomoMaxCycles}
                  onChange={setPomoMaxCycles}
                  options={[
                    { value: 1, label: "1 Cycle" },
                    { value: 2, label: "2 Cycles" },
                    { value: 3, label: "3 Cycles" },
                    { value: 4, label: "4 Cycles" },
                    { value: 5, label: "5 Cycles" },
                    { value: 6, label: "6 Cycles" }
                  ]}
                  theme={theme}
                  fontBody={fontBody}
                />
              </div>
            </div>
          )}

          {/* Ambience Integrated Section */}
          <div style={{ marginTop: 20, width: "100%", position: "relative", zIndex: 1 }}>
            <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 8, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>
              Focus Music: {MUSIC_OPTIONS.find(m => m.id === activeSource)?.label}
            </div>
            <div onTouchStart={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {MUSIC_OPTIONS.map((m) => {
                const isActive = activeSource === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      const mId = m.id;
                      if (audioRef.current) audioRef.current.pause();
                      if (ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
                      setActiveSource(mId);
                      if (audioRef.current) {
                        audioRef.current.src = `audio/${mId}.mp3`;
                        if (isPlaying) audioRef.current.play().catch(err => console.error(err));
                      }
                    }}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 14,
                      border: "none",
                      fontWeight: 600,
                      fontSize: 12,
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: isActive ? `linear-gradient(135deg, ${theme.accent}, #5a4fcf)` : theme.bg,
                      color: isActive ? "#fff" : theme.textSecondary,
                      boxShadow: isActive ? "inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.1)" : theme.shadowRaisedSm,
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      flexShrink: 0
                    }}
                  >
                    {m.label}
                    {isActive && (
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 10, marginLeft: 4 }}>
                        <div style={{ width: 3, height: "100%", background: "#fff", borderRadius: 2, transformOrigin: "bottom", animation: isPlaying ? "eqBounce 0.6s infinite ease-in-out alternate" : "none" }} />
                        <div style={{ width: 3, height: "100%", background: "#fff", borderRadius: 2, transformOrigin: "bottom", animation: isPlaying ? "eqBounce 0.5s infinite ease-in-out alternate 0.2s" : "none" }} />
                        <div style={{ width: 3, height: "100%", background: "#fff", borderRadius: 2, transformOrigin: "bottom", animation: isPlaying ? "eqBounce 0.7s infinite ease-in-out alternate 0.4s" : "none" }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {remaining <= 15 && remaining > 0 && isRunning && (
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16, zIndex: 1, position: "relative" }}>
              <button
                onClick={() => {
                  const newTotal = (hours * 3600 + minutes * 60 + seconds) + 60;
                  setHours(Math.floor(newTotal / 3600));
                  setMinutes(Math.floor((newTotal % 3600) / 60));
                  setSeconds(newTotal % 60);
                  setRemaining(prev => prev + 60);
                }}
                style={{
                  background: theme.bg, border: "none", color: theme.textSecondary,
                  padding: "6px 14px", borderRadius: 12, boxShadow: theme.shadowRaisedSm,
                  fontSize: 12, fontWeight: 700, cursor: "pointer", ...fontBody
                }}
              >
                +1 min
              </button>
              <button
                onClick={() => {
                  const newTotal = (hours * 3600 + minutes * 60 + seconds) + 300;
                  setHours(Math.floor(newTotal / 3600));
                  setMinutes(Math.floor((newTotal % 3600) / 60));
                  setSeconds(newTotal % 60);
                  setRemaining(prev => prev + 300);
                }}
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

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, position: "relative", zIndex: 1, width: "100%" }}>
            
            {/* Volume Control */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: theme.bg, padding: "8px 12px", borderRadius: 20, boxShadow: theme.shadowPressed, flex: 1, maxWidth: 150 }}>
              <button onClick={() => setIsMuted(m => !m)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: theme.textSecondary }}>
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }} style={{ width: "100%", accentColor: theme.accent, height: 4 }} />
            </div>

            {/* Reset Button */}
            <button
              onClick={resetTimer}
              style={{
                width: 44, height: 44, borderRadius: "50%", background: theme.bg, border: "none",
                boxShadow: theme.shadowPressed, display: "flex", alignItems: "center", justifyContent: "center",
                color: theme.textSecondary, cursor: "pointer"
              }}
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </NeoSurface>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", marginTop: 24 }}>
          <div style={{ display: "flex", gap: 4, background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 14, padding: 4 }}>
            {["focus", "pomodoro"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setIsRunning(false); if (m === "pomodoro") { setPomoPhase("Focus"); setPomoCycle(1); setHours(0); setMinutes(pomoFocusDuration); setSeconds(0); } }} style={{
                border: "none", padding: "7px 12px", borderRadius: 10, fontSize: 11.5, fontWeight: 600, ...fontBody,
                background: mode === m ? `linear-gradient(135deg, ${theme.accent}, #5a4fcf)` : "transparent",
                color: mode === m ? "#fff" : theme.textSecondary,
              }}>{m === "focus" ? "Focus" : "Pomodoro"}</button>
            ))}
          </div>
          {mode === "pomodoro" && (
            <div style={{ position: "absolute", right: 0, display: "flex", alignItems: "center", gap: 5, color: "#ff9f43", fontSize: 12, fontWeight: 700, ...fontDisplay }}>
              <Flame size={15} /> {streak} streak
            </div>
          )}
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Daily focus goal</SectionLabel>
          <NeoSurface style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <svg width={56} height={56}>
              <circle cx="28" cy="28" r="23" fill="none" stroke={darkMode ? "#1b1e25" : "#c9cfda"} strokeWidth="7" />
              <circle cx="28" cy="28" r="23" fill="none" stroke={theme.accent2} strokeWidth="7" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 23}
                strokeDashoffset={2 * Math.PI * 23 * (1 - Math.min(minutesLoggedToday / dailyGoalMinutes, 1))}
                transform="rotate(-90 28 28)" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 14, ...fontDisplay }}>
                {minutesLoggedToday} / {dailyGoalMinutes} min
              </div>
              <div style={{ color: theme.textSecondary, fontSize: 11.5, ...fontBody }}>Today's focus goal · {Math.round((minutesLoggedToday / dailyGoalMinutes) * 100)}% there</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <button onClick={() => {
                setTempDailyGoal(dailyGoalMinutes.toString());
                setShowDailyGoalModal(true);
              }} style={{ border: "none", background: "none", color: theme.textSecondary, cursor: "pointer" }}>
                <Pencil size={14} />
              </button>
              <div style={{ color: theme.textSecondary, fontSize: 11, textAlign: "right", ...fontBody }}>This week<br /><span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13 }}>{daysThisWeekWithFocus}/7 days</span></div>
            </div>
          </NeoSurface>
        </div>

        {/* Analytics Grid */}
        <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
          {/* Heatmap */}
          <NeoSurface style={{ flex: 1.5, padding: 16, display: "flex", flexDirection: "column" }}>
            <div style={{ color: theme.textSecondary, fontSize: 11.5, fontWeight: 600, marginBottom: 12, ...fontBody }}>30-DAY FOCUS HEATMAP</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, width: "100%" }}>
              {heatmapData.map((day, i) => {
                const intensity = Math.min(day.minutes / 60, 1);
                const bg = intensity > 0
                  ? `rgba(90, 79, 207, ${0.2 + intensity * 0.8})`
                  : theme.bg;
                return (
                  <div key={i} style={{
                    aspectRatio: "1/1",
                    borderRadius: 4,
                    background: bg,
                    boxShadow: intensity > 0 ? "none" : theme.shadowPressed,
                    border: intensity > 0 ? "none" : `1px solid ${darkMode ? "#2b2f3a" : "#e0e5ed"}`
                  }} title={`${day.date}: ${day.minutes}m`} />
                );
              })}
            </div>
          </NeoSurface>

          {/* Time Distribution */}
          <NeoSurface style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: theme.textSecondary, fontSize: 11.5, fontWeight: 600, marginBottom: 12, width: "100%", ...fontBody }}>TODAY'S SPLIT</div>
            {Object.keys(distribution).length === 0 ? (
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: theme.bg, boxShadow: theme.shadowPressed }}></div>
            ) : (
              <svg width={64} height={64} viewBox="-1 -1 2 2" style={{ transform: "rotate(-90deg)", filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.15))" }}>
                {Object.entries(distribution).map(([cat, val]) => {
                  const ratio = val / distTotal;
                  const startAngle = distAccum * Math.PI * 2;
                  const endAngle = (distAccum + ratio) * Math.PI * 2;
                  distAccum += ratio;

                  const x1 = Math.cos(startAngle);
                  const y1 = Math.sin(startAngle);
                  const x2 = Math.cos(endAngle);
                  const y2 = Math.sin(endAngle);
                  const largeArc = ratio > 0.5 ? 1 : 0;

                  const pathData = ratio === 1 ?
                    `M 1 0 A 1 1 0 1 1 1 -0.01` :
                    `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`;

                  return <path key={cat} d={pathData} fill={catColors[cat] || catColors.Personal} />;
                })}
              </svg>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {Object.keys(distribution).map(cat => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: theme.textSecondary, fontWeight: 600 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: catColors[cat] || catColors.Personal }} /> {cat}
                </div>
              ))}
            </div>
          </NeoSurface>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Session history</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.slice(0, 15).map((h) => {
              const displayDate = h.date && h.date.includes("T") ? new Date(h.date).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : h.date;
              return (
                <NeoSurface key={h.id} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: catColors[h.category] || catColors.Personal }} />
                      <div style={{ color: theme.textPrimary, fontSize: 14, fontWeight: 700, ...fontBody }}>{h.name}</div>
                    </div>
                    <div style={{ color: theme.accent, fontWeight: 800, fontSize: 14, ...fontDisplay }}>{h.minutes}m</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {h.note ? (
                      <div style={{ color: theme.textSecondary, fontSize: 12, fontStyle: "italic", ...fontBody }}>"{h.note}"</div>
                    ) : (
                      <div style={{ color: theme.textSecondary, fontSize: 11, ...fontBody }}>{displayDate}</div>
                    )}
                    {h.note && <div style={{ color: theme.textSecondary, fontSize: 11, ...fontBody }}>{displayDate}</div>}
                  </div>
                </NeoSurface>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  