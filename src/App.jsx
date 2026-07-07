import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { GoogleGenAI } from "@google/genai";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Preferences } from '@capacitor/preferences';
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
  Video,
  Upload,
  Pencil,
  Trash2,
  Repeat,
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
  BookOpen,
  DollarSign,
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
  Calendar,
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
  Copy,
  AlarmClock,
  Hourglass,
  Square,
  MonitorPlay,
  Settings,
} from "lucide-react";
import Strands from "./components/Strands";
import BreathingExercise from "./components/BreathingExercise";
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
  { id: "shlokas", label: "Shlokas" },
  { id: "mozart", label: "Mozart" },
  { id: "endel", label: "Endel" },
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



/* ---------------------------------- root ---------------------------------- */

const TAB_ORDER = ["timer", "expense", "todo", "insights"];


const useLocalStorage = (key, initialValue) => {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {}
  }, [key, state]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) setState(JSON.parse(item));
      } catch(e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [state, setState];
};

const MaskedField = ({ label, value, theme, fontBody, isSensitive = false }) => {
  const [show, setShow] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  
  const handleCopy = () => {
    if (!value) {
      setCopyMsg("No data present");
      setTimeout(() => setCopyMsg(""), 2000);
      return;
    }
    navigator.clipboard.writeText(value);
    setCopyMsg("Copied!");
    setTimeout(() => setCopyMsg(""), 2000);
  };
  
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <div>
        <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{label}</div>
        <div style={{ color: theme.textPrimary, fontSize: 14, ...fontBody }}>
          {isSensitive && !show ? "••••••••••••" : value || "-"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {copyMsg && <span style={{ color: copyMsg === "Copied!" ? theme.success : theme.danger, fontSize: 11, fontWeight: 700 }}>{copyMsg}</span>}
        {isSensitive && (
          <button onClick={() => setShow(!show)} style={{ border: "none", background: "none", color: theme.textSecondary, cursor: "pointer", padding: 4 }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        <button onClick={handleCopy} style={{ border: "none", background: "none", color: theme.textSecondary, cursor: "pointer", padding: 4 }}>
          {copyMsg === "Copied!" ? <Check size={16} color={theme.success} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
};

export default function NeoApp() {

  const [activeTab, setActiveTab] = useState("timer");
  const [history, setHistory] = useLocalStorage("neo_history", []);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useLocalStorage("neo_dailyGoalMinutes", 240);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [name, setName] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [remaining, setRemaining] = useState(25 * 60);
    
    const [activeSource, setActiveSource] = useState('piano');
    const [audioUrl, setAudioUrl] = useState(null);
    const [youtubeId, setYoutubeId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const fileInputRef = useRef(null);
    const audioRef = useRef(null);

    const audioCtxRef = useRef(null);
    const oscillatorIntervalRef = useRef(null);
    const alarmTimeoutRef = useRef(null);

    const initAudioCtx = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    };

    const stopAlarm = () => {
      if (oscillatorIntervalRef.current) {
        clearInterval(oscillatorIntervalRef.current);
        oscillatorIntervalRef.current = null;
      }
      if (alarmTimeoutRef.current) {
        clearTimeout(alarmTimeoutRef.current);
        alarmTimeoutRef.current = null;
      }
    };

    const playAlarm = () => {
      initAudioCtx();
      const ctx = audioCtxRef.current;
      
      oscillatorIntervalRef.current = setInterval(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }, 500);

      alarmTimeoutRef.current = setTimeout(() => {
        stopAlarm();
      }, 60000);
    };

    const ytPlayerRef = useRef(null);
    const [ytLink, setYtLink] = useState("");
    
    useEffect(() => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }, []);

    useEffect(() => {
      if (activeSource === 'youtube' && youtubeId && window.YT && window.YT.Player) {
        if (!ytPlayerRef.current) {
          ytPlayerRef.current = new window.YT.Player('yt-audio-player', {
            videoId: youtubeId,
            height: '0',
            width: '0',
            events: { 
              onReady: (e) => { if (isPlaying) e.target.playVideo(); },
              onStateChange: (e) => { if (e.data === window.YT.PlayerState.ENDED) setIsPlaying(false); }
            },
          });
        } else {
          ytPlayerRef.current.loadVideoById(youtubeId);
          if (isPlaying) ytPlayerRef.current.playVideo();
        }
      }
    }, [youtubeId, activeSource]);

    useEffect(() => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: activeSource, artist: 'NeoApp' });
        navigator.mediaSession.setActionHandler('play', () => {
          setIsPlaying(true);
          if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.playVideo) ytPlayerRef.current.playVideo();
          else if (audioRef.current) audioRef.current.play();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          setIsPlaying(false);
          if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
          else if (audioRef.current) audioRef.current.pause();
        });
      }
    }, [activeSource]);

    useEffect(() => {
      if (!audioRef.current || audioRef.current.src) return;
      if (['piano', 'rain', 'ocean', 'white', 'forest', 'shlokas', 'mozart', 'endel', 'cafe'].includes(activeSource)) {
        audioRef.current.src = `audio/${activeSource}.mp3`;
        audioRef.current.loop = true;
      }
    }, []);

    const handlePlayPause = () => {
      const newIsPlaying = !isPlaying;
      setIsPlaying(newIsPlaying);
      if (newIsPlaying) {
        if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.playVideo) ytPlayerRef.current.playVideo();
        else if (audioRef.current) audioRef.current.play().catch(e => console.error(e));
      } else {
        if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
        else if (audioRef.current) audioRef.current.pause();
      }
    };

    const handleStop = () => {
      setIsPlaying(false);
      if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
      else if (audioRef.current) audioRef.current.pause();
    };

    const handleReset = () => {
      setIsPlaying(false);
      if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.seekTo) {
        ytPlayerRef.current.pauseVideo();
        ytPlayerRef.current.seekTo(0);
      } else if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
    

    
    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (audioRef.current) audioRef.current.pause();
        if (ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
        setAudioUrl(URL.createObjectURL(file));
        setActiveSource('upload');
      }
    };

    const extractYoutubeId = (url) => {
      const match = url.match(/(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? match[1] : null;
    };

    const svgRef = useRef(null);
    const [mode, setMode] = useState("focus"); // focus | pomodoro
    const [pomoPhase, setPomoPhase] = useState("Focus"); // Focus | Break
    const [pomoCycle, setPomoCycle] = useState(1);
    const [streak, setStreak] = useLocalStorage("neo_streak", 3);
    const [linkedTodo, setLinkedTodo] = useState(null);
    const [showTodoPicker, setShowTodoPicker] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [sessionNote, setSessionNote] = useState("");

  const [transactions, setTransactions] = useLocalStorage("neo_transactions", []);
  const [todos, setTodos] = useLocalStorage("neo_todos", []);
    const [categoryBudgets, setCategoryBudgets] = useLocalStorage("neo_categoryBudgets", {});
  const [balances, setBalances] = useLocalStorage("neo_balances", { bank: 14250.00, cash: 340.50 });
  const [upcomingBills, setUpcomingBills] = useLocalStorage("neo_upcomingBills", [
    { id: 1, name: "Netflix", amount: 649, daysLeft: 2 },
    { id: 2, name: "Electricity Bill", amount: 1450, daysLeft: 5 },
    { id: 3, name: "Rent", amount: 14000, daysLeft: 9 },
  ]);

  // Timer States
  const [showDailyGoalModal, setShowDailyGoalModal] = useState(false);
  const [tempDailyGoal, setTempDailyGoal] = useState("");

  // Bank Details States
  const [banks, setBanks] = useLocalStorage("neo_banks", []);
  const [showBanksList, setShowBanksList] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingBankId, setEditingBankId] = useState(null);
  const [bankFormState, setBankFormState] = useState({
    bankName: "", accountNumber: "", ifsc: "", cardType: "Debit", cardNumber: "",
    expiry: "", cvv: "", pin: "", netbankingUser: "", netbankingPass: ""
  });

  // Expense States
  const [showForm, setShowForm] = useState(false);
  const [showEditBalanceModal, setShowEditBalanceModal] = useState(false);
  const [editingBalanceAcc, setEditingBalanceAcc] = useState(null);
  const [tempBalance, setTempBalance] = useState("");
  const [showBillModal, setShowBillModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [billFormState, setBillFormState] = useState({ name: "", amount: "", daysLeft: "" });

  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState("Food");
  const [newType, setNewType] = useState("expense");
  const [newDate, setNewDate] = useState("");
  const [newMethod, setNewMethod] = useState("Cash");
  const [editingTxId, setEditingTxId] = useState(null);
  const [activeAccount, setActiveAccount] = useState("bank");
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editCategory, setEditCategory] = useState("Food");
  const [editBudgetVal, setEditBudgetVal] = useState("");

  // Todo States

  // Insights States

  const searchIndex = [
    ...transactions.map(t => ({ type: "expense", icon: t.type === 'expense' ? ShoppingCart : Landmark, label: t.name, meta: `₹${t.amount.toLocaleString()} · ${t.date}`, item: t })),
    ...todos.map(t => ({ type: "todo", icon: FileText, label: t.text, meta: `${t.priority} priority`, item: t })),
    ...history.map(h => ({ type: "session", icon: TimerIcon, label: h.note || h.type, meta: `${h.minutes}m · ${h.date}`, item: h }))
  ];
        const [darkMode, setDarkMode] = useLocalStorage("neo_darkMode", false);
  
  // Migrate old todos to have a date of today if they don't have one
  useEffect(() => {
    if (todos.some(t => !t.date)) {
      const todayStr = new Date().toISOString().split('T')[0];
      setTodos(ts => ts.map(t => t.date ? t : { ...t, date: todayStr }));
    }
  }, [todos, setTodos]);

  // Sync today's tasks to Capacitor Preferences for Android Widget
  useEffect(() => {
    const syncToNativeWidget = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysTasks = todos.filter(t => t.date === todayStr);
        // Only keep necessary fields to avoid huge payload
        const simplified = todaysTasks.map(t => ({ id: t.id, text: t.text, done: t.done }));
        await Preferences.set({
          key: 'widget_tasks',
          value: JSON.stringify(simplified)
        });
      } catch (e) {
        console.error("Failed to sync to widget", e);
      }
    };
    syncToNativeWidget();
  }, [todos]);

  const [todoInput, setTodoInput] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [newPriority, setNewPriority] = useState("Medium");
  const [showReminder, setShowReminder] = useState(false);
  const [showTaskOptions, setShowTaskOptions] = useState(false);
  const [newRecurringDays, setNewRecurringDays] = useState([]);

  // Planner States

  const [monthlySummary, setMonthlySummary] = useState("");


  // Insights States
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
  const [askInput, setAskInput] = useState("");
  const [askAnswer, setAskAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedInsight, setGeneratedInsight] = useState(null);


  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [direction, setDirection] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  const theme = useMemo(() => ({
    pageBg: darkMode ? "#15171c" : "#dfe4ee",
    bg: darkMode ? "#262b36" : "#e4e9f2",
    shadowRaised: darkMode
      ? "8px 8px 16px #1b1e25, -8px -8px 16px #313747"
      : "8px 8px 16px #b7bdc8, -8px -8px 16px #ffffff",
    shadowRaisedSm: darkMode
      ? "4px 4px 8px #1b1e25, -4px -4px 8px #313747"
      : "4px 4px 8px #b7bdc8, -4px -4px 8px #ffffff",
    shadowPressed: darkMode
      ? "inset 8px 8px 16px #1b1e25, inset -8px -8px 16px #313747"
      : "inset 8px 8px 16px #b7bdc8, inset -8px -8px 16px #ffffff",
    textPrimary: darkMode ? "#e2e6f0" : "#2d3446",
    textSecondary: darkMode ? "#8991a3" : "#7c8494",
    accent: "#7c6ff0",
    accent2: "#3dd6c8",
    danger: "#ff6b6b",
    border: darkMode ? "#323848" : "#ffffff",
  }), [darkMode]);

  const fontDisplay = { fontFamily: "'Poppins', sans-serif" };
  const fontBody = { fontFamily: "'Inter', sans-serif" };

  /* ---------- shared neomorphic primitives ---------- */

  const NeoSurface = useCallback(({ children, style, pressed, onClick, className = "", ...props }) => (
    <div
      onClick={onClick}
      className={className}
      {...props}
      style={{
        background: theme.bg,
        boxShadow: pressed ? theme.shadowPressed : theme.shadowRaised,
        borderRadius: 20,
        ...style,
      }}
    >
      {children}
    </div>
  ), [theme]);

  const IconBtn = useCallback(({ icon, onClick, active, size = 44 }) => (
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
  ), [theme]);

  const Chip = useCallback(({ label, active, onClick, colorActive }) => (
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
  ), [theme]);

  const PrimaryButton = useCallback(({ label, icon, onClick, style }) => (
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
  ), [theme]);

  const NeoInput = useCallback((props) => (
    <input
      {...props}
      style={{
        width: "100%",
        boxSizing: "border-box",
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
  ), [theme]);

  const SectionLabel = useCallback(({ children, style }) => (
    <div style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12, ...fontDisplay, ...style }}>
      {children}
    </div>
  ), [theme]);

  const WheelPicker = useCallback(({ options, value, onChange, label, disabled = false }) => {
    const containerRef = useRef(null);
    const itemHeight = 44;

    useEffect(() => {
      const idx = options.indexOf(value);
      if (idx !== -1 && containerRef.current) {
        if (disabled) {
          containerRef.current.scrollTo({ top: idx * itemHeight, behavior: 'smooth' });
        } else {
          containerRef.current.scrollTop = idx * itemHeight;
        }
      }
    }, [value, options, disabled]);

    const handleScroll = (e) => {
      const idx = Math.round(e.target.scrollTop / itemHeight);
      if (options[idx] !== undefined && options[idx] !== value) {
        onChange(options[idx]);
        if (!disabled) {
          try {
            Haptics.impact({ style: ImpactStyle.Light });
          } catch (err) {}
        }
      }
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          style={{ 
            height: itemHeight * 3, 
            width: 60, 
            overflowY: 'auto', 
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            position: 'relative',
            pointerEvents: disabled ? 'none' : 'auto'
          }}
        >
          <div style={{ height: itemHeight }} /> {/* padding top */}
          {options.map((opt) => (
            <div 
              key={opt} 
              style={{ 
                height: itemHeight, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                scrollSnapAlign: 'center',
                fontSize: 24,
                fontWeight: 700,
                color: opt === value ? theme.textPrimary : theme.textSecondary,
                opacity: opt === value ? 1 : 0.3,
                transition: 'all 0.2s',
                ...fontDisplay
              }}
            >
              {opt.toString().padStart(2, '0')}
            </div>
          ))}
          <div style={{ height: itemHeight }} /> {/* padding bottom */}
        </div>
        <div style={{ color: theme.textSecondary, fontSize: 14, fontWeight: 600, ...fontBody }}>
          {label}
        </div>
      </div>
    );
  }, [theme]);

    useEffect(() => {
      if (!isRunning) setRemaining(hours * 3600 + minutes * 60 + seconds);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hours, minutes, seconds]);
    useEffect(() => {
      if (!isRunning) return;
      if (remaining <= 0) {
        setIsRunning(false);
        setIsPlaying(false);
        if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
        else if (audioRef.current) audioRef.current.pause();
        playAlarm();
        if (mode === "pomodoro") {
          if (pomoPhase === "Focus") {
            setHistory((h) => [
              { id: Date.now(), name: name || autoTimerName(minutes), minutes, date: "Just now" },
              ...h,
            ]);
            setStreak((s) => s + 1);
            setShowNoteModal(true);
            setPomoPhase("Break");
            setHours(0); setMinutes(pomoCycle % 4 === 0 ? 15 : 5); setSeconds(0);
          } else {
            setPomoPhase("Focus");
            setPomoCycle((c) => c + 1);
            setHours(0); setMinutes(25); setSeconds(0);
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

    const resetTimer = () => {
      stopAlarm();
      setIsRunning(false);
      setRemaining(hours * 3600 + minutes * 60 + seconds);
      setIsPlaying(false);
      if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
      else if (audioRef.current) audioRef.current.pause();
    };
  const renderTimerTab = () => {
    const LINKABLE_TODOS = todos.filter(t => !t.done).map(t => t.text);

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



    


    const svgSize = 280;
    const center = svgSize / 2;
    const r = 90;
    const circumference = 2 * Math.PI * r;
    const progress = Math.min(minutes, 60) / 60;
    const dashOffset = circumference * (1 - progress);
    const angleRad = (progress * 360 - 90) * (Math.PI / 180);
    const knobX = center + r * Math.cos(angleRad);
    const knobY = center + r * Math.sin(angleRad);
    const ticks = Array.from({length: 40}).map((_, i) => {
        const a = (i / 40) * 360 * (Math.PI / 180);
        return {
            x1: center + 115 * Math.cos(a),
            y1: center + 115 * Math.sin(a),
            x2: center + 125 * Math.cos(a),
            y2: center + 125 * Math.sin(a)
        };
    });

    const toggleStart = () => {
      initAudioCtx();
      stopAlarm();
      if (!isRunning && !name) setName(autoTimerName(minutes));
      const willRun = !isRunning;
      setIsRunning(willRun);
      setIsPlaying(willRun);
      if (willRun) {
        if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.playVideo) ytPlayerRef.current.playVideo();
        else if (audioRef.current) audioRef.current.play().catch(e => console.error("Audio error:", e));
      } else {
        if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
        else if (audioRef.current) audioRef.current.pause();
      }
    };

    return (
      <div style={{ padding: "18px 18px 100px" }}>
        <BreathingExercise theme={theme} darkMode={darkMode} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 4, background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 14, padding: 4 }}>
            {["focus", "pomodoro"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setIsRunning(false); if (m === "pomodoro") { setPomoPhase("Focus"); setHours(0); setMinutes(25); setSeconds(0); } }} style={{
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

        <NeoSurface style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: svgSize, gap: 16 }}>
            <WheelPicker 
              options={Array.from({length: 24}, (_, i) => i)} 
              value={isRunning ? Math.floor(remaining / 3600) : hours} 
              onChange={setHours} 
              label="hours" 
              disabled={isRunning}
            />
            <WheelPicker 
              options={Array.from({length: 60}, (_, i) => i)} 
              value={isRunning ? Math.floor((remaining % 3600) / 60) : minutes} 
              onChange={setMinutes} 
              label="min" 
              disabled={isRunning}
            />
            <WheelPicker 
              options={Array.from({length: 60}, (_, i) => i)} 
              value={isRunning ? remaining % 60 : seconds} 
              onChange={setSeconds} 
              label="sec" 
              disabled={isRunning}
            />
          </div>

          <div style={{ marginTop: 18, width: "100%", position: "relative", zIndex: 1 }}>
            <NeoInput
              placeholder={autoTimerName(minutes) + " (auto if left blank)"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button onClick={() => setShowTodoPicker((v) => !v)} style={{
            position: "relative", zIndex: 1, marginTop: 10, width: "100%", border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm,
            borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, color: linkedTodo ? theme.accent : theme.textSecondary, fontSize: 12.5, fontWeight: 600, ...fontBody,
          }}>
            <Target size={14} />
            {linkedTodo ? `Focus on: ${linkedTodo}` : "Link to a todo (optional)"}
            <ChevronDown size={14} style={{ marginLeft: "auto" }} />
          </button>
          {showTodoPicker && (
            <div style={{ position: "relative", zIndex: 2, width: "100%", marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {LINKABLE_TODOS.map((t) => (
                <button key={t} onClick={() => { setLinkedTodo(t); setShowTodoPicker(false); }} style={{
                  textAlign: "left", border: "none", background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 10,
                  padding: "9px 12px", color: theme.textPrimary, fontSize: 12, ...fontBody,
                }}>{t}</button>
              ))}
            </div>
          )}

        </NeoSurface>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>AMBIENCE / MUSIC</SectionLabel>
          <NeoSurface style={{ padding: 20, display: "flex", flexDirection: "column" }}>
            {/* Horizontal Tabs */}
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
                      padding: "12px 24px",
                      borderRadius: 16,
                      border: "none",
                      fontWeight: 600,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: isActive ? `linear-gradient(135deg, ${theme.accent}, #5a4fcf)` : theme.bg,
                      color: isActive ? "#fff" : theme.textSecondary,
                      boxShadow: isActive ? "inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.1)" : theme.shadowRaisedSm,
                      transition: "all 0.3s ease",
                      cursor: "pointer"
                    }}
                  >
                    {m.label}
                    {isActive && (
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 12, marginLeft: 4 }}>
                         <div style={{ width: 3, height: "100%", background: "#fff", borderRadius: 2, transformOrigin: "bottom", animation: isPlaying ? "eqBounce 0.6s infinite ease-in-out alternate" : "none" }} />
                         <div style={{ width: 3, height: "100%", background: "#fff", borderRadius: 2, transformOrigin: "bottom", animation: isPlaying ? "eqBounce 0.5s infinite ease-in-out alternate 0.2s" : "none" }} />
                         <div style={{ width: 3, height: "100%", background: "#fff", borderRadius: 2, transformOrigin: "bottom", animation: isPlaying ? "eqBounce 0.7s infinite ease-in-out alternate 0.4s" : "none" }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Progress Bar (Visual Loop) */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
              <span style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 500 }}>0:00</span>
              <div style={{ flex: 1, height: 6, background: darkMode ? "#1b1e25" : "#e0e5ed", borderRadius: 3, overflow: "hidden", position: "relative", boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.2)" }}>
                {isPlaying && (
                  <div style={{ position: "absolute", height: "100%", background: theme.accent, borderRadius: 3, animation: "progressGlide 8s infinite linear" }} />
                )}
              </div>
              <span style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 500 }}>∞</span>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <button
                  onClick={toggleStart}
                  style={{
                    width: 58, height: 58, borderRadius: "50%", border: `2px solid ${darkMode ? "#2b2f3a" : "#d1d5db"}`,
                    background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: theme.shadowRaisedSm, cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${theme.accent}, #5a4fcf)`,
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.2)"
                  }}>
                    {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: 3 }} />}
                  </div>
                </button>
                <button 
                  onClick={resetTimer}
                  style={{ 
                    width: 40, height: 40, borderRadius: "50%", background: theme.bg, border: "none", 
                    boxShadow: theme.shadowPressed, display: "flex", alignItems: "center", justifyContent: "center",
                    color: theme.textSecondary, cursor: "pointer"
                  }}
                >
                  <RotateCcw size={16} />
                </button>
                <button 
                  onClick={() => { setIsRunning(false); setIsPlaying(false); if (audioRef.current) audioRef.current.pause(); }}
                  style={{ 
                    width: 40, height: 40, borderRadius: "50%", background: theme.bg, border: "none", 
                    boxShadow: theme.shadowPressed, display: "flex", alignItems: "center", justifyContent: "center",
                    color: theme.textSecondary, cursor: "pointer"
                  }}
                >
                  <Square size={14} />
                </button>
              </div>
              <div style={{ color: theme.textSecondary, fontSize: 12.5, fontWeight: 500 }}>
                Playing: {MUSIC_OPTIONS.find(m => m.id === activeSource)?.label}
              </div>
            </div>
          </NeoSurface>
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
              <div style={{ color: theme.textSecondary, fontSize: 11, textAlign: "right", ...fontBody }}>This week<br/><span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13 }}>{daysThisWeekWithFocus}/7 days</span></div>
            </div>
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
                <button onClick={() => { stopAlarm(); setShowNoteModal(false); setSessionNote(""); }} style={{ flex: 1, border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm, borderRadius: 14, padding: "11px 0", color: theme.textSecondary, fontWeight: 600, fontSize: 13, ...fontBody }}>Skip</button>
                <PrimaryButton label="Save note" icon={<Check size={15} />} onClick={() => { stopAlarm(); setShowNoteModal(false); setSessionNote(""); }} style={{ flex: 1 }} />
              </div>
            </NeoSurface>
          </div>
        )}

        {showDailyGoalModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 55, padding: 24 }}>
            <NeoSurface style={{ padding: 22, width: "100%", maxWidth: 320 }}>
              <div style={{ color: theme.textPrimary, fontSize: 16, fontWeight: 700, marginBottom: 16, ...fontDisplay }}>Edit daily focus goal</div>
              <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, ...fontBody }}>Goal (in minutes)</div>
              <NeoInput type="number" placeholder="e.g. 240" value={tempDailyGoal} onChange={(e) => setTempDailyGoal(e.target.value)} />
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={() => setShowDailyGoalModal(false)} style={{ flex: 1, border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm, borderRadius: 12, padding: "10px 0", color: theme.textSecondary, fontWeight: 600, fontSize: 13, cursor: "pointer", ...fontBody }}>Cancel</button>
                <button onClick={() => {
                  const newGoal = parseInt(tempDailyGoal);
                  if (!isNaN(newGoal) && newGoal > 0) {
                    setDailyGoalMinutes(newGoal);
                  }
                  setShowDailyGoalModal(false);
                }} style={{ flex: 1, border: "none", background: theme.accent, borderRadius: 12, padding: "10px 0", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", ...fontBody }}>Save Changes</button>
              </div>
            </NeoSurface>
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------- EXPENSE TAB ---------------------------------- */



  const renderExpenseTab = () => {
    const methodIcon = (m) => {
      if (!m) return null;
      const mStr = typeof m === "string" ? m.toLowerCase() : m.type;
      if (mStr === "cash") return <Banknote size={14} />;
      if (mStr === "card") return <CreditCard size={14} />;
      return <Smartphone size={14} />;
    };
    const methodLabel = (m) => {
      if (!m) return "";
      if (typeof m === "string") return m;
      return m.type === "upi" ? m.app : m.type === "card" ? "Card" : "Cash";
    };

    const spentThisMonth = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const spentByCategory = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
      }
    });

    const BUDGETS = EXPENSE_CATEGORIES.map(cat => ({
      category: cat,
      budget: categoryBudgets[cat] || 0,
      color: theme.accent
    }));

    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthLabel = `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
    const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
    const txByDay = {};
    transactions.forEach((t) => {
      const day = Number(t.date.split("-")[2]);
      txByDay[day] = txByDay[day] || [];
      txByDay[day].push(t);
    });
    const dayFiltered = selectedDate ? transactions.filter((t) => Number(t.date.split("-")[2]) === selectedDate) : transactions;

    const deleteTx = (id) => {
      setTransactions((t) => t.filter((x) => x.id !== id));
    };

    const openEdit = (tx) => {
      setEditingTxId(tx.id);
      setNewType(tx.type);
      setNewAmount(tx.amount.toString());
      setNewDesc(tx.name || tx.desc || "");
      setNewCat(tx.category || "Food");
      setNewMethod(tx.method || "Cash");
      setNewDate(tx.date === "Today" ? "" : tx.date);
      setShowForm(true);
    };

    const closeForm = () => {
      setShowForm(false);
      setEditingTxId(null);
      setNewAmount("");
      setNewDesc("");
      setNewDate("");
    };

    return (
      <div style={{ padding: "18px 18px 100px" }}>
        {showForm ? (
          <NeoSurface style={{ padding: 20, width: "100%", maxWidth: 360, maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: theme.textPrimary, ...fontDisplay }}>{editingTxId ? "Edit transaction" : "Add transaction"}</div>
              <button onClick={closeForm} style={{ border: "none", background: "none", color: theme.textSecondary }}><X size={20} /></button>
            </div>
            
            <div style={{ display: "flex", gap: 8, background: theme.bg, padding: 4, borderRadius: 16, boxShadow: theme.shadowInset }}>
              <div onClick={() => setNewType("expense")} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: newType === "expense" ? theme.danger : theme.textSecondary, background: newType === "expense" ? theme.bg : "transparent", boxShadow: newType === "expense" ? theme.shadowRaisedSm : "none", transition: "all .2s" }}>Expense</div>
              <div onClick={() => setNewType("income")} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: newType === "income" ? theme.success : theme.textSecondary, background: newType === "income" ? theme.bg : "transparent", boxShadow: newType === "income" ? theme.shadowRaisedSm : "none", transition: "all .2s" }}>Income</div>
            </div>

            <NeoSurface pressed style={{ padding: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: theme.accent, fontSize: 13, fontWeight: 600, marginTop: 4 }}>
              <Camera size={16} /> Scan receipt with AI
            </NeoSurface>

            <NeoInput type="number" placeholder="Amount" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
            <NeoInput placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            <NeoInput type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />

            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>CATEGORY</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(newType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(c => (
                <Chip key={c} label={c} active={newCat === c} onClick={() => setNewCat(c)} />
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>PAYMENT METHOD</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Cash", "Card", "UPI"].map(m => (
                <Chip key={m} label={m} active={newMethod === m} onClick={() => setNewMethod(m)} />
              ))}
            </div>

            <PrimaryButton label={editingTxId ? "Save Changes" : "Add transaction"} icon={<Check size={18} />} onClick={() => {
              if (newAmount) {
                const updatedTx = {
                  id: editingTxId || Date.now(),
                  type: newType,
                  amount: parseFloat(newAmount) || 0,
                  name: newDesc || (newType === "expense" ? "Expense" : "Income"),
                  desc: newDesc || (newType === "expense" ? "Expense" : "Income"),
                  category: newCat,
                  method: newMethod,
                  date: newDate || "Today"
                };
                if (editingTxId) {
                  setTransactions(t => t.map(x => x.id === editingTxId ? updatedTx : x));
                } else {
                  setTransactions(t => [updatedTx, ...t]);
                }
                closeForm();
              }
            }} style={{ marginTop: 8 }} />
          </NeoSurface>
        ) : (
          <>
            <div style={{ marginBottom: 24, marginTop: 8 }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Expense tracker</div>
              <div style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4, ...fontBody }}>Track your spending</div>
            </div>

            <div onTouchStart={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {[
                { id: "bank", label: "Bank", icon: Square, balance: balances.bank },
                { id: "cash", label: "Cash", icon: Square, balance: balances.cash },
              ].map(acc => (
                <NeoSurface key={acc.id} onClick={() => setActiveAccount(acc.id)} pressed={activeAccount === acc.id} style={{ minWidth: 145, flex: 1, padding: "20px", cursor: "pointer", borderRadius: 20, position: "relative" }}>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setEditingBalanceAcc(acc);
                    setTempBalance(acc.balance.toString());
                    setShowEditBalanceModal(true);
                  }} style={{ position: "absolute", top: 16, right: 16, border: "none", background: "none", cursor: "pointer", opacity: 0.2 }}>
                    <Pencil size={14} color={theme.textPrimary} />
                  </button>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%", background: theme.bg,
                    boxShadow: theme.shadowPressed, display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 16, color: theme.accent
                  }}>
                    <acc.icon size={18} strokeWidth={2.5} />
                  </div>
                  <div style={{ color: theme.textSecondary, fontSize: 14, fontWeight: 500, marginBottom: 4, ...fontBody }}>{acc.label}</div>
                  <div style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 700, ...fontDisplay }}>₹{acc.balance.toLocaleString()}</div>
                </NeoSurface>
              ))}
              <NeoSurface onClick={() => setShowBanksList(true)} style={{ minWidth: 145, padding: 20, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: theme.textSecondary, borderRadius: 20 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: "50%", background: theme.bg,
                    boxShadow: theme.shadowPressed, display: "flex", alignItems: "center", justifyContent: "center",
                    color: theme.accent
                  }}>
                    <Banknote size={18} strokeWidth={2.5} />
                  </div>
                <div style={{ fontSize: 14, fontWeight: 600, ...fontBody }}>Bank Details</div>
              </NeoSurface>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 32 }}>
              <div>
                <div style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4, ...fontBody }}>Spent this month</div>
                <div style={{ color: theme.textPrimary, fontSize: 32, fontWeight: 800, letterSpacing: -0.5, ...fontDisplay }}>
                  ₹{spentThisMonth.toLocaleString()}
                </div>
              </div>
              <PrimaryButton icon={<Square size={16} strokeWidth={2.5} />} label="New" onClick={() => setShowForm(true)} style={{ padding: "12px 24px", borderRadius: 16, fontSize: 15 }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <SectionLabel style={{ margin: 0, textTransform: "uppercase", fontSize: 13, letterSpacing: 0.5 }}>Category budgets</SectionLabel>
              <button onClick={() => setShowBudgetModal(true)} style={{ border: "none", background: "none", color: theme.accent, fontSize: 13, cursor: "pointer", fontWeight: 600, ...fontBody }}>Edit</button>
            </div>
            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 24, background: theme.bg, borderRadius: 24, boxShadow: theme.shadowPressed, marginBottom: 32 }}>
              {BUDGETS.map((b) => {
                const spent = spentByCategory[b.category] || 0;
                const pct = b.budget > 0 ? Math.min(100, (spent / b.budget) * 100) : 0;
                const over = b.budget > 0 && spent > b.budget;
                return (
                  <div key={b.category}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ color: theme.textPrimary, fontSize: 15, fontWeight: 500, ...fontBody }}>{b.category}</span>
                      <span style={{ color: over ? theme.danger : theme.textSecondary, fontSize: 15, fontWeight: 500, ...fontBody }}>
                        ₹{spent.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: theme.bg, boxShadow: theme.shadowPressed, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: over ? theme.danger : b.color, transition: "width .3s" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <SectionLabel>Recent transactions</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {transactions.slice(0, 4).map((t) => {
                const isExp = t.type === "expense";
                const Icon = DollarSign;
                return (
                  <NeoSurface key={t.id} style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: isExp ? `${theme.danger}15` : `${theme.success}15`, color: isExp ? theme.danger : theme.success, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: theme.textPrimary, fontSize: 14, fontWeight: 700, marginBottom: 2, ...fontBody }}>{t.desc}</div>
                      <div style={{ color: theme.textSecondary, fontSize: 11, ...fontBody }}>{t.category} • {t.date}</div>
                    </div>
                    <div style={{ color: isExp ? theme.textPrimary : theme.success, fontSize: 15, fontWeight: 800, ...fontBody }}>
                      {isExp ? "-" : "+"}₹{t.amount}
                    </div>
                  </NeoSurface>
                );
              })}
            </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionLabel>Upcoming bills</SectionLabel>
            <button onClick={() => {
              setEditingBill(null);
              setBillFormState({ name: "", amount: "", daysLeft: "" });
              setShowBillModal(true);
            }} style={{ border: "none", background: "none", color: theme.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", ...fontBody }}>+ Add</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingBills.map((b) => (
              <NeoSurface key={b.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: b.daysLeft <= 3 ? theme.danger : theme.accent }}>
                  <Bell size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 13.5, ...fontBody }}>{b.name}</div>
                  <div style={{ color: theme.textSecondary, fontSize: 11, ...fontBody }}>Due in {b.daysLeft} day{b.daysLeft !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13.5, marginRight: 8, ...fontDisplay }}>₹{b.amount.toLocaleString()}</div>
                <button onClick={() => {
                  setEditingBill(b);
                  setBillFormState({ name: b.name, amount: b.amount.toString(), daysLeft: b.daysLeft.toString() });
                  setShowBillModal(true);
                }} style={{ border: "none", background: "none", color: theme.textSecondary, cursor: "pointer" }}><Pencil size={14} /></button>
                <button onClick={() => setUpcomingBills(bills => bills.filter(x => x.id !== b.id))} style={{ border: "none", background: "none", color: theme.danger, cursor: "pointer" }}><Trash2 size={14} /></button>
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
                    color: isSelected ? theme.accent : theme.textPrimary, fontSize: 15, fontWeight: 600, position: "relative", ...fontBody,
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
                      {t.split && <span style={{ color: theme.accent }}>· split with {t.splitWith}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ color: t.type === "income" ? theme.accent2 : theme.danger, fontWeight: 700, fontSize: 13.5, ...fontDisplay }}>
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                    </div>
                    <button onClick={() => openEdit(t)} style={{ border: "none", background: "none", color: theme.textSecondary }}><Pencil size={14} /></button>
                    <button onClick={() => deleteTx(t.id)} style={{ border: "none", background: "none", color: theme.danger }}><Trash2 size={14} /></button>
                  </div>
                </NeoSurface>
              );
            })}
          </div>
        </div>

        {showBudgetModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
            <NeoSurface style={{ padding: 20, width: "100%", maxWidth: 320 }}>
              <div style={{ color: theme.textPrimary, fontSize: 16, fontWeight: 700, marginBottom: 16, ...fontDisplay }}>Set Budgets</div>
              <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
                {EXPENSE_CATEGORIES.map(cat => (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, ...fontBody }}>{cat}</div>
                    <NeoInput type="number" placeholder="No limit" value={categoryBudgets[cat] || ""} onChange={(e) => setCategoryBudgets(prev => ({...prev, [cat]: Number(e.target.value) || 0}))} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={() => setShowBudgetModal(false)} style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", ...fontBody }}>Done</button>
              </div>
            </NeoSurface>
          </div>
        )}

        {showBanksList && (
          <div style={{ position: "fixed", inset: 0, background: theme.bg, zIndex: 60, padding: "20px 20px 100px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <button onClick={() => setShowBanksList(false)} style={{ border: "none", background: "none", color: theme.textPrimary, cursor: "pointer" }}><ChevronLeft size={24} /></button>
              <div style={{ fontSize: 20, fontWeight: 800, color: theme.textPrimary, ...fontDisplay }}>Bank Details</div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {banks.length === 0 ? (
                <div style={{ color: theme.textSecondary, fontSize: 14, textAlign: "center", marginTop: 40, ...fontBody }}>No banks added yet.</div>
              ) : banks.map(bank => (
                <NeoSurface key={bank.id} style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>{bank.bankName}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => {
                        setEditingBankId(bank.id);
                        setBankFormState(bank);
                        setShowBankForm(true);
                      }} style={{ border: "none", background: "none", color: theme.textSecondary, cursor: "pointer" }}><Pencil size={16} /></button>
                      <button onClick={() => {
                        setBanks(prev => prev.filter(b => b.id !== bank.id));
                      }} style={{ border: "none", background: "none", color: theme.danger, cursor: "pointer" }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  
                  <MaskedField label="Account Number" value={bank.accountNumber} theme={theme} fontBody={fontBody} />
                  <MaskedField label="IFSC Code" value={bank.ifsc} theme={theme} fontBody={fontBody} />
                  <MaskedField label="Card Number" value={bank.cardNumber} theme={theme} fontBody={fontBody} />
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1 }}><MaskedField label="CVV" value={bank.cvv} theme={theme} fontBody={fontBody} isSensitive /></div>
                    <div style={{ flex: 1 }}><MaskedField label="PIN" value={bank.pin} theme={theme} fontBody={fontBody} isSensitive /></div>
                  </div>
                  <MaskedField label="Netbanking User" value={bank.netbankingUser} theme={theme} fontBody={fontBody} />
                  <MaskedField label="Netbanking Password" value={bank.netbankingPass} theme={theme} fontBody={fontBody} isSensitive />
                </NeoSurface>
              ))}
            </div>

            <div style={{ position: "fixed", bottom: 20, left: 20, right: 20, zIndex: 61 }}>
              <PrimaryButton icon={<Plus size={20} />} label="Add New Bank" onClick={() => {
                setEditingBankId(null);
                setBankFormState({ bankName: "", accountNumber: "", ifsc: "", cardType: "Debit", cardNumber: "", expiry: "", cvv: "", pin: "", netbankingUser: "", netbankingPass: "" });
                setShowBankForm(true);
              }} />
            </div>
          </div>
        )}

        {showBankForm && (
          <div style={{ position: "fixed", inset: 0, background: theme.bg, zIndex: 70, padding: "20px 20px 100px", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <button onClick={() => setShowBankForm(false)} style={{ border: "none", background: "none", color: theme.textPrimary, cursor: "pointer" }}><ChevronLeft size={24} /></button>
              <div style={{ fontSize: 20, fontWeight: 800, color: theme.textPrimary, ...fontDisplay }}>{editingBankId ? "Edit Bank" : "Add Bank"}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <NeoInput placeholder="Bank Name (e.g. HDFC Bank)" value={bankFormState.bankName} onChange={e => setBankFormState({...bankFormState, bankName: e.target.value})} />
              <NeoInput placeholder="Account Number" type="number" value={bankFormState.accountNumber} onChange={e => setBankFormState({...bankFormState, accountNumber: e.target.value})} />
              <NeoInput placeholder="IFSC Code" value={bankFormState.ifsc} onChange={e => setBankFormState({...bankFormState, ifsc: e.target.value})} />
              
              <SectionLabel>Card Details</SectionLabel>
              <div style={{ display: "flex", gap: 8, background: theme.bg, padding: 4, borderRadius: 16, boxShadow: theme.shadowInset }}>
                {["Debit", "Credit"].map(t => (
                  <div key={t} onClick={() => setBankFormState({...bankFormState, cardType: t})} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: bankFormState.cardType === t ? theme.accent : theme.textSecondary, background: bankFormState.cardType === t ? theme.bg : "transparent", boxShadow: bankFormState.cardType === t ? theme.shadowRaisedSm : "none", transition: "all .2s" }}>{t}</div>
                ))}
              </div>
              <NeoInput placeholder="Card Number" type="number" value={bankFormState.cardNumber} onChange={e => setBankFormState({...bankFormState, cardNumber: e.target.value})} />
              <div style={{ display: "flex", gap: 12 }}>
                <NeoInput placeholder="MM/YY" style={{ flex: 1 }} value={bankFormState.expiry} onChange={e => setBankFormState({...bankFormState, expiry: e.target.value})} />
                <NeoInput placeholder="CVV" type="password" style={{ flex: 1 }} value={bankFormState.cvv} onChange={e => setBankFormState({...bankFormState, cvv: e.target.value})} />
              </div>
              <NeoInput placeholder="PIN Code" type="password" value={bankFormState.pin} onChange={e => setBankFormState({...bankFormState, pin: e.target.value})} />

              <SectionLabel>Netbanking Details</SectionLabel>
              <NeoInput placeholder="Username / Customer ID" value={bankFormState.netbankingUser} onChange={e => setBankFormState({...bankFormState, netbankingUser: e.target.value})} />
              <NeoInput placeholder="Password" type="password" value={bankFormState.netbankingPass} onChange={e => setBankFormState({...bankFormState, netbankingPass: e.target.value})} />
            </div>

            <div style={{ position: "fixed", bottom: 20, left: 20, right: 20, zIndex: 71 }}>
              <PrimaryButton icon={<Check size={20} />} label="Save Details" onClick={() => {
                if (bankFormState.bankName) {
                  if (editingBankId) {
                    setBanks(prev => prev.map(b => b.id === editingBankId ? { ...bankFormState, id: editingBankId } : b));
                  } else {
                    setBanks(prev => [{ ...bankFormState, id: Date.now() }, ...prev]);
                  }
                  setShowBankForm(false);
                }
              }} />
            </div>
          </div>
        )}
        </>
        )}

        {/* --- Balance Edit Modal --- */}
        {showEditBalanceModal && editingBalanceAcc && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 75, padding: 24 }}>
            <NeoSurface style={{ padding: 24, width: "100%", maxWidth: 320 }}>
              <div style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 700, marginBottom: 16, ...fontDisplay }}>Edit {editingBalanceAcc.label} Balance</div>
              <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, ...fontBody }}>Current Amount</div>
              <NeoInput type="number" placeholder="e.g. 1500" value={tempBalance} onChange={(e) => setTempBalance(e.target.value)} />
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button onClick={() => setShowEditBalanceModal(false)} style={{ flex: 1, border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm, borderRadius: 12, padding: "12px 0", color: theme.textSecondary, fontWeight: 600, fontSize: 14, cursor: "pointer", ...fontBody }}>Cancel</button>
                <PrimaryButton label="Save" onClick={() => {
                  const newBal = parseFloat(tempBalance);
                  if (!isNaN(newBal)) {
                    setBalances(prev => ({ ...prev, [editingBalanceAcc.id]: newBal }));
                  }
                  setShowEditBalanceModal(false);
                }} style={{ flex: 1, padding: "12px 0", borderRadius: 12, fontSize: 14 }} />
              </div>
            </NeoSurface>
          </div>
        )}

        {/* --- Bill Add/Edit Modal --- */}
        {showBillModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 75, padding: 24 }}>
            <NeoSurface style={{ padding: 24, width: "100%", maxWidth: 320 }}>
              <div style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 700, marginBottom: 16, ...fontDisplay }}>{editingBill ? "Edit Bill" : "Add Bill"}</div>
              
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, ...fontBody }}>Bill Name</div>
                <NeoInput type="text" placeholder="e.g. Netflix" value={billFormState.name} onChange={(e) => setBillFormState({ ...billFormState, name: e.target.value })} />
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, ...fontBody }}>Amount (₹)</div>
                <NeoInput type="number" placeholder="e.g. 649" value={billFormState.amount} onChange={(e) => setBillFormState({ ...billFormState, amount: e.target.value })} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, ...fontBody }}>Days Left</div>
                <NeoInput type="number" placeholder="e.g. 5" value={billFormState.daysLeft} onChange={(e) => setBillFormState({ ...billFormState, daysLeft: e.target.value })} />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={() => setShowBillModal(false)} style={{ flex: 1, border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm, borderRadius: 12, padding: "12px 0", color: theme.textSecondary, fontWeight: 600, fontSize: 14, cursor: "pointer", ...fontBody }}>Cancel</button>
                <PrimaryButton label="Save" onClick={() => {
                  const { name, amount, daysLeft } = billFormState;
                  if (!name.trim() || isNaN(parseFloat(amount)) || isNaN(parseInt(daysLeft))) return;
                  if (editingBill) {
                    setUpcomingBills(bills => bills.map(x => x.id === editingBill.id ? { ...x, name, amount: parseFloat(amount), daysLeft: parseInt(daysLeft) } : x));
                  } else {
                    setUpcomingBills(b => [...b, { id: Date.now(), name, amount: parseFloat(amount), daysLeft: parseInt(daysLeft) }]);
                  }
                  setShowBillModal(false);
                }} style={{ flex: 1, padding: "12px 0", borderRadius: 12, fontSize: 14 }} />
              </div>
            </NeoSurface>
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------- TODO TAB ---------------------------------- */

  /* ---------------------------------- PLANNER TAB ---------------------------------- */


  const renderTodoTab = () => {

    const PRIORITY_COLOR = { High: theme.danger, Medium: "#ffb648", Low: theme.accent2 };

    const addTodo = async () => {
      if (!todoInput.trim()) return;
      
      let finalDate = new Date().toISOString().split('T')[0];
      let finalText = todoInput.trim();
      let isAiLoading = false;
      
      setTodos((t) => [{ id: Date.now(), text: finalText, done: false, priority: newPriority, date: finalDate, due: null, reminder: false, recurring: newRecurringDays.length ? newRecurringDays : null, subtasks: [] }, ...t]);
      setTodoInput(""); setNewPriority("Medium"); setNewRecurringDays([]); setShowTaskOptions(false);
    };

    const toggleDone = (id) => setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
    const scratch = (id) => setTodos((t) => t.filter((x) => x.id !== id));
    const toggleSubtask = (todoId, subId) => setTodos((t) => t.map((x) => x.id === todoId ? { ...x, subtasks: x.subtasks.map((s) => s.id === subId ? { ...s, done: !s.done } : s) } : x));
    const toggleReminder = (id) => setTodos((t) => t.map((x) => x.id === id ? { ...x, reminder: !x.reminder } : x));

    const todayStr = new Date().toISOString().split('T')[0];
    const activeTodos = todos.filter(t => t.date === todayStr);
    
    const groups = { Work: [], Study: [], Personal: [] };
    activeTodos.forEach((t) => groups[autoCategorizeTodo(t.text)].push(t));
    const groupMeta = {
      Work: { icon: <Briefcase size={15} />, color: theme.accent, FallbackIcon: Briefcase },
      Study: { icon: <BookOpen size={15} />, color: theme.accent2, FallbackIcon: BookOpen },
      Personal: { icon: <User size={15} />, color: theme.danger, FallbackIcon: User },
    };

    return (
      <div style={{ padding: "18px 18px 24px", display: "flex", flexDirection: "column", flex: 1 }}>


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
                  <NeoSurface key={t.id} style={{ padding: "12px 14px" }}
                    
                  >
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
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                          <span style={{ color: t.done ? theme.textSecondary : theme.textPrimary, fontSize: 13.5, textDecoration: t.done ? "line-through" : "none", wordBreak: "break-word", lineHeight: 1.4, ...fontBody }}>{t.text}</span>
                          <div style={{ marginTop: 2, flexShrink: 0 }}>
                            <Flag size={11} color={PRIORITY_COLOR[t.priority]} fill={PRIORITY_COLOR[t.priority]} />
                          </div>
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
                          <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <button onClick={() => toggleSubtask(t.id, s.id)} style={{
                              width: 18, height: 18, borderRadius: 6, border: "none", flexShrink: 0, marginTop: 2,
                              background: theme.bg, boxShadow: s.done ? theme.shadowPressed : theme.shadowRaisedSm,
                              color: s.done ? theme.accent2 : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                            }}>{s.done && <Check size={11} />}</button>
                            <span style={{ color: s.done ? theme.textSecondary : theme.textPrimary, fontSize: 12, textDecoration: s.done ? "line-through" : "none", wordBreak: "break-word", lineHeight: 1.4, ...fontBody }}>{s.text}</span>
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

        <div style={{ position: "sticky", bottom: 0, zIndex: 10, marginTop: "auto" }}>
          <div style={{ marginTop: 12 }}>
            <SectionLabel>Add a task for today</SectionLabel>
          </div>
          <NeoSurface style={{ padding: 12, boxShadow: theme.shadowRaised }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <NeoInput placeholder="e.g. Prepare client presentation" value={todoInput} onChange={(e) => setTodoInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTodo()} />
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
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 6, ...fontBody }}>Priority</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["High", "Medium", "Low"].map((p) => (
                      <Chip key={p} label={p} active={newPriority === p} colorActive={PRIORITY_COLOR[p]} onClick={() => setNewPriority(p)} />
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
                  <div>
                    <div style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 6, ...fontBody }}>Repeat on</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[{k:"Mon",l:"M"}, {k:"Tue",l:"T"}, {k:"Wed",l:"W"}, {k:"Thu",l:"T"}, {k:"Fri",l:"F"}, {k:"Sat",l:"S"}, {k:"Sun",l:"S"}].map((d) => (
                        <button
                          key={d.k}
                          onClick={() => setNewRecurringDays((days) => days.includes(d.k) ? days.filter((x) => x !== d.k) : [...days, d.k])}
                          style={{
                            width: 32, height: 32, borderRadius: 16, border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 600, ...fontBody,
                            background: newRecurringDays.includes(d.k) ? theme.accent : theme.bg,
                            color: newRecurringDays.includes(d.k) ? "#fff" : theme.textSecondary,
                            boxShadow: newRecurringDays.includes(d.k) ? theme.shadowPressed : theme.shadowRaisedSm
                          }}
                        >
                          {d.l}
                        </button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 6, ...fontBody }}>Due Date</div>
                  <NeoInput type="datetime-local" style={{ fontSize: 12.5 }} />
                </div>
              </div>
            </div>
          )}
        </NeoSurface>
        </div>
        <div style={{ color: theme.textSecondary, fontSize: 11, marginTop: 8, textAlign: "center", paddingBottom: 18, ...fontBody }}>
          Tasks are auto-sorted into Work / Study / Personal based on what you type.
        </div>

      </div>
    );
  }

  /* ---------------------------------- INSIGHTS TAB ---------------------------------- */

  const renderInsightsTab = () => {

    const askAI = async () => {
      if (!askInput.trim()) return;
      if (!apiKey) {
        setAskAnswer("Please set your Gemini API key in the top right menu.");
        return;
      }
      setAsking(true);
      try {
        const ai = new GoogleGenAI({ apiKey });
        const dataContext = { transactions, todos, history };
        const prompt = `Here is my data: ${JSON.stringify(dataContext)}

Question: ${askInput}

Answer concisely based on the data.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setAskAnswer(response.text);
      } catch (err) {
        setAskAnswer("Error: " + err.message);
      } finally {
        setAsking(false);
      }
    };

    const generateInsight = async () => {
      if (!apiKey) {
        setGeneratedInsight("Please set your Gemini API key in the top right menu.");
        return;
      }
      setGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey });
        const dataContext = { transactions, todos, history };
        const prompt = `Here is my data: ${JSON.stringify(dataContext)}

Generate one short, helpful insight about my productivity or finances based ONLY on this data. Max 2 sentences. If there's no data, encourage the user to add some.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setGeneratedInsight(response.text);
      } catch (err) {
        setGeneratedInsight("Error: " + err.message);
      } finally {
        setGenerating(false);
      }
    };

    // Derived stats from real data
    const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const incomeTotal = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    
    // Category Data
    const catMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
    const categoryData = Object.entries(catMap).map(([name, value], i) => ({ name, value, color: ['#7c6ff0', '#3dd6c8', '#ffb648', '#ff6b6b'][i % 4] }));

    // Todo Stats
    const doneTodos = todos.filter(t => t.done).length;
    const pendingTodos = todos.filter(t => !t.done).length;
    const todoStats = [
      { name: "Done", value: doneTodos, color: "#3dd6c8" },
      { name: "Pending", value: pendingTodos, color: darkMode ? "#3a4051" : "#c9cfda" }
    ];

    // Weekly focus mins (mocking days from history for simplicity, assuming history has 'minutes' and 'date')
    // We will just aggregate all history minutes since we don't have full date parsing
    const totalFocus = history.reduce((a, b) => a + b.minutes, 0);
    const weekly = [{ day: "Total", mins: totalFocus }];
    
    // Monthly income vs expense
    const monthly = [{ m: "Total", income: incomeTotal, expense: expenseTotal }];

    return (
      <div style={{ padding: "18px 18px 100px" }}>
        <NeoSurface style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Sparkles size={16} color={theme.accent} />
            <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13.5, ...fontDisplay }}>AI insight</span>
            <span style={{ color: theme.textSecondary, fontSize: 10.5, marginLeft: "auto", ...fontBody }}>Gemini 2.5 Flash</span>
          </div>
          <div style={{ color: theme.textPrimary, fontSize: 13, lineHeight: 1.5, ...fontBody }}>
            {generating ? "Thinking..." : generatedInsight}
          </div>
          <button onClick={generateInsight} style={{
            marginTop: 12, border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm, color: theme.accent,
            borderRadius: 12, padding: "8px 14px", fontSize: 12, fontWeight: 600, ...fontBody, cursor: 'pointer'
          }}>Generate another insight</button>
        </NeoSurface>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Ask your data</SectionLabel>
          <NeoSurface style={{ padding: 14 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <NeoInput placeholder="How much did I spend on food?" value={askInput} onChange={(e) => setAskInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && askAI()} />
              </div>
              <button onClick={askAI} style={{
                width: 46, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${theme.accent}, #5a4fcf)`,
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: 'pointer'
              }}><Send size={16} /></button>
            </div>
            {(asking || askAnswer) && (
              <div style={{ marginTop: 12, background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 12, padding: 12, display: "flex", gap: 8 }}>
                <MessageSquare size={14} color={theme.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ color: theme.textPrimary, fontSize: 12.5, lineHeight: 1.5, ...fontBody }}>
                  {asking ? "Thinking..." : askAnswer}
                </div>
              </div>
            )}
          </NeoSurface>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <SectionLabel>Expense split</SectionLabel>
            <NeoSurface style={{ padding: 10 }}>
              <ResponsiveContainer width="100%" height={150}>
                {categoryData.length > 0 ? (
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={35} outerRadius={55} paddingAngle={3}>
                      {categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: theme.bg, border: "none", borderRadius: 10, fontSize: 11 }} />
                  </PieChart>
                ) : <div style={{ color: theme.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 50, ...fontBody }}>No expenses yet</div>}
              </ResponsiveContainer>
            </NeoSurface>
          </div>
          <div style={{ flex: 1 }}>
            <SectionLabel>Todo completion</SectionLabel>
            <NeoSurface style={{ padding: 10 }}>
              <ResponsiveContainer width="100%" height={150}>
                {todos.length > 0 ? (
                  <PieChart>
                    <Pie data={todoStats} dataKey="value" nameKey="name" innerRadius={35} outerRadius={55} paddingAngle={3}>
                      {todoStats.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: theme.bg, border: "none", borderRadius: 10, fontSize: 11 }} />
                  </PieChart>
                ) : <div style={{ color: theme.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 50, ...fontBody }}>No todos yet</div>}
              </ResponsiveContainer>
            </NeoSurface>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Income vs Expense (Total)</SectionLabel>
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
  
  /* ---------------------------------- SETTINGS MODAL ---------------------------------- */

  function SettingsModal() {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 60 }}>
        <NeoSurface style={{ width: "100%", maxWidth: 390, padding: 24, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Settings</div>
            <button onClick={() => setShowSettings(false)} style={{ border: "none", background: "none", color: theme.textSecondary }}><X size={18} /></button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Cloud Sync */}
            <div 
              onClick={() => { setSyncState("syncing"); setTimeout(() => setSyncState("synced"), 1200); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm, cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Cloud size={18} color={theme.textPrimary} />
                <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Cloud Sync</span>
              </div>
              {syncState === "syncing" ? (
                <span style={{ fontSize: 13, color: theme.textSecondary, ...fontBody }}>Syncing...</span>
              ) : (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.accent2 }} />
              )}
            </div>

            {/* Widget Preview */}
            <div 
              onClick={() => { setShowSettings(false); setShowWidget(true); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm, cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Layers size={18} color={theme.textPrimary} />
                <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Widget Preview</span>
              </div>
              <ChevronDown size={16} color={theme.textSecondary} style={{ transform: "rotate(-90deg)" }} />
            </div>
          </div>
        </NeoSurface>
      </div>
    );
  }

  /* ---------------------------------- GLOBAL SEARCH ---------------------------------- */

  function SearchOverlay() {
    const q = searchQuery.trim().toLowerCase();
    const results = q ? searchIndex.filter((r) => r.label.toLowerCase().includes(q)) : SEARCH_INDEX;
    const typeColor = { expense: theme.danger, todo: theme.accent, session: theme.accent2 };
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 60, display: "flex", justifyContent: "center", padding: "60px 12px 24px" }}>
        <div style={{ width: 390, maxWidth: "100%" }}>
          <NeoSurface style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Search size={16} color={theme.textSecondary} />
              <input
                autoFocus
                placeholder="Search expenses, todos, sessions…"
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
          <div style={{ color: theme.textSecondary, fontSize: 12.5, lineHeight: 1.5, marginBottom: 20, ...fontBody }}>
            Used to power AI insights with Gemini 2.5 Flash. Stored only for this session.
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
    <div style={{ minHeight: "100vh", background: theme.pageBg, ...fontBody }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: ${theme.pageBg}; overflow-x: hidden; }
        #root { width: 100%; height: 100%; }
        * { box-sizing: border-box; }
        @keyframes slideInRight { from { transform: translateX(28px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInLeft { from { transform: translateX(-28px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes eqBounce { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
        @keyframes progressGlide { 0% { width: 0%; left: 0%; } 50% { width: 100%; left: 0%; } 100% { width: 0%; left: 100%; } }
      `}</style>
      <div style={{ width: "100%", minHeight: "100vh", background: theme.pageBg, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

        {/* header */}
        <div style={{ padding: "20px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 700, ...fontDisplay }}>{titles[activeTab]}</div>
            <div style={{ color: theme.textSecondary, fontSize: 11.5, marginTop: 2, ...fontBody }}>{subtitles[activeTab]}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <IconBtn size={38} icon={<Search size={15} />} onClick={() => setShowSearch(true)} />
            <IconBtn size={38} icon={<Settings size={15} />} onClick={() => setShowSettings(true)} />
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
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}
          onMouseDown={onSwipeStart}
          onMouseUp={onSwipeEnd}
          onTouchStart={onSwipeStart}
          onTouchEnd={onSwipeEnd}
        >
          <div key={activeTab} style={{ animation: `${direction > 0 ? "slideInRight" : "slideInLeft"} 0.25s ease`, flex: "1 0 auto", display: "flex", flexDirection: "column" }}>
            {activeTab === "timer" && renderTimerTab()}
            {activeTab === "expense" && renderExpenseTab()}
            {activeTab === "todo" && renderTodoTab()}
            {activeTab === "insights" && renderInsightsTab()}
          </div>
        </div>
        <audio ref={audioRef} style={{ display: 'none' }} />
        <div id="yt-audio-player" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", visibility: "hidden" }}></div>
      </div>

      {showKeyModal && <ApiKeyModal />}
      {showSettings && <SettingsModal />}
      {showSearch && <SearchOverlay />}
      {showWidget && <WidgetPreviewModal />}
    </div>
  );
}
