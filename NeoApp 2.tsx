import React, { useState, useEffect, useRef } from "react";
import {
  Timer as TimerIcon,
  Wallet,
  ListChecks,
  BarChart3,
  Sun,
  Moon,
  KeyRound,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Music2,
  Youtube,
  Upload,
  Pencil,
  Trash2,
  Repeat,
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
  BookOpen,
  User,
  CreditCard,
  Smartphone,
  Banknote,
  Check,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Circle,
  Users,
  Mail,
  FileText,
  GraduationCap,
  ShoppingCart,
  HeartPulse,
  Phone,
  Target,
  Presentation,
  Dumbbell,
  Car,
  Flag,
  Award,
  Search,
  Cloud,
  MessageSquare,
  Bell,
  Camera,
  Download,
  Zap,
  ChevronDown,
  Layers,
  Split,
  Wallet2,
  Landmark,
  Flame,
  Send,
  AlarmClock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

/* ---------------------------------- helpers ---------------------------------- */

const EXPENSE_CATEGORIES = [
  "Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other",
];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"];
const UPI_APPS = ["BHIM", "PhonePe", "GPay", "Paytm"];
const MUSIC_OPTIONS = [
  { id: "piano", label: "Piano" },
  { id: "rain", label: "Rain" },
  { id: "ocean", label: "Ocean Waves" },
  { id: "white", label: "White Noise" },
  { id: "forest", label: "Forest" },
  { id: "cafe", label: "Cafe Hum" },
];

function autoTimerName(mins) {
  const hour = new Date().getHours();
  const period = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : hour < 21 ? "Evening" : "Night";
  const size = mins >= 45 ? "Deep Work" : mins >= 20 ? "Focus" : "Quick Focus";
  return `${period} ${size}`;
}

function autoCategorizeTodo(text) {
  const t = text.toLowerCase();
  const work = ["meeting", "email", "report", "client", "project", "call", "deadline", "presentation", "office", "invoice", "standup", "boss"];
  const study = ["study", "exam", "homework", "assignment", "read", "course", "lecture", "revise", "notes", "class", "syllabus"];
  if (work.some((w) => t.includes(w))) return "Work";
  if (study.some((w) => t.includes(w))) return "Study";
  return "Personal";
}

const TASK_ICON_RULES = [
  { keywords: ["meeting", "standup", "sync", "call"], icon: Users },
  { keywords: ["phone", "dial", "ring"], icon: Phone },
  { keywords: ["email", "mail", "inbox"], icon: Mail },
  { keywords: ["report", "invoice", "doc", "document"], icon: FileText },
  { keywords: ["presentation", "slide", "pitch", "demo"], icon: Presentation },
  { keywords: ["exam", "homework", "assignment", "course", "lecture", "syllabus"], icon: GraduationCap },
  { keywords: ["read", "notes", "revise", "study", "class", "book"], icon: BookOpen },
  { keywords: ["deadline", "project", "goal", "milestone"], icon: Target },
  { keywords: ["grocery", "groceries", "shopping", "buy", "store"], icon: ShoppingCart },
  { keywords: ["gym", "workout", "run", "exercise"], icon: Dumbbell },
  { keywords: ["doctor", "health", "medicine", "appointment"], icon: HeartPulse },
  { keywords: ["client", "boss", "office"], icon: Briefcase },
];

const CATEGORY_ICONS = {
  Food: ShoppingCart, Transport: Car, Shopping: ShoppingCart, Bills: FileText,
  Entertainment: Music2, Health: HeartPulse, Education: GraduationCap, Other: Circle,
  Salary: Briefcase, Freelance: Presentation, Business: Briefcase, Investment: TrendingUp, Gift: Sparkles,
};

function getTaskIcon(text) {
  const t = text.toLowerCase();
  for (const rule of TASK_ICON_RULES) {
    if (rule.keywords.some((k) => t.includes(k))) return rule.icon;
  }
  return null; // caller falls back to the category icon
}

function fmtClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const SEARCH_INDEX = [
  { type: "expense", icon: ShoppingCart, label: "Groceries", meta: "\u20B91,840 \u00b7 Jul 2" },
  { type: "expense", icon: FileText, label: "Electricity Bill", meta: "\u20B91,210 \u00b7 Jul 5" },
  { type: "todo", icon: FileText, label: "Send client project report", meta: "Work \u00b7 High priority" },
  { type: "todo", icon: Dumbbell, label: "Gym", meta: "Recurring \u00b7 Mon/Wed/Fri" },
  { type: "session", icon: TimerIcon, label: "Morning Deep Work", meta: "45m \u00b7 Today, 9:30 AM" },
  { type: "session", icon: TimerIcon, label: "Evening Reading", meta: "30m \u00b7 Yesterday, 8:00 PM" },
];

const AI_INSIGHTS = [
  "You focus best between 9–11 AM \u2014 3 of your last 5 deep-work sessions started in that window. Consider blocking it for your hardest task.",
  "Food spending is up 18% versus last month. Bills & Entertainment stayed flat, so the swing is mostly weekend orders.",
  "Work tasks get completed 40% faster than Study tasks this week. Try pairing a short timer session right before Study items.",
  "Your longest streak of completed todos is 6 days. One more day ties your best streak \u2014 keep it going.",
];

/* ---------------------------------- root ---------------------------------- */

const TAB_ORDER = ["timer", "expense", "todo", "insights"];

export default function NeoApp() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("timer");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [direction, setDirection] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showWidget, setShowWidget] = useState(false);
  const [syncState, setSyncState] = useState("synced"); // synced | syncing
  const touchData = useRef({ x: 0, y: 0, active: false });

  const switchTab = (newTab) => {
    if (newTab === activeTab) return;
    const oldIdx = TAB_ORDER.indexOf(activeTab);
    const newIdx = TAB_ORDER.indexOf(newTab);
    setDirection(newIdx > oldIdx ? 1 : -1);
    setActiveTab(newTab);
  };

  const onSwipeStart = (e) => {
    const p = e.touches ? e.touches[0] : e;
    touchData.current = { x: p.clientX, y: p.clientY, active: true };
  };
  const onSwipeEnd = (e) => {
    if (!touchData.current.active) return;
    touchData.current.active = false;
    const p = e.changedTouches ? e.changedTouches[0] : e;
    const dx = p.clientX - touchData.current.x;
    const dy = p.clientY - touchData.current.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      const idx = TAB_ORDER.indexOf(activeTab);
      if (dx < 0 && idx < TAB_ORDER.length - 1) switchTab(TAB_ORDER[idx + 1]);
      else if (dx > 0 && idx > 0) switchTab(TAB_ORDER[idx - 1]);
    }
  };

  const theme = {
    pageBg: darkMode ? "#15171c" : "#dfe4ee",
    bg: darkMode ? "#262b36" : "#e4e9f2",
    shadowRaised: darkMode
      ? "8px 8px 16px #1b1e25, -8px -8px 16px #313747"
      : "8px 8px 16px #b7bdc8, -8px -8px 16px #ffffff",
    shadowRaisedSm: darkMode
      ? "4px 4px 8px #1b1e25, -4px -4px 8px #313747"
      : "4px 4px 8px #b7bdc8, -4px -4px 8px #ffffff",
    shadowPressed: darkMode
      ? "inset 4px 4px 8px #1b1e25, inset -4px -4px 8px #313747"
      : "inset 4px 4px 8px #b7bdc8, inset -4px -4px 8px #ffffff",
    textPrimary: darkMode ? "#e9ecf2" : "#3b4152",
    textSecondary: darkMode ? "#8991a3" : "#7c8494",
    accent: "#7c6ff0",
    accent2: "#3dd6c8",
    danger: "#ff6b6b",
    border: darkMode ? "#323848" : "#ffffff",
  };

  const fontDisplay = { fontFamily: "'Poppins', sans-serif" };
  const fontBody = { fontFamily: "'Inter', sans-serif" };

  /* ---------- shared neomorphic primitives ---------- */

  const NeoSurface = ({ children, style, pressed, onClick, className = "" }) => (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: theme.bg,
        boxShadow: pressed ? theme.shadowPressed : theme.shadowRaised,
        borderRadius: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );

  const IconBtn = ({ icon, onClick, active, size = 44 }) => (
    <button
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: theme.bg,
        boxShadow: active ? theme.shadowPressed : theme.shadowRaisedSm,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? theme.accent : theme.textSecondary,
        border: "none",
        flexShrink: 0,
      }}
    >
      {icon}
    </button>
  );

  const Chip = ({ label, active, onClick, colorActive }) => (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 14,
        background: theme.bg,
        boxShadow: active ? theme.shadowPressed : theme.shadowRaisedSm,
        color: active ? colorActive || theme.accent : theme.textSecondary,
        fontSize: 12.5,
        fontWeight: 600,
        border: "none",
        whiteSpace: "nowrap",
        ...fontBody,
      }}
    >
      {label}
    </button>
  );

  const PrimaryButton = ({ label, icon, onClick, style }) => (
    <button
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${theme.accent}, #5a4fcf)`,
        color: "#fff",
        border: "none",
        borderRadius: 16,
        padding: "13px 18px",
        fontWeight: 600,
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: "6px 6px 14px rgba(124,111,240,0.35)",
        ...fontBody,
        ...style,
      }}
    >
      {icon}
      {label}
    </button>
  );

  const NeoInput = (props) => (
    <input
      {...props}
      style={{
        width: "100%",
        background: theme.bg,
        boxShadow: theme.shadowPressed,
        border: "none",
        borderRadius: 14,
        padding: "12px 14px",
        color: theme.textPrimary,
        fontSize: 14,
        outline: "none",
        ...fontBody,
        ...(props.style || {}),
      }}
    />
  );

  const SectionLabel = ({ children }) => (
    <div style={{ ...fontBody, color: theme.textSecondary, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );

  /* ---------------------------------- TIMER TAB ---------------------------------- */

  function TimerTab() {
    const [minutes, setMinutes] = useState(25);
    const [name, setName] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [remaining, setRemaining] = useState(25 * 60);
    const [dragging, setDragging] = useState(false);
    const [music, setMusic] = useState("piano");
    const [showYoutube, setShowYoutube] = useState(false);
    const [ytLink, setYtLink] = useState("");
    const [fileName, setFileName] = useState("");
    const svgRef = useRef(null);
    const [history, setHistory] = useState([
      { id: 1, name: "Morning Deep Work", minutes: 45, date: "Today, 9:30 AM" },
      { id: 2, name: "Evening Reading", minutes: 30, date: "Yesterday, 8:00 PM" },
      { id: 3, name: "Quick Focus", minutes: 10, date: "Yesterday, 3:15 PM" },
    ]);

    // Pomodoro mode
    const [mode, setMode] = useState("focus"); // focus | pomodoro
    const [pomoPhase, setPomoPhase] = useState("Focus"); // Focus | Break
    const [pomoCycle, setPomoCycle] = useState(1);
    const [streak, setStreak] = useState(3);

    // Linked todo
    const LINKABLE_TODOS = ["Send client project report", "Revise chapter 4 notes for exam", "Buy groceries"];
    const [linkedTodo, setLinkedTodo] = useState(null);
    const [showTodoPicker, setShowTodoPicker] = useState(false);

    // Daily goal
    const dailyGoalMinutes = 240;
    const minutesLoggedToday = 148;

    // Post-session note
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [sessionNote, setSessionNote] = useState("");

    useEffect(() => {
      if (!isRunning) setRemaining(minutes * 60);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [minutes]);

    useEffect(() => {
      if (!isRunning) return;
      if (remaining <= 0) {
        setIsRunning(false);
        if (mode === "pomodoro") {
          if (pomoPhase === "Focus") {
            setHistory((h) => [
              { id: Date.now(), name: name || autoTimerName(minutes), minutes, date: "Just now" },
              ...h,
            ]);
            setStreak((s) => s + 1);
            setShowNoteModal(true);
            setPomoPhase("Break");
            setMinutes(pomoCycle % 4 === 0 ? 15 : 5);
          } else {
            setPomoPhase("Focus");
            setPomoCycle((c) => c + 1);
            setMinutes(25);
          }
        } else {
          setHistory((h) => [
            { id: Date.now(), name: name || autoTimerName(minutes), minutes, date: "Just now" },
            ...h,
          ]);
          setShowNoteModal(true);
        }
        return;
      }
      const t = setInterval(() => setRemaining((r) => r - 1), 1000);
      return () => clearInterval(t);
    }, [isRunning, remaining]);

    const setFromPointer = (clientX, clientY) => {
      const rect = svgRef.current.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;
      let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;
      let m = Math.round((angle / 360) * 60);
      if (m === 0) m = 60;
      setMinutes(m);
    };

    useEffect(() => {
      if (!dragging) return;
      const move = (e) => {
        const p = e.touches ? e.touches[0] : e;
        setFromPointer(p.clientX, p.clientY);
      };
      const up = () => setDragging(false);
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      window.addEventListener("touchmove", move);
      window.addEventListener("touchend", up);
      return () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
        window.removeEventListener("touchmove", move);
        window.removeEventListener("touchend", up);
      };
    }, [dragging]);

    const r = 88;
    const circumference = 2 * Math.PI * r;
    const progress = Math.min(minutes, 60) / 60;
    const dashOffset = circumference * (1 - progress);
    const angleRad = (progress * 360 - 90) * (Math.PI / 180);
    const knobX = 100 + r * Math.cos(angleRad);
    const knobY = 100 + r * Math.sin(angleRad);

    const toggleStart = () => {
      if (!isRunning && !name) setName(autoTimerName(minutes));
      setIsRunning((v) => !v);
    };
    const resetTimer = () => {
      setIsRunning(false);
      setRemaining(minutes * 60);
    };

    return (
      <div style={{ padding: "18px 18px 100px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 4, background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 14, padding: 4 }}>
            {["focus", "pomodoro"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setIsRunning(false); if (m === "pomodoro") { setPomoPhase("Focus"); setMinutes(25); } }} style={{
                border: "none", padding: "7px 12px", borderRadius: 10, fontSize: 11.5, fontWeight: 600, ...fontBody,
                background: mode === m ? `linear-gradient(135deg, ${theme.accent}, #5a4fcf)` : "transparent",
                color: mode === m ? "#fff" : theme.textSecondary,
              }}>{m === "focus" ? "Focus" : "Pomodoro"}</button>
            ))}
          </div>
          {mode === "pomodoro" && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#ff9f43", fontSize: 12, fontWeight: 700, ...fontDisplay }}>
              <Flame size={15} /> {streak} streak
            </div>
          )}
        </div>

        {mode === "pomodoro" && (
          <NeoSurface style={{ padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: pomoPhase === "Focus" ? theme.accent : theme.accent2, fontWeight: 700, fontSize: 12.5, ...fontBody }}>{pomoPhase} phase</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i <= ((pomoCycle - 1) % 4) + (pomoPhase === "Break" ? 1 : 0) ? theme.accent : (darkMode ? "#3a4051" : "#c9cfda") }} />
              ))}
            </div>
            <span style={{ color: theme.textSecondary, fontSize: 11, ...fontBody }}>Cycle {pomoCycle}</span>
          </NeoSurface>
        )}

        <SectionLabel>Set focus duration</SectionLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <Chip label="25 / 5" active={minutes === 25} onClick={() => setMinutes(25)} />
          <Chip label="50 / 10" active={minutes === 50} onClick={() => setMinutes(50)} />
          <Chip label="Custom" active={minutes !== 25 && minutes !== 50} onClick={() => {}} />
        </div>
        <NeoSurface style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg
            ref={svgRef}
            width={200}
            height={200}
            style={{ touchAction: "none", cursor: "pointer" }}
            onMouseDown={(e) => { e.stopPropagation(); setDragging(true); setFromPointer(e.clientX, e.clientY); }}
            onTouchStart={(e) => { e.stopPropagation(); setDragging(true); const t = e.touches[0]; setFromPointer(t.clientX, t.clientY); }}
          >
            <circle cx="100" cy="100" r={r} fill="none" stroke={darkMode ? "#1b1e25" : "#c9cfda"} strokeWidth="14"
              style={{ filter: darkMode ? "none" : "none" }} />
            <circle cx="100" cy="100" r={r} fill="none" stroke="url(#grad)" strokeWidth="14" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              transform="rotate(-90 100 100)" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c6ff0" />
                <stop offset="100%" stopColor="#3dd6c8" />
              </linearGradient>
            </defs>
            <circle cx={knobX} cy={knobY} r="11" fill={theme.bg} stroke={theme.accent} strokeWidth="3" />
            <text x="100" y="94" textAnchor="middle" fontSize="30" fontWeight="700" fill={theme.textPrimary} style={fontDisplay}>
              {isRunning || remaining !== minutes * 60 ? fmtClock(remaining) : `${minutes}:00`}
            </text>
            <text x="100" y="118" textAnchor="middle" fontSize="11" fill={theme.textSecondary} style={fontBody}>
              {isRunning ? "running" : "drag ring to set minutes"}
            </text>
          </svg>

          <div style={{ marginTop: 18, width: "100%" }}>
            <NeoInput
              placeholder={autoTimerName(minutes) + " (auto if left blank)"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button onClick={() => setShowTodoPicker((v) => !v)} style={{
            marginTop: 10, width: "100%", border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm,
            borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, color: linkedTodo ? theme.accent : theme.textSecondary, fontSize: 12.5, fontWeight: 600, ...fontBody,
          }}>
            <Target size={14} />
            {linkedTodo ? `Focus on: ${linkedTodo}` : "Link to a todo (optional)"}
            <ChevronDown size={14} style={{ marginLeft: "auto" }} />
          </button>
          {showTodoPicker && (
            <div style={{ width: "100%", marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {LINKABLE_TODOS.map((t) => (
                <button key={t} onClick={() => { setLinkedTodo(t); setShowTodoPicker(false); }} style={{
                  textAlign: "left", border: "none", background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 10,
                  padding: "9px 12px", color: theme.textPrimary, fontSize: 12, ...fontBody,
                }}>{t}</button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
            <IconBtn icon={<RotateCcw size={18} />} onClick={resetTimer} />
            <button
              onClick={toggleStart}
              style={{
                width: 64, height: 64, borderRadius: "50%", border: "none",
                background: `linear-gradient(135deg, ${theme.accent}, #5a4fcf)`,
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "6px 6px 16px rgba(124,111,240,0.4)",
              }}
            >
              {isRunning ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 3 }} />}
            </button>
            <IconBtn icon={<Music2 size={18} />} active />
          </div>
        </NeoSurface>

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
              <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 14, ...fontDisplay }}>{minutesLoggedToday} / {dailyGoalMinutes} min</div>
              <div style={{ color: theme.textSecondary, fontSize: 11.5, ...fontBody }}>Today's focus goal \u00b7 {Math.round((minutesLoggedToday / dailyGoalMinutes) * 100)}% there</div>
            </div>
            <div style={{ color: theme.textSecondary, fontSize: 11, textAlign: "right", ...fontBody }}>This week<br/><span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13 }}>5/7 days</span></div>
          </NeoSurface>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Ambience / music</SectionLabel>
          <NeoSurface style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {MUSIC_OPTIONS.map((m) => (
                <Chip key={m.id} label={m.label} active={music === m.id} onClick={() => { setMusic(m.id); setShowYoutube(false); }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={() => setShowYoutube((v) => !v)} style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px 0", borderRadius: 14, border: "none", background: theme.bg,
                boxShadow: showYoutube ? theme.shadowPressed : theme.shadowRaisedSm, color: theme.textSecondary, fontSize: 12.5, fontWeight: 600, ...fontBody,
              }}>
                <Youtube size={15} /> YouTube link
              </button>
              <label style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px 0", borderRadius: 14, background: theme.bg,
                boxShadow: theme.shadowRaisedSm, color: theme.textSecondary, fontSize: 12.5, fontWeight: 600, cursor: "pointer", ...fontBody,
              }}>
                <Upload size={15} /> {fileName ? fileName.slice(0, 10) + "\u2026" : "Upload audio"}
                <input type="file" accept="audio/*" style={{ display: "none" }} onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
              </label>
            </div>
            {showYoutube && (
              <div style={{ marginTop: 10 }}>
                <NeoInput placeholder="Paste YouTube link\u2026" value={ytLink} onChange={(e) => setYtLink(e.target.value)} />
              </div>
            )}
          </NeoSurface>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Session history</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map((h) => (
              <NeoSurface key={h.id} style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: theme.textPrimary, fontSize: 13.5, fontWeight: 600, ...fontBody }}>{h.name}</div>
                  <div style={{ color: theme.textSecondary, fontSize: 11.5, ...fontBody }}>{h.date}</div>
                </div>
                <div style={{ color: theme.accent, fontWeight: 700, fontSize: 13, ...fontDisplay }}>{h.minutes}m</div>
              </NeoSurface>
            ))}
          </div>
        </div>

        {showNoteModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 55, padding: 24 }}>
            <NeoSurface style={{ padding: 22, width: "100%", maxWidth: 340 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Check size={16} color={theme.accent2} />
                <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 14.5, ...fontDisplay }}>Session complete</span>
              </div>
              <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 12, ...fontBody }}>What did you get done?</div>
              <textarea
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                placeholder="e.g. Finished the client report draft"
                rows={3}
                style={{ width: "100%", background: theme.bg, boxShadow: theme.shadowPressed, border: "none", borderRadius: 14, padding: "12px 14px", color: theme.textPrimary, fontSize: 13, outline: "none", resize: "none", ...fontBody }}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={() => { setShowNoteModal(false); setSessionNote(""); }} style={{ flex: 1, border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm, borderRadius: 14, padding: "11px 0", color: theme.textSecondary, fontWeight: 600, fontSize: 13, ...fontBody }}>Skip</button>
                <PrimaryButton label="Save note" icon={<Check size={15} />} onClick={() => { setShowNoteModal(false); setSessionNote(""); }} style={{ flex: 1 }} />
              </div>
            </NeoSurface>
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------- EXPENSE TAB ---------------------------------- */

  function ExpenseTab() {
    const [transactions, setTransactions] = useState([
      { id: 1, name: "Salary", amount: 65000, type: "income", category: "Salary", date: "2026-07-01", method: { type: "card" }, recurring: true, freq: "Monthly" },
      { id: 2, name: "Groceries", amount: 1840, type: "expense", category: "Food", date: "2026-07-02", method: { type: "upi", app: "PhonePe" }, recurring: false, split: true, splitWith: "Aniket" },
      { id: 3, name: "Uber", amount: 320, type: "expense", category: "Transport", date: "2026-07-03", method: { type: "upi", app: "GPay" }, recurring: false },
      { id: 4, name: "Netflix", amount: 649, type: "expense", category: "Entertainment", date: "2026-07-03", method: { type: "card" }, recurring: true, freq: "Monthly" },
      { id: 5, name: "Electricity Bill", amount: 1210, type: "expense", category: "Bills", date: "2026-07-05", method: { type: "cash" }, recurring: false },
      { id: 6, name: "Freelance Design", amount: 8000, type: "income", category: "Freelance", date: "2026-07-06", method: { type: "upi", app: "BHIM" }, recurring: false },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [monthOffset, setMonthOffset] = useState(0);

    const blankForm = { name: "", amount: "", type: "expense", category: "Food", date: "2026-07-06", methodType: "cash", upiApp: "BHIM", recurring: false, freq: "Monthly", split: false, splitWith: "Aniket" };
    const [form, setForm] = useState(blankForm);
    const [scanning, setScanning] = useState(false);

    // Multiple accounts/wallets
    const ACCOUNTS = [
      { id: "bank", label: "Bank", icon: Landmark, balance: 84200 },
      { id: "cash", label: "Cash", icon: Banknote, balance: 2450 },
      { id: "upi", label: "UPI", icon: Smartphone, balance: 6100 },
    ];
    const [activeAccount, setActiveAccount] = useState("bank");

    // Category budgets
    const BUDGETS = [
      { category: "Food", budget: 3000, color: "#7c6ff0" },
      { category: "Transport", budget: 1500, color: "#3dd6c8" },
      { category: "Bills", budget: 2000, color: "#ffb648" },
      { category: "Entertainment", budget: 500, color: "#ff6b6b" },
    ];

    // Bill reminders
    const UPCOMING_BILLS = [
      { name: "Netflix", amount: 649, daysLeft: 2 },
      { name: "Electricity Bill", amount: 1450, daysLeft: 5 },
      { name: "Rent", amount: 14000, daysLeft: 9 },
    ];

    const income = transactions.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    const balance = income - expense;
    const spentByCategory = {};
    transactions.filter((t) => t.type === "expense").forEach((t) => { spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount; });

    const openAdd = () => { setForm(blankForm); setEditId(null); setShowForm(true); };
    const openEdit = (t) => {
      setForm({
        name: t.name, amount: String(t.amount), type: t.type, category: t.category, date: t.date,
        methodType: t.method.type, upiApp: t.method.app || "BHIM", recurring: t.recurring, freq: t.freq || "Monthly",
      });
      setEditId(t.id);
      setShowForm(true);
    };
    const saveForm = () => {
      if (!form.name || !form.amount) return;
      const method = form.methodType === "upi" ? { type: "upi", app: form.upiApp } : { type: form.methodType };
      if (editId) {
        setTransactions((ts) => ts.map((t) => (t.id === editId ? { ...t, name: form.name, amount: Number(form.amount), type: form.type, category: form.category, date: form.date, method, recurring: form.recurring, freq: form.freq } : t)));
      } else {
        setTransactions((ts) => [{ id: Date.now(), name: form.name, amount: Number(form.amount), type: form.type, category: form.category, date: form.date, method, recurring: form.recurring, freq: form.freq }, ...ts]);
      }
      setShowForm(false);
    };
    const deleteTx = (id) => setTransactions((ts) => ts.filter((t) => t.id !== id));

    const methodIcon = (m) => {
      if (m.type === "cash") return <Banknote size={14} />;
      if (m.type === "card") return <CreditCard size={14} />;
      return <Smartphone size={14} />;
    };
    const methodLabel = (m) => (m.type === "upi" ? m.app : m.type === "card" ? "Card" : "Cash");

    // simple calendar grid for July 2026 (mock, fixed month + offset)
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const baseMonth = 6 + monthOffset; // July index 6
    const monthLabel = `${monthNames[((baseMonth % 12) + 12) % 12]} 2026`;
    const daysInMonth = 31;
    const txByDay = {};
    transactions.forEach((t) => {
      const day = Number(t.date.split("-")[2]);
      txByDay[day] = txByDay[day] || [];
      txByDay[day].push(t);
    });
    const dayFiltered = selectedDate ? transactions.filter((t) => Number(t.date.split("-")[2]) === selectedDate) : transactions;

    return (
      <div style={{ padding: "18px 18px 100px" }}>
        <NeoSurface style={{ padding: 20 }}>
          <div style={{ color: theme.textSecondary, fontSize: 12, ...fontBody }}>Total balance</div>
          <div style={{ color: theme.textPrimary, fontSize: 30, fontWeight: 700, marginTop: 2, ...fontDisplay }}>
            \u20B9{balance.toLocaleString()}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <div style={{ flex: 1, background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 14, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: theme.accent2 }}>
                <TrendingUp size={14} /><span style={{ fontSize: 11.5, ...fontBody }}>Income</span>
              </div>
              <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 16, marginTop: 4, ...fontDisplay }}>\u20B9{income.toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 14, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: theme.danger }}>
                <TrendingDown size={14} /><span style={{ fontSize: 11.5, ...fontBody }}>Expense</span>
              </div>
              <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 16, marginTop: 4, ...fontDisplay }}>\u20B9{expense.toLocaleString()}</div>
            </div>
          </div>
        </NeoSurface>

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <PrimaryButton label="Add transaction" icon={<Plus size={16} />} onClick={openAdd} style={{ flex: 1 }} />
          <IconBtn icon={<Download size={17} />} onClick={() => {}} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <Chip label="Export CSV" onClick={() => {}} />
          <Chip label="Export PDF" onClick={() => {}} />
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Accounts & wallets</SectionLabel>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {ACCOUNTS.map((a) => {
              const AIcon = a.icon;
              const active = activeAccount === a.id;
              return (
                <NeoSurface key={a.id} pressed={active} onClick={() => setActiveAccount(a.id)} style={{ padding: "14px 16px", minWidth: 120, flexShrink: 0, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: active ? theme.accent : theme.textSecondary }}>
                    <AIcon size={15} /><span style={{ fontSize: 11.5, fontWeight: 600, ...fontBody }}>{a.label}</span>
                  </div>
                  <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 15, marginTop: 6, ...fontDisplay }}>\u20B9{a.balance.toLocaleString()}</div>
                </NeoSurface>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Category budgets</SectionLabel>
          <NeoSurface style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            {BUDGETS.map((b) => {
              const spent = spentByCategory[b.category] || 0;
              const pct = Math.min((spent / b.budget) * 100, 100);
              const over = spent > b.budget;
              return (
                <div key={b.category}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: theme.textPrimary, fontSize: 12.5, fontWeight: 600, ...fontBody }}>{b.category}</span>
                    <span style={{ color: over ? theme.danger : theme.textSecondary, fontSize: 11.5, fontWeight: 600, ...fontBody }}>
                      \u20B9{spent.toLocaleString()} / \u20B9{b.budget.toLocaleString()} {over && "\u26A0 over"}
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: theme.bg, boxShadow: theme.shadowPressed, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: over ? theme.danger : b.color, transition: "width .3s" }} />
                  </div>
                </div>
              );
            })}
          </NeoSurface>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Upcoming bills</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {UPCOMING_BILLS.map((b) => (
              <NeoSurface key={b.name} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: b.daysLeft <= 3 ? theme.danger : theme.accent }}>
                  <Bell size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 13.5, ...fontBody }}>{b.name}</div>
                  <div style={{ color: theme.textSecondary, fontSize: 11, ...fontBody }}>Due in {b.daysLeft} day{b.daysLeft !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13.5, ...fontDisplay }}>\u20B9{b.amount.toLocaleString()}</div>
              </NeoSurface>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Calendar</SectionLabel>
          <NeoSurface style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <IconBtn size={32} icon={<ChevronLeft size={15} />} onClick={() => setMonthOffset((m) => m - 1)} />
              <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13.5, ...fontDisplay }}>{monthLabel}</div>
              <IconBtn size={32} icon={<ChevronRight size={15} />} onClick={() => setMonthOffset((m) => m + 1)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 10, color: theme.textSecondary, ...fontBody }}>{d}</div>
              ))}
              {Array.from({ length: 3 }).map((_, i) => <div key={"pad" + i} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const has = txByDay[day];
                const isSelected = selectedDate === day;
                return (
                  <button key={day} onClick={() => setSelectedDate(isSelected ? null : day)} style={{
                    aspectRatio: "1", borderRadius: 10, border: "none", background: theme.bg,
                    boxShadow: isSelected ? theme.shadowPressed : theme.shadowRaisedSm,
                    color: isSelected ? theme.accent : theme.textPrimary, fontSize: 11, position: "relative", ...fontBody,
                  }}>
                    {day}
                    {has && <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: has.some(t=>t.type==='expense') ? theme.danger : theme.accent2 }} />}
                  </button>
                );
              })}
            </div>
          </NeoSurface>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>{selectedDate ? `Transactions on ${selectedDate} ${monthLabel}` : "All transactions"}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {dayFiltered.map((t) => {
              const CatIcon = CATEGORY_ICONS[t.category] || Circle;
              return (
                <NeoSurface key={t.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: theme.bg,
                    boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center",
                    color: t.type === "income" ? theme.accent2 : theme.accent,
                  }}>
                    <CatIcon size={16} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 13.5, ...fontBody }}>{t.name}</span>
                      {t.recurring && <Repeat size={12} color={theme.textSecondary} />}
                      {t.split && <Split size={12} color={theme.accent} />}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.textSecondary, fontSize: 11, ...fontBody }}>
                      <span>{t.category}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>{methodIcon(t.method)} {methodLabel(t.method)}</span>
                      {t.split && <span style={{ color: theme.accent }}>\u00b7 split with {t.splitWith}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ color: t.type === "income" ? theme.accent2 : theme.danger, fontWeight: 700, fontSize: 13.5, ...fontDisplay }}>
                      {t.type === "income" ? "+" : "-"}\u20B9{t.amount.toLocaleString()}
                    </div>
                    <button onClick={() => openEdit(t)} style={{ border: "none", background: "none", color: theme.textSecondary }}><Pencil size={14} /></button>
                    <button onClick={() => deleteTx(t.id)} style={{ border: "none", background: "none", color: theme.danger }}><Trash2 size={14} /></button>
                  </div>
                </NeoSurface>
              );
            })}
          </div>
        </div>

        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", zIndex: 50 }}>
            <div style={{ background: theme.bg, borderRadius: "24px 24px 0 0", padding: 20, width: "100%", maxWidth: 420, margin: "0 auto", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 16, ...fontDisplay }}>{editId ? "Edit transaction" : "Add transaction"}</div>
                <button onClick={() => setShowForm(false)} style={{ border: "none", background: "none", color: theme.textSecondary }}><X size={20} /></button>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Chip label="Expense" active={form.type === "expense"} colorActive={theme.danger} onClick={() => setForm((f) => ({ ...f, type: "expense", category: "Food" }))} />
                <Chip label="Income" active={form.type === "income"} colorActive={theme.accent2} onClick={() => setForm((f) => ({ ...f, type: "income", category: "Salary" }))} />
              </div>

              {form.type === "expense" && (
                <button onClick={() => {
                  setScanning(true);
                  setTimeout(() => {
                    setScanning(false);
                    setForm((f) => ({ ...f, name: "Cafe Coffee Day", amount: "480", category: "Food" }));
                  }, 1200);
                }} style={{
                  width: "100%", border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm, borderRadius: 14,
                  padding: "12px 0", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  color: theme.accent, fontSize: 13, fontWeight: 600, ...fontBody,
                }}>
                  <Camera size={16} /> {scanning ? "Reading receipt\u2026" : "Scan receipt with AI"}
                </button>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <NeoInput placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
                <NeoInput placeholder="Description" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <NeoInput type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />

                <SectionLabel>Category</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: -6 }}>
                  {(form.type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                    <Chip key={c} label={c} active={form.category === c} onClick={() => setForm((f) => ({ ...f, category: c }))} />
                  ))}
                </div>

                <SectionLabel>Payment method</SectionLabel>
                <div style={{ display: "flex", gap: 8, marginTop: -6 }}>
                  <Chip label="Cash" active={form.methodType === "cash"} onClick={() => setForm((f) => ({ ...f, methodType: "cash" }))} />
                  <Chip label="Card" active={form.methodType === "card"} onClick={() => setForm((f) => ({ ...f, methodType: "card" }))} />
                  <Chip label="UPI" active={form.methodType === "upi"} onClick={() => setForm((f) => ({ ...f, methodType: "upi" }))} />
                </div>
                {form.methodType === "upi" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {UPI_APPS.map((a) => (
                      <Chip key={a} label={a} active={form.upiApp === a} onClick={() => setForm((f) => ({ ...f, upiApp: a }))} />
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.textPrimary, fontSize: 13, ...fontBody }}>
                    <Repeat size={15} /> Recurring transaction
                  </div>
                  <button onClick={() => setForm((f) => ({ ...f, recurring: !f.recurring }))} style={{
                    width: 44, height: 24, borderRadius: 12, border: "none", background: theme.bg,
                    boxShadow: theme.shadowPressed, position: "relative",
                  }}>
                    <div style={{ position: "absolute", top: 3, left: form.recurring ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: form.recurring ? theme.accent : theme.textSecondary, transition: "left .15s" }} />
                  </button>
                </div>
                {form.recurring && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Daily", "Weekly", "Monthly"].map((f2) => (
                      <Chip key={f2} label={f2} active={form.freq === f2} onClick={() => setForm((f) => ({ ...f, freq: f2 }))} />
                    ))}
                  </div>
                )}

                {form.type === "expense" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.textPrimary, fontSize: 13, ...fontBody }}>
                        <Split size={15} /> Split with a friend
                      </div>
                      <button onClick={() => setForm((f) => ({ ...f, split: !f.split }))} style={{
                        width: 44, height: 24, borderRadius: 12, border: "none", background: theme.bg,
                        boxShadow: theme.shadowPressed, position: "relative",
                      }}>
                        <div style={{ position: "absolute", top: 3, left: form.split ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: form.split ? theme.accent : theme.textSecondary, transition: "left .15s" }} />
                      </button>
                    </div>
                    {form.split && (
                      <div>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          {["Aniket", "Priya", "Rahul"].map((p) => (
                            <Chip key={p} label={p} active={form.splitWith === p} onClick={() => setForm((f) => ({ ...f, splitWith: p }))} />
                          ))}
                        </div>
                        <div style={{ color: theme.textSecondary, fontSize: 11.5, ...fontBody }}>
                          You pay \u20B9{form.amount ? Math.round(Number(form.amount) / 2) : 0}, {form.splitWith} owes you \u20B9{form.amount ? Math.round(Number(form.amount) / 2) : 0}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <PrimaryButton label={editId ? "Save changes" : "Add transaction"} icon={<Check size={16} />} onClick={saveForm} style={{ marginTop: 8 }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------- TODO TAB ---------------------------------- */

  function TodoTab() {
    const [todos, setTodos] = useState([
      { id: 1, text: "Send client project report", done: false, priority: "High", due: "Today, 5:00 PM", reminder: true, recurring: null, subtasks: [
        { id: 11, text: "Compile Q2 numbers", done: true },
        { id: 12, text: "Draft summary email", done: false },
      ] },
      { id: 2, text: "Revise chapter 4 notes for exam", done: false, priority: "Medium", due: "Tomorrow, 9:00 AM", reminder: false, recurring: null, subtasks: [] },
      { id: 3, text: "Team standup call", done: true, priority: "Low", due: null, reminder: false, recurring: null, subtasks: [] },
      { id: 4, text: "Buy groceries", done: false, priority: "Medium", due: "Today, 7:00 PM", reminder: true, recurring: null, subtasks: [
        { id: 41, text: "Milk & eggs", done: false },
        { id: 42, text: "Vegetables", done: false },
      ] },
      { id: 5, text: "Gym", done: false, priority: "High", due: null, reminder: false, recurring: ["Mon", "Wed", "Fri"], subtasks: [] },
    ]);
    const [input, setInput] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [newPriority, setNewPriority] = useState("Medium");
    const [newRecurringDays, setNewRecurringDays] = useState([]);
    const [showTaskOptions, setShowTaskOptions] = useState(false);

    const PRIORITY_COLOR = { High: theme.danger, Medium: "#ffb648", Low: theme.accent2 };

    const addTodo = () => {
      if (!input.trim()) return;
      setTodos((t) => [{ id: Date.now(), text: input.trim(), done: false, priority: newPriority, due: null, reminder: false, recurring: newRecurringDays.length ? newRecurringDays : null, subtasks: [] }, ...t]);
      setInput(""); setNewPriority("Medium"); setNewRecurringDays([]); setShowTaskOptions(false);
    };
    const toggleDone = (id) => setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
    const scratch = (id) => setTodos((t) => t.filter((x) => x.id !== id));
    const toggleSubtask = (todoId, subId) => setTodos((t) => t.map((x) => x.id === todoId ? { ...x, subtasks: x.subtasks.map((s) => s.id === subId ? { ...s, done: !s.done } : s) } : x));
    const toggleReminder = (id) => setTodos((t) => t.map((x) => x.id === id ? { ...x, reminder: !x.reminder } : x));

    const groups = { Work: [], Study: [], Personal: [] };
    todos.forEach((t) => groups[autoCategorizeTodo(t.text)].push(t));
    const groupMeta = {
      Work: { icon: <Briefcase size={15} />, color: theme.accent, FallbackIcon: Briefcase },
      Study: { icon: <BookOpen size={15} />, color: theme.accent2, FallbackIcon: BookOpen },
      Personal: { icon: <User size={15} />, color: theme.danger, FallbackIcon: User },
    };

    return (
      <div style={{ padding: "18px 18px 100px" }}>
        <SectionLabel>Add a task for today</SectionLabel>
        <NeoSurface style={{ padding: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <NeoInput placeholder="e.g. Prepare client presentation" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTodo()} />
            </div>
            <button onClick={() => setShowTaskOptions((v) => !v)} style={{
              width: 46, borderRadius: 14, border: "none", background: theme.bg, boxShadow: showTaskOptions ? theme.shadowPressed : theme.shadowRaisedSm,
              color: theme.textSecondary, display: "flex", alignItems: "center", justifyContent: "center",
            }}><ChevronDown size={18} style={{ transform: showTaskOptions ? "rotate(180deg)" : "none" }} /></button>
            <button onClick={addTodo} style={{
              width: 46, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${theme.accent}, #5a4fcf)`,
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            }}><Plus size={18} /></button>
          </div>
          {showTaskOptions && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 6, ...fontBody }}>Priority</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["High", "Medium", "Low"].map((p) => (
                    <Chip key={p} label={p} active={newPriority === p} colorActive={PRIORITY_COLOR[p]} onClick={() => setNewPriority(p)} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 6, ...fontBody }}>Repeat on</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <Chip key={d} label={d} active={newRecurringDays.includes(d)} onClick={() => setNewRecurringDays((days) => days.includes(d) ? days.filter((x) => x !== d) : [...days, d])} />
                  ))}
                </div>
              </div>
              <NeoInput type="datetime-local" style={{ fontSize: 12.5 }} />
            </div>
          )}
        </NeoSurface>
        <div style={{ color: theme.textSecondary, fontSize: 11, marginTop: 8, ...fontBody }}>
          Tasks are auto-sorted into Work / Study / Personal based on what you type.
        </div>

        {Object.keys(groups).map((g) => (
          <div key={g} style={{ marginTop: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ color: groupMeta[g].color }}>{groupMeta[g].icon}</span>
              <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13.5, ...fontDisplay }}>{g}</span>
              <span style={{ color: theme.textSecondary, fontSize: 11.5, ...fontBody }}>({groups[g].length})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {groups[g].length === 0 && (
                <div style={{ color: theme.textSecondary, fontSize: 12, ...fontBody, paddingLeft: 4 }}>Nothing here yet.</div>
              )}
              {groups[g].map((t) => {
                const TaskIcon = getTaskIcon(t.text) || groupMeta[g].FallbackIcon;
                const isExpanded = expandedId === t.id;
                const hasSubtasks = t.subtasks && t.subtasks.length > 0;
                const doneSubs = hasSubtasks ? t.subtasks.filter((s) => s.done).length : 0;
                return (
                  <NeoSurface key={t.id} style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 12, flexShrink: 0, background: theme.bg,
                        boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center",
                        color: t.done ? theme.textSecondary : groupMeta[g].color, opacity: t.done ? 0.5 : 1,
                      }}>
                        <TaskIcon size={16} />
                      </div>
                      <button onClick={() => toggleDone(t.id)} style={{
                        width: 24, height: 24, borderRadius: "50%", border: "none", flexShrink: 0,
                        background: theme.bg, boxShadow: t.done ? theme.shadowPressed : theme.shadowRaisedSm,
                        color: t.done ? theme.accent2 : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {t.done && <Check size={14} />}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: t.done ? theme.textSecondary : theme.textPrimary, fontSize: 13.5, textDecoration: t.done ? "line-through" : "none", ...fontBody }}>{t.text}</span>
                          <Flag size={11} color={PRIORITY_COLOR[t.priority]} fill={PRIORITY_COLOR[t.priority]} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                          {t.due && (
                            <span style={{ display: "flex", alignItems: "center", gap: 3, color: theme.textSecondary, fontSize: 10.5, ...fontBody }}>
                              <AlarmClock size={11} /> {t.due}
                            </span>
                          )}
                          {t.recurring && (
                            <span style={{ display: "flex", alignItems: "center", gap: 3, color: theme.textSecondary, fontSize: 10.5, ...fontBody }}>
                              <Repeat size={11} /> {t.recurring.join("/")}
                            </span>
                          )}
                          {hasSubtasks && (
                            <button onClick={() => setExpandedId(isExpanded ? null : t.id)} style={{ display: "flex", alignItems: "center", gap: 3, border: "none", background: "none", color: theme.accent, fontSize: 10.5, ...fontBody }}>
                              <ChevronDown size={11} style={{ transform: isExpanded ? "rotate(180deg)" : "none" }} /> {doneSubs}/{t.subtasks.length} subtasks
                            </button>
                          )}
                        </div>
                      </div>
                      {t.due && (
                        <button onClick={() => toggleReminder(t.id)} style={{ border: "none", background: "none", color: t.reminder ? theme.accent : theme.textSecondary, flexShrink: 0 }}><Bell size={14} /></button>
                      )}
                      <button onClick={() => scratch(t.id)} style={{ border: "none", background: "none", color: theme.textSecondary, flexShrink: 0 }}><X size={16} /></button>
                    </div>
                    {isExpanded && hasSubtasks && (
                      <div style={{ marginTop: 10, marginLeft: 42, display: "flex", flexDirection: "column", gap: 6 }}>
                        {t.subtasks.map((s) => (
                          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button onClick={() => toggleSubtask(t.id, s.id)} style={{
                              width: 18, height: 18, borderRadius: 6, border: "none", flexShrink: 0,
                              background: theme.bg, boxShadow: s.done ? theme.shadowPressed : theme.shadowRaisedSm,
                              color: s.done ? theme.accent2 : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                            }}>{s.done && <Check size={11} />}</button>
                            <span style={{ color: s.done ? theme.textSecondary : theme.textPrimary, fontSize: 12, textDecoration: s.done ? "line-through" : "none", ...fontBody }}>{s.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </NeoSurface>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ---------------------------------- INSIGHTS TAB ---------------------------------- */

  function InsightsTab() {
    const [insightIdx, setInsightIdx] = useState(0);
    const [askInput, setAskInput] = useState("");
    const [askAnswer, setAskAnswer] = useState(null);
    const [asking, setAsking] = useState(false);

    const CORRELATIONS = [
      "Your best focus days are also your lowest-spend days \u2014 Tuesday and Thursday average 70+ focus minutes and under \u20B9200 spent.",
      "Days you complete 3+ todos before noon, you log 35% more focus minutes in the afternoon.",
    ];
    const BADGES = [
      { icon: Flame, label: "7-day streak", earned: true, color: "#ff9f43" },
      { icon: Award, label: "50 sessions", earned: true, color: theme.accent },
      { icon: Zap, label: "Early bird", earned: true, color: theme.accent2 },
      { icon: Target, label: "Budget master", earned: false, color: theme.textSecondary },
    ];

    const askAI = () => {
      if (!askInput.trim()) return;
      setAsking(true);
      setTimeout(() => {
        setAsking(false);
        setAskAnswer(`Based on this week's data: you spent \u20B93,370 on Food and Transport combined, and logged 330 focus minutes \u2014 both roughly in line with your monthly average.`);
      }, 900);
    };
    const weekly = [
      { day: "Mon", mins: 40 }, { day: "Tue", mins: 65 }, { day: "Wed", mins: 25 },
      { day: "Thu", mins: 80 }, { day: "Fri", mins: 55 }, { day: "Sat", mins: 20 }, { day: "Sun", mins: 45 },
    ];
    const categoryData = [
      { name: "Food", value: 1840, color: "#7c6ff0" },
      { name: "Transport", value: 320, color: "#3dd6c8" },
      { name: "Bills", value: 1210, color: "#ff6b6b" },
      { name: "Entertainment", value: 649, color: "#ffb648" },
    ];
    const monthly = [
      { m: "Feb", income: 60000, expense: 41000 }, { m: "Mar", income: 60000, expense: 38500 },
      { m: "Apr", income: 62000, expense: 45000 }, { m: "May", income: 61000, expense: 39800 },
      { m: "Jun", income: 63000, expense: 47200 }, { m: "Jul", income: 73000, expense: 4019 },
    ];
    const todoStats = [{ name: "Done", value: 1, color: "#3dd6c8" }, { name: "Pending", value: 4, color: darkMode ? "#3a4051" : "#c9cfda" }];

    return (
      <div style={{ padding: "18px 18px 100px" }}>
        <NeoSurface style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Sparkles size={16} color={theme.accent} />
            <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13.5, ...fontDisplay }}>AI insight</span>
            <span style={{ color: theme.textSecondary, fontSize: 10.5, marginLeft: "auto", ...fontBody }}>Gemini 2.0 Flash</span>
          </div>
          <div style={{ color: theme.textPrimary, fontSize: 13, lineHeight: 1.5, ...fontBody }}>{AI_INSIGHTS[insightIdx]}</div>
          <button onClick={() => setInsightIdx((i) => (i + 1) % AI_INSIGHTS.length)} style={{
            marginTop: 12, border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm, color: theme.accent,
            borderRadius: 12, padding: "8px 14px", fontSize: 12, fontWeight: 600, ...fontBody,
          }}>Generate another insight</button>
        </NeoSurface>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Ask your data</SectionLabel>
          <NeoSurface style={{ padding: 14 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <NeoInput placeholder="How much did I spend on food last week?" value={askInput} onChange={(e) => setAskInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && askAI()} />
              </div>
              <button onClick={askAI} style={{
                width: 46, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${theme.accent}, #5a4fcf)`,
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              }}><Send size={16} /></button>
            </div>
            {(asking || askAnswer) && (
              <div style={{ marginTop: 12, background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 12, padding: 12, display: "flex", gap: 8 }}>
                <MessageSquare size={14} color={theme.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ color: theme.textPrimary, fontSize: 12.5, lineHeight: 1.5, ...fontBody }}>
                  {asking ? "Thinking\u2026" : askAnswer}
                </div>
              </div>
            )}
          </NeoSurface>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Weekly digest</SectionLabel>
          <NeoSurface style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Layers size={15} color={theme.accent2} />
              <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13, ...fontDisplay }}>Jun 30 \u2013 Jul 6 summary</span>
            </div>
            <div style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 1.6, ...fontBody }}>
              330 focus minutes across 6 sessions, \u20B94,019 spent (down 12% from last week), and 4 of 5 todos completed. Your best day was Thursday.
            </div>
          </NeoSurface>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Cross-data patterns</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CORRELATIONS.map((c, i) => (
              <NeoSurface key={i} style={{ padding: 14, display: "flex", gap: 10 }}>
                <TrendingUp size={15} color={theme.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ color: theme.textPrimary, fontSize: 12, lineHeight: 1.5, ...fontBody }}>{c}</div>
              </NeoSurface>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Streaks & badges</SectionLabel>
          <NeoSurface style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
              {BADGES.map((b) => {
                const BIcon = b.icon;
                return (
                  <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, width: 74, opacity: b.earned ? 1 : 0.4 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: theme.bg, boxShadow: b.earned ? theme.shadowRaisedSm : theme.shadowPressed, display: "flex", alignItems: "center", justifyContent: "center", color: b.color }}>
                      <BIcon size={20} />
                    </div>
                    <span style={{ color: theme.textSecondary, fontSize: 9.5, textAlign: "center", ...fontBody }}>{b.label}</span>
                  </div>
                );
              })}
            </div>
          </NeoSurface>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Focus minutes this week</SectionLabel>
          <NeoSurface style={{ padding: "14px 8px" }}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weekly}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: theme.textSecondary }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: theme.bg, border: "none", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="mins" radius={[8, 8, 8, 8]} fill={theme.accent} />
              </BarChart>
            </ResponsiveContainer>
          </NeoSurface>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <SectionLabel>Expense split</SectionLabel>
            <NeoSurface style={{ padding: 10 }}>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={35} outerRadius={55} paddingAngle={3}>
                    {categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: theme.bg, border: "none", borderRadius: 10, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </NeoSurface>
          </div>
          <div style={{ flex: 1 }}>
            <SectionLabel>Todo completion</SectionLabel>
            <NeoSurface style={{ padding: 10 }}>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={todoStats} dataKey="value" nameKey="name" innerRadius={35} outerRadius={55} paddingAngle={3}>
                    {todoStats.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: theme.bg, border: "none", borderRadius: 10, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </NeoSurface>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Income vs expense (6 months)</SectionLabel>
          <NeoSurface style={{ padding: "14px 8px" }}>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#323848" : "#c9cfda"} vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: theme.textSecondary }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: theme.bg, border: "none", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="income" fill={theme.accent2} radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill={theme.danger} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </NeoSurface>
        </div>
      </div>
    );
  }

  /* ---------------------------------- GLOBAL SEARCH ---------------------------------- */

  function SearchOverlay() {
    const q = searchQuery.trim().toLowerCase();
    const results = q ? SEARCH_INDEX.filter((r) => r.label.toLowerCase().includes(q)) : SEARCH_INDEX;
    const typeColor = { expense: theme.danger, todo: theme.accent, session: theme.accent2 };
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 60, display: "flex", justifyContent: "center", padding: "60px 12px 24px" }}>
        <div style={{ width: 390, maxWidth: "100%" }}>
          <NeoSurface style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Search size={16} color={theme.textSecondary} />
              <input
                autoFocus
                placeholder="Search expenses, todos, sessions\u2026"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: "none", background: "none", outline: "none", color: theme.textPrimary, fontSize: 14, ...fontBody }}
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} style={{ border: "none", background: "none", color: theme.textSecondary }}><X size={18} /></button>
            </div>
          </NeoSurface>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map((r, i) => {
              const RIcon = r.icon;
              return (
                <NeoSurface key={i} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: typeColor[r.type], flexShrink: 0 }}>
                    <RIcon size={15} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 13, ...fontBody }}>{r.label}</div>
                    <div style={{ color: theme.textSecondary, fontSize: 10.5, ...fontBody }}>{r.meta}</div>
                  </div>
                  <span style={{ color: typeColor[r.type], fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, ...fontBody }}>{r.type}</span>
                </NeoSurface>
              );
            })}
            {results.length === 0 && (
              <div style={{ color: theme.textSecondary, fontSize: 12.5, textAlign: "center", padding: 20, ...fontBody }}>No matches across expenses, todos, or sessions.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------- WIDGET PREVIEW ---------------------------------- */

  function WidgetPreviewModal() {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 24 }}>
        <NeoSurface style={{ padding: 22, width: "100%", maxWidth: 340 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Layers size={17} color={theme.accent} />
              <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 14.5, ...fontDisplay }}>Home screen widget</span>
            </div>
            <button onClick={() => setShowWidget(false)} style={{ border: "none", background: "none", color: theme.textSecondary }}><X size={18} /></button>
          </div>

          <div style={{ background: theme.bg, boxShadow: theme.shadowRaised, borderRadius: 24, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width={56} height={56}>
                <circle cx="28" cy="28" r="23" fill="none" stroke={darkMode ? "#1b1e25" : "#c9cfda"} strokeWidth="7" />
                <circle cx="28" cy="28" r="23" fill="none" stroke={theme.accent} strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 23} strokeDashoffset={2 * Math.PI * 23 * 0.38} transform="rotate(-90 28 28)" />
                <text x="28" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fill={theme.textPrimary} style={fontDisplay}>15:32</text>
              </svg>
              <div>
                <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13, ...fontDisplay }}>Focus running</div>
                <div style={{ color: theme.textSecondary, fontSize: 11, ...fontBody }}>Afternoon Deep Work</div>
              </div>
            </div>
            <div style={{ marginTop: 14, borderTop: `1px solid ${darkMode ? "#323848" : "#c9cfda"}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ color: theme.textSecondary, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", ...fontBody }}>Top 3 todos</div>
              {["Send client project report", "Buy groceries", "Revise chapter 4 notes"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Circle size={10} color={theme.accent} />
                  <span style={{ color: theme.textPrimary, fontSize: 12, ...fontBody }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ color: theme.textSecondary, fontSize: 11.5, marginTop: 12, lineHeight: 1.5, ...fontBody }}>
            Add this widget from your phone's home screen editor to see your live timer and top tasks at a glance.
          </div>
        </NeoSurface>
      </div>
    );
  }

  /* ---------------------------------- API KEY MODAL ---------------------------------- */

  function ApiKeyModal() {
    const [visible, setVisible] = useState(false);
    const [temp, setTemp] = useState(apiKey);
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 24 }}>
        <NeoSurface style={{ padding: 22, width: "100%", maxWidth: 340 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <KeyRound size={17} color={theme.accent} />
              <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 14.5, ...fontDisplay }}>Gemini API key</span>
            </div>
            <button onClick={() => setShowKeyModal(false)} style={{ border: "none", background: "none", color: theme.textSecondary }}><X size={18} /></button>
          </div>
          <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 12, lineHeight: 1.5, ...fontBody }}>
            Used to power AI insights with Gemini 2.0 Flash. Stored only for this session.
          </div>
          <div style={{ position: "relative" }}>
            <NeoInput type={visible ? "text" : "password"} placeholder="Paste your API key" value={temp} onChange={(e) => setTemp(e.target.value)} style={{ paddingRight: 40 }} />
            <button onClick={() => setVisible((v) => !v)} style={{ position: "absolute", right: 10, top: 10, border: "none", background: "none", color: theme.textSecondary }}>
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <PrimaryButton label="Save key" icon={<Check size={15} />} onClick={() => { setApiKey(temp); setShowKeyModal(false); }} style={{ width: "100%", marginTop: 14 }} />
        </NeoSurface>
      </div>
    );
  }

  /* ---------------------------------- LAYOUT ---------------------------------- */

  const TABS = [
    { id: "timer", label: "Timer", icon: TimerIcon },
    { id: "expense", label: "Expense", icon: Wallet },
    { id: "todo", label: "Todo", icon: ListChecks },
    { id: "insights", label: "Insights", icon: BarChart3 },
  ];
  const titles = { timer: "Focus Timer", expense: "Expense Tracker", todo: "Today's Tasks", insights: "Insights" };
  const subtitles = {
    timer: "Stay in the zone",
    expense: apiKey ? "Synced with AI insight engine" : "Track every rupee",
    todo: "Auto-sorted for you",
    insights: apiKey ? "Powered by your Gemini key" : "Add an API key for live AI insights",
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.pageBg, display: "flex", justifyContent: "center", padding: "24px 12px", ...fontBody }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes slideInRight { from { transform: translateX(28px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInLeft { from { transform: translateX(-28px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
      <div style={{ width: 390, maxWidth: "100%", background: theme.pageBg, borderRadius: 40, boxShadow: darkMode ? "0 20px 60px rgba(0,0,0,0.6)" : "0 20px 60px rgba(60,70,100,0.25)", overflow: "hidden", position: "relative", border: `8px solid ${darkMode ? "#0f1115" : "#c9cfda"}` }}>

        {/* header */}
        <div style={{ padding: "20px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 700, ...fontDisplay }}>{titles[activeTab]}</div>
            <div style={{ color: theme.textSecondary, fontSize: 11.5, marginTop: 2, ...fontBody }}>{subtitles[activeTab]}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <IconBtn size={38} icon={<Search size={15} />} onClick={() => setShowSearch(true)} />
            <IconBtn
              size={38}
              icon={
                <div style={{ position: "relative" }}>
                  <Cloud size={15} />
                  {syncState === "synced" && (
                    <div style={{ position: "absolute", bottom: -2, right: -3, width: 7, height: 7, borderRadius: "50%", background: theme.accent2, border: `1.5px solid ${theme.bg}` }} />
                  )}
                </div>
              }
              onClick={() => { setSyncState("syncing"); setTimeout(() => setSyncState("synced"), 1200); }}
            />
            <IconBtn size={38} icon={<Layers size={15} />} onClick={() => setShowWidget(true)} />
            <IconBtn icon={<KeyRound size={17} />} onClick={() => setShowKeyModal(true)} active={!!apiKey} />
            <IconBtn icon={darkMode ? <Sun size={17} /> : <Moon size={17} />} onClick={() => setDarkMode((v) => !v)} />
          </div>
        </div>

        {/* top pill tab bar */}
        <div style={{ padding: "0 18px 14px" }}>
          <div style={{ display: "flex", gap: 4, background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 18, padding: 4 }}>
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => switchTab(t.id)}
                  style={{
                    flex: 1, border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    padding: "9px 4px", borderRadius: 14,
                    background: active ? `linear-gradient(135deg, ${theme.accent}, #5a4fcf)` : "transparent",
                    boxShadow: active ? "3px 3px 8px rgba(124,111,240,0.35)" : "none",
                    color: active ? "#fff" : theme.textSecondary,
                    transition: "background .2s, color .2s",
                  }}
                >
                  <Icon size={16} />
                  <span style={{ fontSize: 10.5, fontWeight: 600, ...fontBody }}>{t.label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 8 }}>
            {TAB_ORDER.map((id) => (
              <div key={id} style={{
                width: id === activeTab ? 14 : 5, height: 5, borderRadius: 3,
                background: id === activeTab ? theme.accent : (darkMode ? "#3a4051" : "#c9cfda"),
                transition: "width .2s",
              }} />
            ))}
          </div>
        </div>

        {/* swipeable content */}
        <div
          style={{ height: 610, overflowY: "auto", overflowX: "hidden" }}
          onMouseDown={onSwipeStart}
          onMouseUp={onSwipeEnd}
          onTouchStart={onSwipeStart}
          onTouchEnd={onSwipeEnd}
        >
          <div key={activeTab} style={{ animation: `${direction > 0 ? "slideInRight" : "slideInLeft"} 0.25s ease` }}>
            {activeTab === "timer" && <TimerTab />}
            {activeTab === "expense" && <ExpenseTab />}
            {activeTab === "todo" && <TodoTab />}
            {activeTab === "insights" && <InsightsTab />}
          </div>
        </div>
      </div>

      {showKeyModal && <ApiKeyModal />}
      {showSearch && <SearchOverlay />}
      {showWidget && <WidgetPreviewModal />}
    </div>
  );
}
