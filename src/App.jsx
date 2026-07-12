import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenAI } from "@google/genai";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Preferences } from '@capacitor/preferences';
import { App as CapacitorApp } from '@capacitor/app';
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
  ChevronUp,
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
  Volume2,
  VolumeX,
  Flower2,
  Utensils,
  Film,
  Gift,
  Laptop,
  Building2,
  Box,
  Tag,
  AlertTriangle,
  LayoutDashboard,
  PiggyBank,
  Home
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import * as XLSX from "xlsx";
import LiquidWave from "./components/ui/LiquidWave.jsx";
import BreathingExercise from "./components/BreathingExercise.jsx";
import BreathingScreen from "./components/BreathingScreen.jsx";
import BoxBreathingScreen from "./components/BoxBreathingScreen.jsx";
import BodyScanScreen from "./components/BodyScanScreen.jsx";
import SilentMeditationScreen from "./components/SilentMeditationScreen.jsx";
import VipassanaScreen from "./components/VipassanaScreen.jsx";
import ReflectionHistory from "./components/ReflectionHistory.jsx";
import MeditationTimerCard from "./components/MeditationTimerCard.jsx";

const Aurora = React.lazy(() => import('./components/reactbits/Aurora.jsx'));
const RisingBubbles = React.lazy(() => import('./components/reactbits/RisingBubbles.jsx'));
const Particles = React.lazy(() => import('./components/reactbits/Particles.jsx'));
const Waves = React.lazy(() => import('./components/reactbits/Waves.jsx'));
const MagicRings = React.lazy(() => import('./components/reactbits/MagicRings.jsx'));
const ElectricBorder = React.lazy(() => import('./components/reactbits/ElectricBorder.jsx'));
const OrbitNodes = React.lazy(() => import('./components/reactbits/OrbitNodes.jsx'));
const FallingParticles = React.lazy(() => import('./components/reactbits/FallingParticles.jsx'));
const OrbitingDots = React.lazy(() => import('./components/reactbits/OrbitingDots.jsx'));
const GradientFlow = React.lazy(() => import('./components/reactbits/GradientFlow.jsx'));
const FluidMetaballs = React.lazy(() => import('./components/reactbits/FluidMetaballs.jsx'));
const MagneticAttraction = React.lazy(() => import('./components/reactbits/MagneticAttraction.jsx'));
const FractalExpansion = React.lazy(() => import('./components/reactbits/FractalExpansion.jsx'));
import TodoTab from "./tabs/TodoTab.jsx";
import SummaryTab from "./tabs/SummaryTab.jsx";
import TimePicker from "./components/ui/TimePicker.jsx";
import NeoSelect from "./components/ui/NeoSelect.jsx";
import WheelPicker from "./components/ui/WheelPicker.jsx";
import { useTodos } from "./hooks/useTodos.js";
import { useAsyncStorage } from "./hooks/useAsyncStorage.js";
import JournalEntry from "./components/JournalEntry.jsx";
import ProfileTab from "./tabs/ProfileTab.jsx";
import ZenTab from "./tabs/ZenTab.jsx";
import ExpenseTab from "./tabs/ExpenseTab.jsx";
import TimerTab from "./tabs/TimerTab.jsx";
import InsightsTab from "./tabs/InsightsTab.jsx";
import NotesTab from "./components/notes/NotesTab.jsx";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { useStreak } from "./hooks/useStreak.js";
import { useZenStreak } from "./hooks/useZenStreak.js";
import { markDayActive } from "./utils/streak.js";
import { markZenActiveToday } from "./utils/zenStreak.js";
import SplitText from "./components/ui/SplitText.jsx";
import { CURRENCIES, formatCurrency, getCurrencyByCode } from "./utils/currency.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

import { getLocalDateString, getLocalToday, getLocalTime } from "./utils/date.js";



/* ---------------------------------- helpers ---------------------------------- */

function getDailyAvgSpend(expenses, days = 30) {
  const cutoff = Date.now() - days * 86400000;
  const variable = expenses.filter(e => e.type === "expense" && e.category !== "No Spend" && !e.recurring && new Date(e.date).getTime() >= cutoff);
  const total = variable.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  return total / days;
}

const EXPENSE_CATEGORIES = [
  "Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other",
];

const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"];

const TX_CATEGORY_ICONS = {
  Food: <Utensils size={18} />, Transport: <Car size={18} />, Shopping: <ShoppingCart size={18} />, Bills: <FileText size={18} />, Entertainment: <Film size={18} />, Health: <HeartPulse size={18} />, Education: <BookOpen size={18} />,
  Salary: <Briefcase size={18} />, Freelance: <Laptop size={18} />, Business: <Building2 size={18} />, Investment: <TrendingUp size={18} />, Gift: <Gift size={18} />, Other: <Box size={18} />,
};

const RENDER_CUSTOM_ICON = (key, size=18) => {
  const IconComponent = LucideIcons[key] || LucideIcons.Box;
  return <IconComponent size={size} />;
};
const PRESET_BANKS = [
  { name: "HDFC", color: "#004B8D" },
  { name: "ICICI", color: "#F18221" },
  { name: "SBI", color: "#0F72B9" },
  { name: "Axis", color: "#97144D" },
  { name: "Kotak", color: "#ED1C24" },
  { name: "PNB", color: "#F7A823" },
  { name: "Baroda", color: "#FF5E00" },
];

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

const CATEGORY_KEYWORD_MAP = {
  Food: ["swiggy", "zomato", "mcdonalds", "starbucks", "cafe", "restaurant", "food", "dominos", "kfc", "blinkit", "instamart", "zepto", "lunch", "dinner", "breakfast", "grocery", "groceries", "coffee", "pizza", "burger"],
  Transport: ["uber", "lyft", "taxi", "train", "flight", "irctc", "ola", "rapido", "metro", "gas", "petrol", "bus", "auto"],
  Shopping: ["amazon", "flipkart", "myntra", "mart", "store", "retail", "supermarket", "d-mart", "reliancemart", "clothes", "shoes", "electronics", "mall", "zara", "h&m"],
  Entertainment: ["netflix", "spotify", "prime", "cinema", "movie", "bookmyshow", "pvr", "hotstar", "game", "steam", "concert", "party", "club"],
  Health: ["hospital", "pharmacy", "clinic", "medical", "apollo", "practo", "netmeds", "1mg", "doctor", "medicine", "gym", "workout", "therapy"],
  Bills: ["electricity", "water", "gas", "internet", "broadband", "airtel", "jio", "vi", "recharge", "emi", "bill", "wifi", "rent", "mobile"],
  Education: ["course", "udemy", "school", "college", "tuition", "books", "coursera"]
};

function Numpad({ value, onChange, theme, NeoSurface }) {
  const handlePress = (num) => {
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
    if (num === "C") return onChange("");
    if (num === "⌫") return onChange(value.slice(0, -1));
    if (num === "." && value.includes(".")) return;
    if (value === "0" && num !== ".") return onChange(num);
    onChange(value + num);
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map(btn => (
        <NeoSurface key={btn} onClick={() => handlePress(btn)} style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, cursor: 'pointer', userSelect: 'none', color: theme.textPrimary }}>
          {btn}
        </NeoSurface>
      ))}
    </div>
  );
}

/* ---------------------------------- root ---------------------------------- */

const TAB_ORDER = ["summary", "expense", "notes", "meditation", "timer", "todo", "profile"];



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

  const [activeTab, setActiveTab] = useState("summary");
  const [swipeToast, setSwipeToast] = useState(null);
  const [swipeToastKey, setSwipeToastKey] = useState(0);
  const swipeToastTimer = useRef(null);
  const navBarRef = useRef(null);
  const [hasSeenNavHint, setHasSeenNavHint] = useLocalStorage("neoapp_nav_hint", false);
  const [history, setHistory, historyLoading] = useAsyncStorage("neo_history", []);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useLocalStorage("neo_dailyGoalMinutes", 240);
  const [hours, setHours] = useState(0);
  const [showCustomTimer, setShowCustomTimer] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [name, setName] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [remaining, setRemaining] = useState(25 * 60);

  const [activeSource, setActiveSource] = useState('piano');
  const [audioUrl, setAudioUrl] = useState(null);
  const [youtubeId, setYoutubeId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCategoryPie, setActiveCategoryPie] = useState(null);
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
    stopAlarm();
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
    }, 10000);
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
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.setVolume) {
      ytPlayerRef.current.setVolume(isMuted ? 0 : volume * 100);
    }
  }, [volume, isMuted, activeSource]);

  useEffect(() => {
    if (!audioRef.current || audioRef.current.src) return;
    if (['piano', 'rain', 'ocean', 'white', 'forest', 'shlokas', 'mozart', 'endel', 'cafe'].includes(activeSource)) {
      audioRef.current.src = `audio/${activeSource}.mp3`;
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
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
  const [pomoFocusDuration, setPomoFocusDuration] = useState(25);
  const [pomoBreakDuration, setPomoBreakDuration] = useState(5);
  const [pomoMaxCycles, setPomoMaxCycles] = useState(4);
  const { streak, activeDays, monthlyActiveCount, daysInMonth: streakDaysInMonth, yearlyActiveCount, daysInYear } = useStreak();
  const [transactions, setTransactions, transactionsLoading] = useAsyncStorage("neo_transactions", []);
  const [linkedTodo, setLinkedTodo] = useState(null);
  const [showTodoPicker, setShowTodoPicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [sessionNote, setSessionNote] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const migrationDoneRef = useRef(false);
  useEffect(() => {
    if (migrationDoneRef.current || transactionsLoading) return;
    let hasFoodAndDining = false;
    const migrated = transactions.map(t => {
      if (t.category === "Food & Dining") {
        hasFoodAndDining = true;
        return { ...t, category: "Food" };
      }
      return t;
    });
    if (hasFoodAndDining) {
      setTransactions(migrated);
    }
    migrationDoneRef.current = true;
  }, [transactions, transactionsLoading, setTransactions]);
  const [customCategories, setCustomCategories] = useLocalStorage("neo_custom_categories", []);
  
  useEffect(() => {
    if (customCategories.includes("Food & Dining")) {
      setCustomCategories(prev => prev.filter(c => c !== "Food & Dining"));
    }
  }, [customCategories, setCustomCategories]);

  const [customCategoryIcons, setCustomCategoryIcons] = useLocalStorage("neo_custom_category_icons", {});
  const [customIncomeCategories, setCustomIncomeCategories] = useLocalStorage("neo_custom_income_categories", []);
  const ALL_EXPENSE_CATEGORIES = [...EXPENSE_CATEGORIES, ...(Array.isArray(customCategories) ? customCategories : [])];
  const ALL_INCOME_CATEGORIES = [...INCOME_CATEGORIES, ...(Array.isArray(customIncomeCategories) ? customIncomeCategories : [])];
  const { todos, incrementPomodoro, toggleDone, updateTodo } = useTodos();
  const [categoryBudgets, setCategoryBudgets] = useLocalStorage("neo_categoryBudgets", {});
  const [upcomingBills, setUpcomingBills, billsLoading] = useAsyncStorage("neo_upcomingBills", []);

  useEffect(() => {
    // Migration to clear dummy bills for existing users
    if (upcomingBills.length === 3 && upcomingBills[0].name === "Netflix" && upcomingBills[1].name === "Electricity Bill" && upcomingBills[2].name === "Rent") {
      setUpcomingBills([]);
    }
  }, []);
  // Timer States
  const [showDailyGoalModal, setShowDailyGoalModal] = useState(false);
  const [tempDailyGoal, setTempDailyGoal] = useState("");

  // Bank Details States
  const [banks, setBanks, banksLoading] = useAsyncStorage("neo_banks", []);

  const BankBadge = ({ tx }) => {
    const method = tx.method;
    let mainBadge = null;
    if (method === "UPI" || !method) {
      mainBadge = <div style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#10B98120", color: "#10B981", display: "inline-block" }}>UPI</div>;
    } else {
      const bank = banks.find(b => String(b.id) === String(method));
      if (bank) {
        const preset = PRESET_BANKS.find(p => bank.bankName.toLowerCase().includes(p.name.toLowerCase())) || { color: theme.accent };
        const shortName = bank.bankName.split(" ")[0].substring(0, 5).toUpperCase();
        mainBadge = <div style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: preset.color + "20", color: preset.color, display: "inline-block", marginLeft: 4 }}>{shortName}</div>;
      }
    }
    
    return (
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {mainBadge}
        {tx.paymentType && !(method === "UPI" && tx.paymentType.toUpperCase() === "UPI") && (
          <div style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: theme.textSecondary + "20", color: theme.textSecondary, display: "inline-block" }}>{tx.paymentType.toUpperCase()}</div>
        )}
      </div>
    );
  };

  const updateBalanceForMethod = (method, delta) => {
    if (method !== "UPI") {
      setBanks(prev => prev.map(b => String(b.id) === String(method) ? { ...b, balance: (Number(b.balance) || 0) + delta } : b));
    }
  };
  const [showBanksList, setShowBanksList] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingBankId, setEditingBankId] = useState(null);
  
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [showCalendarWidget, setShowCalendarWidget] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("Box");
  const [newCategoryType, setNewCategoryType] = useState("expense");
  const ICON_OPTIONS = [
    "Box", "Tag", "ShoppingCart", "Car", "HeartPulse", "BookOpen", "Film", "Gift", 
    "Smartphone", "Camera", "Music2", "Dumbbell", "Utensils", "CreditCard", "Target", "Award",
    "Wallet", "Sun", "Moon", "Briefcase", "DollarSign", "User", "Banknote", "Sparkles", 
    "Users", "Mail", "Calendar", "FileText", "GraduationCap", "Phone", "Presentation", "Flag", 
    "Cloud", "MessageSquare", "Bell", "Landmark", "Flame", "Flower2", "Laptop", "Building2"
  ];
  

  const BANK_ICONS = ["Landmark", "Building2", "Briefcase", "Wallet2", "CreditCard", "PiggyBank", "Box", "Tag", "MonitorPlay", "Smartphone", "Flower2", "Gift", "Banknote"];

  const [bankFormState, setBankFormState] = useState({
    bankName: "", balance: "", accountType: "Savings", cardLast4: "", cardType: "Debit", icon: "Building2"
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
  const [filterType, setFilterType] = useState("All");
  const [filterBank, setFilterBank] = useState("All");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [visibleTxCount, setVisibleTxCount] = useState(20);
  
  const [bankTxFilterType, setBankTxFilterType] = useState("All");
  const [bankTxFilterCategory, setBankTxFilterCategory] = useState("All");
  const [newAmount, setNewAmount] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCurrency, setNewCurrency] = useState("");
  const [newExchangeRate, setNewExchangeRate] = useState("1");
  const [newCat, setNewCat] = useState("Food");
  const [newType, setNewType] = useState("expense");
  const [newDate, setNewDate] = useState(getLocalToday());
  const [newTime, setNewTime] = useState(getLocalTime());
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [newMethod, setNewMethod] = useState("UPI");
  const [editingTxId, setEditingTxId] = useState(null);
  const [activeAccount, setActiveAccount] = useState("bank");
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [activeReminders, setActiveReminders] = useState([]);
  const [showBreathing, setShowBreathing] = useState(false);
  
  // Zen Tab States
  const [activeTechnique, setActiveTechnique] = useState(null);
  const [showReflectionHistory, setShowReflectionHistory] = useState(false);
  
  const [dailyIntention, setDailyIntention] = useState(() => {
    try {
      const stored = localStorage.getItem("neo_dailyEntries");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[getLocalToday()]) return parsed[getLocalToday()].intention || "";
      }
    } catch(e){}
    return "";
  });

  const [dailyMood, setDailyMood] = useState(() => {
    try {
      const stored = localStorage.getItem("neo_dailyEntries");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[getLocalToday()]) return parsed[getLocalToday()].mood;
      }
    } catch(e){}
    return null;
  });

  const [eveningReflection, setEveningReflection] = useState(() => {
    try {
      const stored = localStorage.getItem("neo_dailyEntries");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[getLocalToday()]) return parsed[getLocalToday()].reflection || "";
      }
    } catch(e){}
    return "";
  });
  
  const [dailyGratitude, setDailyGratitude] = useState(() => {
    try {
      const stored = localStorage.getItem("neo_dailyEntries");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[getLocalToday()]) return parsed[getLocalToday()].gratitude || ["", "", ""];
      }
    } catch(e){}
    return ["", "", ""];
  });
  const { streak: zenStreak } = useZenStreak();
  const [meditationDuration, setMeditationDuration] = useState(5); // in minutes
  const [meditationTimeLeft, setMeditationTimeLeft] = useState(5 * 60);
  const [isMeditating, setIsMeditating] = useState(false);

  useEffect(() => {
    if (activeTab === 'meditation') {
      markZenActiveToday();
    }
  }, [activeTab]);

  useEffect(() => {
    let interval;
    if (isMeditating && meditationTimeLeft > 0) {
      interval = setInterval(() => {
        setMeditationTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isMeditating && meditationTimeLeft === 0) {
      setIsMeditating(false);
      markZenActiveToday();
      // Simple Beep
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1);
      } catch (e) {
        console.error("Audio Context failed", e);
      }
    }
    return () => clearInterval(interval);
  }, [isMeditating, meditationTimeLeft]);

  const saveEntryField = (field, value) => {
    const today = getLocalToday();
    const storedStr = localStorage.getItem("neo_dailyEntries") || "{}";
    let stored = {};
    try { stored = JSON.parse(storedStr); } catch(e){}
    if (!stored[today]) stored[today] = {};
    stored[today][field] = value;
    localStorage.setItem("neo_dailyEntries", JSON.stringify(stored));
  };

  const saveDailyIntention = (text) => {
    setDailyIntention(text);
    saveEntryField('intention', text);
  };
  
  const saveMood = (m) => {
    setDailyMood(m);
    saveEntryField('mood', m);
  };
  
  const saveEveningReflection = (r) => {
    setEveningReflection(r);
    saveEntryField('reflection', r);
  };
  
  const saveGratitude = (index, val) => {
    const arr = [...dailyGratitude];
    arr[index] = val;
    setDailyGratitude(arr);
    saveEntryField('gratitude', arr);
  };

  const handleMeditationComplete = (session) => {
    const storedStr = localStorage.getItem("neo_meditationSessions") || "[]";
    let stored = [];
    try { stored = JSON.parse(storedStr); } catch(e){}
    stored.push({ ...session, timestamp: Date.now() });
    localStorage.setItem("neo_meditationSessions", JSON.stringify(stored));
    markZenActiveToday();
    setActiveTechnique(null);
  };

  // Reminder Logic
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const todosWithReminders = todos.filter(t => !t.done && t.reminder && !t.reminderNotified);
      if (todosWithReminders.length === 0) return;
      const now = new Date();
      todosWithReminders.forEach(task => {
        const reminderTime = new Date(task.reminder);
        if (now >= reminderTime) {
          // Trigger Notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Todo Reminder", { body: task.text });
          }
          // Trigger In-App Alert
          setActiveReminders(prev => [...prev, task]);
          updateTodo(task.id, { reminderNotified: true });
        }
      });
    }, 10000); // Check every 10 seconds for testing responsiveness

    return () => clearInterval(interval);
  }, [todos, updateTodo]);

  // Todo States

  // Insights States

  const [darkMode, setDarkMode] = useLocalStorage("neo_darkMode", false);
  const [baseCurrency, setBaseCurrency] = useLocalStorage("neo_baseCurrency", "INR");

  const searchIndex = useMemo(() => [
    ...transactions.map(t => ({ type: "expense", icon: t.type === 'expense' ? ShoppingCart : Landmark, label: t.name, meta: `${formatCurrency(t.amount, baseCurrency)} · ${t.date}`, item: t })),
    ...todos.map(t => ({ type: "todo", icon: FileText, label: t.text, meta: `${t.priority} priority`, item: t })),
    ...history.map(h => ({ type: "session", icon: TimerIcon, label: h.note || h.type, meta: `${h.minutes}m · ${h.date}`, item: h }))
  ], [transactions, todos, history, baseCurrency]);

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

  // Planner States


  // Insights States
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
  const [askInput, setAskInput] = useState("");
  const [askAnswer, setAskAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedInsight, setGeneratedInsight] = useState(null);



  const [apiKey, setApiKey] = useLocalStorage("neo_gemini_api_key", "");
  const [direction, setDirection] = useState(1);
  const [showInsights, setShowInsights] = useState(false);


  const [expenseView, setExpenseView] = useState("wallet"); // "wallet" | "dashboard" | "settings"
  const [walletCardIndex, setWalletCardIndex] = useState(0); // active card in the carousel
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);


  const [customCategoryRules, setCustomCategoryRules] = useLocalStorage("neo_custom_category_rules", []);
  
  // Statement Import State
  const [importReviews, setImportReviews] = useState([]);
  const [updateBankBalance, setUpdateBankBalance] = useState(true);
  const [editableBankName, setEditableBankName] = useState("");

  useEffect(() => {
    if (importReviews.length > 0) {
      setUpdateBankBalance(importReviews[0].suggestBalanceUpdate);
      // Derive bank name from LLM output or fall back to filename (strip extension)
      const review = importReviews[0];
      const fallback = review.fileName.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
      setEditableBankName(review.bankName || fallback);
    }
  }, [importReviews]);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrorMsg, setImportErrorMsg] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [showImportConsent, setShowImportConsent] = useState(false);
  const [pendingImportFiles, setPendingImportFiles] = useState([]);
  const [showImportCelebration, setShowImportCelebration] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [lastImportSnapshot, setLastImportSnapshot, importSnapshotLoading] = useAsyncStorage("neo_lastImportSnapshot", null);
  const touchData = useRef({ x: 0, y: 0, active: false });

  // Handle Hardware Back Button (Android)
  useEffect(() => {
    let listener = null;
    const initListener = async () => {
      listener = await CapacitorApp.addListener('backButton', () => {
        if (showForm) { setShowForm(false); return; }
        if (showBudgetModal) { setShowBudgetModal(false); return; }
        if (showBudgetDropdown) { setShowBudgetDropdown(false); return; }
        if (showBanksList) { setShowBanksList(false); return; }
        if (showCategoryDrawer) { setShowCategoryDrawer(false); return; }
        if (showNoteModal) { setShowNoteModal(false); return; }
        if (showDailyGoalModal) { setShowDailyGoalModal(false); return; }
        if (showInsights) { setShowInsights(false); return; }

        // If no modal is open, exit the app
        CapacitorApp.exitApp();
      });
    };
    initListener();

    return () => {
      if (listener) listener.remove();
    };
  }, [showForm, showBudgetModal, showBudgetDropdown, showBanksList, showCategoryDrawer, showNoteModal, showDailyGoalModal, showInsights]);

  const switchTab = (newTab) => {
    if (newTab === activeTab) return;
    const oldIdx = TAB_ORDER.indexOf(activeTab);
    const newIdx = TAB_ORDER.indexOf(newTab);
    setDirection(newIdx > oldIdx ? 1 : -1);
    setActiveTab(newTab);
    try { Haptics.impact({ style: ImpactStyle.Light }); } catch(e) {}
    
    // Show tab name when switching
    const tabData = TABS.find(t => t.id === newTab);
    if (tabData) {
      setSwipeToast(tabData.label);
      setSwipeToastKey(k => k + 1);
      if (swipeToastTimer.current) clearTimeout(swipeToastTimer.current);
      swipeToastTimer.current = setTimeout(() => setSwipeToast(null), 1200);
    }
  };

  const onSwipeStart = (e) => {
    if (activeTechnique) return;
    const p = e.touches ? e.touches[0] : e;
    touchData.current = { x: p.clientX, y: p.clientY, active: true };
  };
  
  const onSwipeMove = (e) => {
    if (!touchData.current.active) return;
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - touchData.current.x;
    const dy = p.clientY - touchData.current.y;
    
    // If the user starts a clear horizontal swipe, we just let them swipe.
    // The nav bar is now permanently visible so we don't adjust its opacity here.
  };
  
  const onSwipeEnd = (e) => {
    if (!touchData.current.active) return;
    touchData.current.active = false;
    // The nav bar is permanently visible so no need to hide it on swipe end.
    
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
    pageBg: darkMode ? "#262b36" : "#e4e9f2",
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
    shadowInset: darkMode
      ? "inset 4px 4px 8px #1b1e25, inset -4px -4px 8px #313747"
      : "inset 4px 4px 8px #b7bdc8, inset -4px -4px 8px #ffffff",
    textPrimary: darkMode ? "#e2e6f0" : "#2d3446",
    textSecondary: darkMode ? "#8991a3" : "#7c8494",
    accent: "#7c6ff0",
    accent2: "#3dd6c8",
    danger: "#ff6b6b",
    success: "#2ecc71",
    border: darkMode ? "#323848" : "#ffffff",
  }), [darkMode]);

  const fontDisplay = { fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' };
  const fontBody = { fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.01em' };

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
      onClick={(e) => {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
        if (onClick) onClick(e);
      }}
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
      onClick={(e) => {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
        if (onClick) onClick(e);
      }}
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
      onClick={(e) => {
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => { });
        if (onClick) onClick(e);
      }}
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
        boxShadow: theme.shadowInset,
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

  const CollapsibleSection = useCallback(({ title, defaultOpen = true, children, extraHeader }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
      <div style={{ marginTop: 20 }}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: isOpen ? 12 : 0,
            transition: "margin-bottom 0.4s ease-in-out",
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <SectionLabel style={{ margin: 0, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</SectionLabel>
            {/* ponytail: min change, just allow fn for extraHeader */}
            {typeof extraHeader === 'function' ? extraHeader(isOpen) : extraHeader}
          </div>
          <div style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.4s ease-in-out",
            color: theme.textSecondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 10
          }}>
            <ChevronDown size={18} />
          </div>
        </div>
        
        <div style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.4s ease-in-out, opacity 0.4s ease-in-out",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none"
        }}>
          <div style={{ overflow: "hidden", padding: 32, margin: -32 }}>
            {children}
          </div>
        </div>
      </div>
    );
  }, [theme, SectionLabel]);



  const NeoDatePicker = useCallback(({ value, onChange, style, placeholder, wrapperStyle }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const current = value ? new Date(value) : new Date();
    const [viewDate, setViewDate] = useState(current);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const handleSelect = (day) => {
      const newDate = new Date(year, month, day);
      const yyyy = newDate.getFullYear();
      const mm = String(newDate.getMonth() + 1).padStart(2, '0');
      const dd = String(newDate.getDate()).padStart(2, '0');
      onChange(`${yyyy}-${mm}-${dd}`);
      setOpen(false);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
      <div ref={containerRef} style={{ position: 'relative', flex: 1, ...wrapperStyle }}>
        <div
          onClick={() => setOpen(!open)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: theme.bg,
            boxShadow: theme.shadowInset,
            border: "none",
            borderRadius: 14,
            padding: "12px 14px",
            height: 44,
            display: "flex",
            alignItems: "center",
            color: value ? theme.textPrimary : theme.textSecondary,
            fontSize: 14,
            cursor: "pointer",
            ...fontBody,
            ...style
          }}
        >
          {value || placeholder || "Select Date"}
        </div>

        {open && (
          <NeoSurface style={{ padding: 16, marginTop: 8, position: "absolute", top: "100%", left: 0, zIndex: 100, minWidth: 260 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <IconBtn size={32} icon={<ChevronLeft size={16} />} onClick={() => setViewDate(new Date(year, month - 1, 1))} />
              <div style={{ fontWeight: 700, fontSize: 14, color: theme.textPrimary, ...fontDisplay }}>
                {monthNames[month]} {year}
              </div>
              <IconBtn size={32} icon={<ChevronRight size={16} />} onClick={() => setViewDate(new Date(year, month + 1, 1))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 11, color: theme.textSecondary, fontWeight: 700, ...fontBody }}>{d}</div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`pad-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = value && current.getDate() === day && current.getMonth() === month && current.getFullYear() === year;
                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                return (
                  <div
                    key={day}
                    onClick={() => handleSelect(day)}
                    style={{
                      height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: isSelected || isToday ? 700 : 500,
                      color: isSelected ? "#fff" : (isToday ? theme.accent : theme.textPrimary),
                      background: isSelected ? theme.accent : "transparent",
                      borderRadius: 10, cursor: "pointer", transition: "all 0.2s", ...fontBody
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </NeoSurface>
        )}
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
          const sid = Date.now();
          setCurrentSessionId(sid);
          const lTodo = todos.find(t => t.id === linkedTodo);
          setHistory((h) => [
            { id: sid, name: name || autoTimerName(minutes), minutes, date: new Date().toISOString(), category: lTodo ? lTodo.category : 'Personal', note: "" },
            ...h,
          ]);
          markDayActive();
          if (linkedTodo) incrementPomodoro(linkedTodo);
          setShowNoteModal(true);
          setPomoPhase("Break");
          setHours(0); setMinutes(pomoCycle % pomoMaxCycles === 0 ? 15 : pomoBreakDuration); setSeconds(0);
        } else {
          setPomoPhase("Focus");
          setPomoCycle((c) => c + 1);
          setHours(0); setMinutes(pomoFocusDuration); setSeconds(0);
        }
      } else {
        const sid = Date.now();
        setCurrentSessionId(sid);
        const lTodo = todos.find(t => t.id === linkedTodo);
        setHistory((h) => [
          { id: sid, name: name || autoTimerName(minutes), minutes, date: new Date().toISOString(), category: lTodo ? lTodo.category : 'Personal', note: "" },
          ...h,
        ]);
        markDayActive();
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
  




  /* ---------------------------------- EXPENSE TAB ---------------------------------- */

  const processImportFiles = async (files) => {
    setShowImportConsent(false);
    setIsImporting(true);
    setImportErrorMsg("");

    try {
      const ai = new GoogleGenAI({ apiKey });
      const newReviews = [];

      let allValidTxs = [];
      let parsedBankNames = [];
      let latestClosingBalance = null;
      let latestClosingBalanceDate = '1970-01-01';
      const fileNames = files.map(f => f.name).join(", ");

      for (const file of files) {
        let textContent = "";
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
          textContent = await file.text();
        } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          textContent = XLSX.utils.sheet_to_csv(firstSheet);
        } else {
          continue; 
        }

        const prompt = `You are a financial statement parser.\nParse the following bank statement data into a strict JSON object.\nIMPORTANT: Extract EVERY SINGLE transaction. Do not omit, summarize, or skip any transactions, even if there are hundreds.\nFormat: { "bankName": "Name of Bank", "closingBalance": 15000, "transactions": [{ "name": "Description", "amount": 100, "type": "expense" or "income", "date": "YYYY-MM-DD", "category": "Food/Transport/Etc" }] }\nData:\n${textContent.slice(0, 30000)}`;
        
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const text = (typeof response.text === 'function' ? response.text() : response.text) || "";
        let jsonStr = text;
        const match = text.match(/\{.*\}/s);
        if (match) jsonStr = match[0];
        
        let txList = [];
        let fileBankName = "";
        let fileClosingBalance = null;
        
        try {
          const parsed = JSON.parse(jsonStr);
          txList = Array.isArray(parsed) ? parsed : (parsed.transactions || []);
          if (parsed.bankName) fileBankName = parsed.bankName;
          if (!isNaN(Number(parsed.closingBalance))) fileClosingBalance = Number(parsed.closingBalance);
        } catch (parseErr) {
          console.error(`Could not parse AI response for ${file.name}:`, parseErr.message);
          continue;
        }

        if (fileBankName) parsedBankNames.push(fileBankName);

        const todayStr = new Date().toISOString().split('T')[0];
        let fileMaxDate = '1970-01-01';
        
        txList.forEach(tx => {
            const rawAmt = String(tx.amount || 0).replace(/,/g, '').replace(/[^0-9.-]/g, '');
            const amt = Math.abs(Number(rawAmt) || 0);
            
            let date = tx.date || todayStr;
            // Normalize DD-MM-YYYY or DD/MM/YYYY to YYYY-MM-DD
            if (date.match(/^\d{2}[-/]\d{2}[-/]\d{4}$/)) {
                const parts = date.split(/[-/]/);
                date = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }

            if (amt > 0 && date <= todayStr) {
                const txType = String(tx.type || "expense").toLowerCase().includes("income") ? "income" : "expense";
                allValidTxs.push({
                    id: "imp_" + Date.now() + "_" + Math.random().toString(36).substring(7),
                    name: tx.name || tx.description || "Imported Tx",
                    desc: tx.name || tx.description || "Imported Tx",
                    category: tx.category || (txType === "income" ? "Income" : "Other"),
                    type: txType,
                    amount: amt,
                    date: date,
                    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                });
                if (date > fileMaxDate) fileMaxDate = date;
            }
        });
        
        // Track the closing balance from the most recent statement in the batch
        if (fileClosingBalance !== null && fileMaxDate >= latestClosingBalanceDate) {
            latestClosingBalance = fileClosingBalance;
            latestClosingBalanceDate = fileMaxDate;
        }
      }

      // 1. Single Bank Enforcement
      const cleanName = (name) => name.toLowerCase().replace(/\bbank\b/g, '').trim();
      const uniqueBanks = new Set(parsedBankNames.map(cleanName).filter(Boolean));
      if (uniqueBanks.size > 1) {
          setImportErrorMsg("Please upload statements from only ONE bank at a time. Detected: " + parsedBankNames.join(", "));
          setIsImporting(false);
          return;
      }

      // 2. Intra-batch Deduplication
      const uniqueNewTxs = [];
      allValidTxs.forEach(newTx => {
          const isDuplicate = uniqueNewTxs.some(existingTx => 
              existingTx.date === newTx.date &&
              existingTx.type === newTx.type &&
              Math.abs(Number(existingTx.amount)) === Math.abs(Number(newTx.amount))
          );
          if (!isDuplicate) uniqueNewTxs.push(newTx);
      });

      if (uniqueNewTxs.length > 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          let minDate = todayStr;
          let maxDate = '1970-01-01';
          uniqueNewTxs.forEach(tx => {
              if (tx.date < minDate) minDate = tx.date;
              if (tx.date > maxDate) maxDate = tx.date;
          });
          
          const spanDays = Math.abs(new Date(maxDate) - new Date(minDate)) / (1000 * 60 * 60 * 24);
          const has6MonthWarning = spanDays > 180;
          const daysSinceLatest = Math.abs(new Date(todayStr) - new Date(maxDate)) / (1000 * 60 * 60 * 24);
          const suggestBalanceUpdate = daysSinceLatest <= 7;
          
          newReviews.push({
            fileName: fileNames,
            txs: uniqueNewTxs,
            bankName: parsedBankNames[0] || "",
            closingBalance: latestClosingBalance,
            hasOverlapWarning: false, // will check strictly on save
            has6MonthWarning,
            suggestBalanceUpdate
          });
      }

      if (newReviews.length === 0) {
        setImportErrorMsg("Could not extract any valid new transactions. Make sure the file isn't empty, amounts are non-zero, and dates are not in the future.");
        setIsImporting(false);
      } else {
        setImportReviews(newReviews);
      }

    } catch (err) {
      console.error("Import error:", err);
      const msg = "Import failed: " + (err.message || String(err));

      setImportErrorMsg(msg);
    } finally {
      setIsImporting(false);
    }
  };


  const methodIcon = (m) => {
    if (!m) return null;
    if (m === "UPI") return <Smartphone size={14} />;
    return <Landmark size={14} />;
  };
  const methodLabel = (m) => {
    if (!m) return "";
    if (m === "UPI") return "UPI";
    const bank = banks.find(b => String(b.id) === String(m));
    return bank ? bank.bankName : "Bank";
  };

  const dailyAvgSpend = useMemo(() => getDailyAvgSpend(transactions, 30), [transactions]);

  const {
    currentMonthTx,
    spentThisMonth,
    incomeThisMonth,
    netSavings,
    monthlyBurnRate,
    spentByCategory,
    pieData,
    categoryPieData,
    txByDay,
    dayFiltered,
    targetYearStr,
    targetMonthStr,
    monthLabel,
    daysInMonth,
    BUDGETS
  } = useMemo(() => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthLabel = `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
    const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
    
    const targetYearStr = String(targetDate.getFullYear());
    const targetMonthStr = String(targetDate.getMonth() + 1).padStart(2, '0');

    const currentMonthTx = transactions.filter(t => {
      // Normalize legacy "Today" date string
      const dateStr = (!t.date || t.date === "Today") ? getLocalToday() : t.date;
      const [y, m] = dateStr.split("-");
      return y === targetYearStr && m === targetMonthStr;
    });

    const spentThisMonth = currentMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const incomeThisMonth = currentMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = incomeThisMonth - spentThisMonth;
    const monthlyBurnRate = upcomingBills.reduce((sum, b) => sum + Number(b.amount), 0);

    const spentByCategory = {};
    currentMonthTx.forEach(t => {
      if (t.type === 'expense') {
        spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
      }
    });

    const pieData = [];
    if (incomeThisMonth > 0) pieData.push({ name: "Income", value: incomeThisMonth, fill: theme.success });
    if (spentThisMonth > 0) pieData.push({ name: "Expense", value: spentThisMonth, fill: theme.danger });
    
    const categoryPieData = Object.entries(spentByCategory)
      .filter(([_, val]) => val > 0)
      .map(([cat, val], i, arr) => ({
        name: cat,
        value: val,
        fill: `hsl(${(i * 360 / arr.length)}, 50%, 75%)`
      }));

    const BUDGETS = EXPENSE_CATEGORIES.map(cat => ({
      category: cat,
      budget: categoryBudgets[cat] || 0,
      color: theme.accent
    })).filter(b => b.budget > 0);
    
    const txByDay = {};
    transactions.forEach((t) => {
      const [y, m, d] = t.date.split("-");
      if (y === targetYearStr && m === targetMonthStr) {
        const day = Number(d);
        txByDay[day] = txByDay[day] || [];
        txByDay[day].push(t);
      }
    });
    
    let dayFiltered = [...transactions];
    if (filterStartDate) dayFiltered = dayFiltered.filter(t => t.date >= filterStartDate);
    if (filterEndDate) dayFiltered = dayFiltered.filter(t => t.date <= filterEndDate);

    if (!filterStartDate && !filterEndDate && selectedDate) {
      dayFiltered = dayFiltered.filter((t) => {
        const [y, m, d] = t.date.split("-");
        return y === targetYearStr && m === targetMonthStr && Number(d) === selectedDate;
      });
    }

    if (filterType !== "All") dayFiltered = dayFiltered.filter(t => t.type === filterType.toLowerCase());
    if (filterBank !== "All") dayFiltered = dayFiltered.filter(t => String(t.method) === String(filterBank));
    if (filterCategory !== "All") dayFiltered = dayFiltered.filter(t => t.category === filterCategory);

    // Sort descending by date
    dayFiltered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      currentMonthTx, spentThisMonth, incomeThisMonth, netSavings, monthlyBurnRate,
      spentByCategory, pieData, categoryPieData, txByDay, dayFiltered,
      targetYearStr, targetMonthStr, monthLabel, daysInMonth, BUDGETS
    };
  }, [
    transactions, monthOffset, theme, upcomingBills, categoryBudgets, 
    filterStartDate, filterEndDate, selectedDate, filterType, filterBank, filterCategory
  ]);

  const handleImportStatement = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = '';
    if (!apiKey) {
      switchTab("profile");
      alert("⚠️ Please set your Gemini API key first.");
      return;
    }
    setPendingImportFiles(files);
    setShowImportConsent(true);
  };

  
  /* ---------------------------------- PLANNER TAB ---------------------------------- */


  /* ---------------------------------- INSIGHTS TAB ---------------------------------- */

  
  /* ---------------------------------- SETTINGS MODAL ---------------------------------- */

  /* ---------------------------------- LAYOUT ---------------------------------- */

    const appState = {
    activeTab, setActiveTab, swipeToast, setSwipeToast, swipeToastKey, setSwipeToastKey, swipeToastTimer, navBarRef, hasSeenNavHint, setHasSeenNavHint, history, setHistory, historyLoading, dailyGoalMinutes, setDailyGoalMinutes, hours, setHours, showCustomTimer, setShowCustomTimer, minutes, setMinutes, seconds, setSeconds, name, setName, isRunning, setIsRunning, remaining, setRemaining, activeSource, setActiveSource, audioUrl, setAudioUrl, youtubeId, setYoutubeId, isPlaying, setIsPlaying, volume, setVolume, isMuted, setIsMuted, activeCategoryPie, setActiveCategoryPie, fileInputRef, audioRef, audioCtxRef, oscillatorIntervalRef, alarmTimeoutRef, ytPlayerRef, ytLink, setYtLink, svgRef, mode, setMode, pomoPhase, setPomoPhase, pomoCycle, setPomoCycle, pomoFocusDuration, setPomoFocusDuration, pomoBreakDuration, setPomoBreakDuration, pomoMaxCycles, setPomoMaxCycles, transactions, setTransactions, transactionsLoading, linkedTodo, setLinkedTodo, showTodoPicker, setShowTodoPicker, showNoteModal, setShowNoteModal, sessionNote, setSessionNote, currentSessionId, setCurrentSessionId, migrationDoneRef, customCategories, setCustomCategories, customCategoryIcons, setCustomCategoryIcons, customIncomeCategories, setCustomIncomeCategories, todos, incrementPomodoro, toggleDone, updateTodo, categoryBudgets, setCategoryBudgets, upcomingBills, setUpcomingBills, billsLoading, showDailyGoalModal, setShowDailyGoalModal, tempDailyGoal, setTempDailyGoal, banks, setBanks, banksLoading, showBanksList, setShowBanksList, showBankForm, setShowBankForm, editingBankId, setEditingBankId, showCategoryForm, setShowCategoryForm, showManageCategories, setShowManageCategories, showCalendarWidget, setShowCalendarWidget, newCategoryName, setNewCategoryName, newCategoryIcon, setNewCategoryIcon, newCategoryType, setNewCategoryType, bankFormState, setBankFormState, showForm, setShowForm, showEditBalanceModal, setShowEditBalanceModal, editingBalanceAcc, setEditingBalanceAcc, tempBalance, setTempBalance, showBillModal, setShowBillModal, editingBill, setEditingBill, billFormState, setBillFormState, monthOffset, setMonthOffset, selectedDate, setSelectedDate, filterType, setFilterType, filterBank, setFilterBank, filterStartDate, setFilterStartDate, filterEndDate, setFilterEndDate, filterCategory, setFilterCategory, visibleTxCount, setVisibleTxCount, bankTxFilterType, setBankTxFilterType, bankTxFilterCategory, setBankTxFilterCategory, newAmount, setNewAmount, newDesc, setNewDesc, newCurrency, setNewCurrency, newExchangeRate, setNewExchangeRate, newCat, setNewCat, newType, setNewType, newDate, setNewDate, newTime, setNewTime, showCategoryDrawer, setShowCategoryDrawer, newMethod, setNewMethod, editingTxId, setEditingTxId, activeAccount, setActiveAccount, showBudgetModal, setShowBudgetModal, showBudgetDropdown, setShowBudgetDropdown, activeReminders, setActiveReminders, showBreathing, setShowBreathing, activeTechnique, setActiveTechnique, showReflectionHistory, setShowReflectionHistory, dailyIntention, setDailyIntention, dailyMood, setDailyMood, eveningReflection, setEveningReflection, dailyGratitude, setDailyGratitude, meditationDuration, setMeditationDuration, meditationTimeLeft, setMeditationTimeLeft, isMeditating, setIsMeditating, darkMode, setDarkMode, baseCurrency, setBaseCurrency, query, setQuery, loading, setLoading, insight, setInsight, askInput, setAskInput, askAnswer, setAskAnswer, asking, setAsking, generating, setGenerating, generatedInsight, setGeneratedInsight, apiKey, setApiKey, direction, setDirection, showInsights, setShowInsights, expenseView, setExpenseView, walletCardIndex, setWalletCardIndex, showRuleModal, setShowRuleModal, showWipeConfirm, setShowWipeConfirm, customCategoryRules, setCustomCategoryRules, importReviews, setImportReviews, updateBankBalance, setUpdateBankBalance, editableBankName, setEditableBankName, isImporting, setIsImporting, importErrorMsg, setImportErrorMsg, duplicateWarning, setDuplicateWarning, showImportConsent, setShowImportConsent, pendingImportFiles, setPendingImportFiles, showImportCelebration, setShowImportCelebration, importedCount, setImportedCount, lastImportSnapshot, setLastImportSnapshot, importSnapshotLoading,
    theme, fontDisplay, fontBody, NeoSurface, NeoInput, PrimaryButton, IconBtn, SectionLabel, NeoSelect, CollapsibleSection, ALL_EXPENSE_CATEGORIES, ALL_INCOME_CATEGORIES, getDailyAvgSpend, markDayActive, updateBalanceForMethod, BankBadge, CATEGORY_KEYWORD_MAP, TX_CATEGORY_ICONS, ICON_OPTIONS, BANK_ICONS, handleFileUpload, handleImportStatement, PRESET_BANKS, MUSIC_OPTIONS, RENDER_CUSTOM_ICON,
    NeoDatePicker, TimePicker, playAlarm, stopAlarm, initAudioCtx, autoTimerName, resetTimer, extractYoutubeId, handlePlayPause,
    methodLabel, dailyAvgSpend, currentMonthTx, spentThisMonth, incomeThisMonth, netSavings, monthlyBurnRate, spentByCategory, pieData, categoryPieData, txByDay, dayFiltered, targetYearStr, targetMonthStr, monthLabel, daysInMonth, BUDGETS, streak
  };

  const TABS = [
    { id: "summary", label: "Home", icon: LayoutDashboard },
    { id: "expense", label: "Expense", icon: Wallet },
    { id: "notes", label: "Notes", icon: LucideIcons.Notebook },
    { id: "meditation", label: "Zen", icon: Flower2 },
    { id: "timer", label: "Timer", icon: TimerIcon },
    { id: "todo", label: "Todo", icon: ListChecks },
    { id: "profile", label: "Profile", icon: User },
  ];

  const focusTimerAdapter = {
    timerState: {
      isRunning: isRunning,
      durationSeconds: hours * 3600 + minutes * 60 + seconds || 1,
      remainingSeconds: remaining,
    },
    addTime: (secs) => {
      const newTotal = (hours * 3600 + minutes * 60 + seconds) + secs;
      setHours(Math.floor(newTotal / 3600));
      setMinutes(Math.floor((newTotal % 3600) / 60));
      setSeconds(newTotal % 60);
      setRemaining(prev => prev + secs);
    },
    setDuration: (secs) => {
      setHours(Math.floor(secs / 3600));
      setMinutes(Math.floor((secs % 3600) / 60));
      setSeconds(secs % 60);
      setRemaining(secs);
    },
    startTimer: () => {
      stopAlarm();
      if (!isRunning) {
        setIsRunning(true);
        setIsPlaying(true);
        if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.playVideo) ytPlayerRef.current.playVideo();
        else if (audioRef.current) audioRef.current.play().catch(e => console.error(e));
      }
    },
    pauseTimer: () => {
      stopAlarm();
      if (isRunning) {
        setIsRunning(false);
        setIsPlaying(false);
        if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
        else if (audioRef.current) audioRef.current.pause();
      }
    },
    stopTimer: () => {
      stopAlarm();
      setIsRunning(false);
      setIsPlaying(false);
      setRemaining(hours * 3600 + minutes * 60 + seconds);
      if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
      else if (audioRef.current) audioRef.current.pause();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.pageBg, ...fontBody }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: ${theme.pageBg}; overflow-x: hidden; color-scheme: ${darkMode ? 'dark' : 'light'}; }
        #root { width: 100%; height: 100%; }
        * { box-sizing: border-box; }
        @keyframes slideInRight { from { transform: translateX(28px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInLeft { from { transform: translateX(-28px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes eqBounce { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
        @keyframes progressGlide { 0% { width: 0%; left: 0%; } 50% { width: 100%; left: 0%; } 100% { width: 0%; left: 100%; } }
        @keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%, -5px); } 15% { opacity: 1; transform: translate(-50%, 0); } 85% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -5px); } }
      `}</style>
      <div style={{ width: "100%", minHeight: "100vh", background: theme.pageBg, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        
        {swipeToast && (
          <div key={swipeToastKey} style={{
            position: "absolute", top: 72, left: "50%", transform: "translateX(-50%)", zIndex: 100,
            background: theme.bg, 
            color: theme.textPrimary, padding: "4px 12px", borderRadius: 12,
            fontSize: 11, fontWeight: 700, ...fontBody, letterSpacing: 0.5,
            boxShadow: theme.shadowRaisedSm,
            pointerEvents: "none",
            animation: "fadeInOut 1.2s ease forwards",
          }}>
            {swipeToast}
          </div>
        )}

        {/* top pill tab bar */}
        <div 
          style={{ position: "relative", zIndex: 10, height: 0, overflow: "visible" }}
        >
          <div ref={navBarRef} style={{ 
            position: "absolute", top: 12, left: "50%",
            width: "calc(100% - 36px)", maxWidth: 500,
            display: "flex", gap: 4, background: theme.bg, boxShadow: theme.shadowRaised, borderRadius: 18, padding: 4,
            opacity: 1,
            pointerEvents: "auto",
            transform: "translateX(-50%)"
          }}>
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
                  <Icon size={20} />
                </button>
              );
            })}
          </div>
        </div>

        {/* swipeable content */}
        <div
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", paddingTop: 85 }}
          onMouseDown={onSwipeStart}
          onMouseMove={onSwipeMove}
          onMouseUp={onSwipeEnd}
          onTouchStart={onSwipeStart}
          onTouchMove={onSwipeMove}
          onTouchEnd={onSwipeEnd}
        >
          <div key={activeTab} style={{ animation: `${direction > 0 ? "slideInRight" : "slideInLeft"} 0.25s ease`, flex: "1 0 auto", display: "flex", flexDirection: "column" }}>
            {activeTab === "summary" && <SummaryTab theme={theme} NeoSurface={NeoSurface} NeoInput={NeoInput} fontDisplay={fontDisplay} fontBody={fontBody} onNavigate={switchTab} transactions={transactions} streak={streak} activeDays={activeDays} monthlyActiveCount={monthlyActiveCount} daysInMonth={streakDaysInMonth} yearlyActiveCount={yearlyActiveCount} daysInYear={daysInYear} onShowForm={() => { switchTab('expense'); setShowForm(true); }} isImporting={isImporting} onImportStatement={handleImportStatement} totalBudget={Object.values(categoryBudgets).reduce((sum, b) => sum + (Number(b) || 0), 0)} focusTimer={focusTimerAdapter} />}
            {activeTab === "expense" && <ExpenseTab {...appState} />}
            {activeTab === "notes" && <NotesTab theme={theme} fontDisplay={fontDisplay} fontBody={fontBody} NeoSurface={NeoSurface} NeoInput={NeoInput} />}
            {activeTab === "meditation" && <ZenTab 
              theme={theme} fontDisplay={fontDisplay} fontBody={fontBody}
              zenStreak={zenStreak} activeTechnique={activeTechnique} setActiveTechnique={setActiveTechnique}
              markZenActiveToday={markZenActiveToday} showReflectionHistory={showReflectionHistory}
              setShowReflectionHistory={setShowReflectionHistory} activeSource={activeSource}
              setActiveSource={setActiveSource} MUSIC_OPTIONS={MUSIC_OPTIONS}
              handleMeditationComplete={handleMeditationComplete} NeoSurface={NeoSurface}
              todos={todos} transactions={transactions}
            />}
            {activeTab === "timer" && <TimerTab {...appState} />}
            {activeTab === "todo" && <TodoTab theme={theme} NeoSurface={NeoSurface} NeoInput={NeoInput} PrimaryButton={PrimaryButton} SectionLabel={SectionLabel} fontDisplay={fontDisplay} fontBody={fontBody} />}
            {activeTab === "profile" && <ProfileTab 
              theme={theme}
              fontDisplay={fontDisplay}
              fontBody={fontBody}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              setShowInsights={setShowInsights}
              apiKey={apiKey}
              setApiKey={setApiKey}
              baseCurrency={baseCurrency}
              setBaseCurrency={setBaseCurrency}
              setShowManageCategories={setShowManageCategories}
              customCategoryRules={customCategoryRules}
              setCustomCategoryRules={setCustomCategoryRules}
              setShowRuleModal={setShowRuleModal}
              setShowWipeConfirm={setShowWipeConfirm}
              NeoSurface={NeoSurface}
              NeoInput={NeoInput}
              SectionLabel={SectionLabel}
              IconBtn={IconBtn}
              PrimaryButton={PrimaryButton}
              NeoSelect={NeoSelect}
            />}
          </div>
        </div>
        <audio ref={audioRef} style={{ display: 'none' }} />
        <div id="yt-audio-player" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", visibility: "hidden" }}></div>
      </div>

      {showInsights && <InsightsOverlay />}
      {showCategoryForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: theme.bg, borderRadius: 24, width: "100%", maxWidth: 400, padding: 24, boxShadow: theme.shadowRaised }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay, marginBottom: 16 }}>New Category</div>
            
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>CATEGORY NAME</div>
            <NeoInput 
              placeholder="e.g., Pets, Education" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
            />

            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginBottom: 8, marginTop: 16 }}>CATEGORY TYPE</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["expense", "income"].map(type => (
                <button
                  key={type}
                  onClick={() => setNewCategoryType(type)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: 12,
                    background: newCategoryType === type ? theme.accent : "transparent",
                    color: newCategoryType === type ? "#fff" : theme.textSecondary,
                    border: newCategoryType === type ? `1px solid ${theme.border}` : "1px solid transparent",
                    boxShadow: newCategoryType === type ? theme.shadowInset : "none",
                    cursor: "pointer",
                    fontWeight: 600, fontSize: 13, textTransform: "capitalize", ...fontBody,
                    transition: "all 0.2s"
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginBottom: 8, marginTop: 16 }}>SELECT ICON</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4, marginBottom: 16 }}>
              {ICON_OPTIONS.map(iconKey => (
                <div 
                  key={iconKey} 
                  onClick={() => setNewCategoryIcon(iconKey)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: "10px 0",
                    borderRadius: 12, background: newCategoryIcon === iconKey ? theme.accent : "transparent",
                    color: newCategoryIcon === iconKey ? "#fff" : theme.textSecondary,
                    boxShadow: newCategoryIcon === iconKey ? theme.shadowInset : "none",
                    border: newCategoryIcon === iconKey ? `1px solid ${theme.border}` : "1px solid transparent",
                    transition: "all 0.2s"
                  }}
                >
                  {RENDER_CUSTOM_ICON(iconKey, 20)}
                </div>
              ))}
            </div>
            
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowCategoryForm(false)} style={{ flex: 1, background: "transparent", color: theme.textSecondary, border: "none", padding: "14px", borderRadius: 14, fontWeight: 600, ...fontBody }}>Cancel</button>
              <PrimaryButton 
                label="Save Category" 
                onClick={() => {
                  const catName = newCategoryName.trim();
                  if (catName) {
                    if (newCategoryType === "income") {
                      if (!ALL_INCOME_CATEGORIES.includes(catName)) {
                        setCustomIncomeCategories(prev => [...(Array.isArray(prev) ? prev : []), catName]);
                        setCustomCategoryIcons(prev => ({...prev, [catName]: newCategoryIcon}));
                      }
                      setNewType("income");
                      setNewCat(catName); // Auto-select it
                    } else if (newCategoryType === "expense") {
                      if (!ALL_EXPENSE_CATEGORIES.includes(catName)) {
                        setCustomCategories(prev => [...(Array.isArray(prev) ? prev : []), catName]);
                        setCustomCategoryIcons(prev => ({...prev, [catName]: newCategoryIcon}));
                      }
                      setNewType("expense");
                      setNewCat(catName); // Auto-select it
                    }
                  }
                  setShowCategoryForm(false);
                  setNewCategoryName("");
                  setNewCategoryIcon("Box");
                  setNewCategoryType("expense");
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {showManageCategories && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: theme.bg, borderRadius: 24, width: "100%", maxWidth: 400, padding: 24, boxShadow: theme.shadowRaised, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Manage Categories</div>
              <button onClick={() => setShowManageCategories(false)} style={{ background: "transparent", border: "none", color: theme.textSecondary }}><X size={20} /></button>
            </div>
            
            {customCategories.length === 0 && customIncomeCategories.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: theme.textSecondary, ...fontBody }}>No custom categories added yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {customCategories.map(cat => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 16, background: theme.bg, boxShadow: theme.shadowInset }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, color: theme.textSecondary }}>
                        {customCategoryIcons[cat] ? RENDER_CUSTOM_ICON(customCategoryIcons[cat], 20) : <Box size={20} />}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>{cat} <span style={{ fontSize: 10, color: theme.textSecondary, marginLeft: 4 }}>(Expense)</span></span>
                    </div>
                    <button 
                      onClick={() => {
                        setCustomCategories(prev => prev.filter(c => c !== cat));
                        setTransactions(prev => prev.map(t => t.category === cat ? { ...t, category: "Other" } : t));
                        setCustomCategoryIcons(prev => { const copy = {...prev}; delete copy[cat]; return copy; });
                      }} 
                      style={{ background: "transparent", border: "none", color: theme.danger, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {customIncomeCategories.map(cat => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 16, background: theme.bg, boxShadow: theme.shadowInset }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, color: theme.textSecondary }}>
                        {customCategoryIcons[cat] ? RENDER_CUSTOM_ICON(customCategoryIcons[cat], 20) : <Box size={20} />}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>{cat} <span style={{ fontSize: 10, color: theme.textSecondary, marginLeft: 4 }}>(Income)</span></span>
                    </div>
                    <button 
                      onClick={() => {
                        setCustomIncomeCategories(prev => prev.filter(c => c !== cat));
                        setTransactions(prev => prev.map(t => t.category === cat ? { ...t, category: "Other" } : t));
                        setCustomCategoryIcons(prev => { const copy = {...prev}; delete copy[cat]; return copy; });
                      }} 
                      style={{ background: "transparent", border: "none", color: theme.danger, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <PrimaryButton 
              label="Add Category" 
              icon={<Plus size={18} />} 
              onClick={() => {
                setShowManageCategories(false);
                setShowCategoryForm(true);
              }}
              style={{ marginTop: 24, width: "100%" }}
            />
          </div>
        </div>
      )}

      {/* CUSTOM RULE MODAL */}
      {showRuleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <NeoSurface style={{ width: 320, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Add Custom Rule</div>
            <div>
              <label style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4, display: "block", ...fontBody }}>Keyword</label>
              <NeoInput id="modal-rule-keyword" placeholder="e.g. bescom" style={{ width: "100%", padding: "10px", fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4, display: "block", ...fontBody }}>Category</label>
              <select id="modal-rule-category" onChange={(e) => {
                if (e.target.value === "_ADD_NEW") {
                  setShowCategoryForm(true);
                  e.target.value = "Other";
                }
              }} style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: theme.bg, color: theme.textPrimary, boxShadow: theme.shadowInset, outline: "none", fontSize: 14, ...fontBody }}>
                {ALL_EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="_ADD_NEW" style={{ color: theme.accent, fontWeight: 700 }}>+ Add New Category</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => setShowRuleModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: theme.bg, color: theme.textSecondary, boxShadow: theme.shadowRaisedSm, fontWeight: 600, ...fontBody, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => {
                const kw = document.getElementById("modal-rule-keyword").value.trim().toLowerCase();
                const cat = document.getElementById("modal-rule-category").value;
                if (kw) {
                  setCustomCategoryRules(prev => [...prev, { keyword: kw, category: cat }]);
                  setTransactions(prev => prev.map(t => t.name.toLowerCase().includes(kw) ? { ...t, category: cat } : t));
                  setShowRuleModal(false);
                }
              }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: theme.accent, color: "#fff", fontWeight: 600, ...fontBody, cursor: "pointer" }}>Confirm</button>
            </div>
          </NeoSurface>
        </div>
      )}

      {/* WIPE CONFIRM MODAL */}
      {showWipeConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <NeoSurface style={{ width: 320, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.danger, ...fontDisplay }}>Wipe Data</div>
            <div style={{ fontSize: 14, color: theme.textSecondary, ...fontBody }}>
              Are you sure you want to delete all transactions and reset balances? Your bank accounts and settings will be preserved.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => setShowWipeConfirm(false)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: theme.bg, color: theme.textSecondary, boxShadow: theme.shadowRaisedSm, fontWeight: 600, ...fontBody, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => {
                setTransactions([]);
                setBalances({ bank: 0, upi: 0 });
                setBanks(prev => prev.map(b => ({ ...b, balance: 0 })));
                setShowWipeConfirm(false);
                setShowSettings(false);

              }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: theme.danger, color: "#fff", fontWeight: 600, ...fontBody, cursor: "pointer" }}>Wipe Data</button>
            </div>
          </NeoSurface>
        </div>
      )}

      {/* IMPORT REVIEW MODAL */}
      {importReviews.length > 0 && (() => {
        const currentReview = importReviews[0];
        return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <NeoSurface style={{ width: '90%', maxWidth: 400, maxHeight: '80vh', padding: 24, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Review Imported Transactions</div>
            <div style={{ fontSize: 14, color: theme.textSecondary, ...fontBody }}>
              {currentReview.txs.length} new transactions found in {currentReview.fileName}.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, ...fontBody }}>Bank Account</div>
              <input
                value={editableBankName}
                onChange={(e) => setEditableBankName(e.target.value)}
                placeholder="Enter bank name..."
                style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: theme.bg, color: theme.textPrimary, boxShadow: theme.shadowInset, fontSize: 14, ...fontBody, outline: "none" }}
              />
            </div>

            {currentReview.hasOverlapWarning && (
              <div style={{ background: theme.warning + "20", color: theme.warning, padding: 12, borderRadius: 8, fontSize: 13, ...fontBody }}>
                <strong>⚠️ Warning:</strong> Some imported transaction dates overlap with your existing data. Verify for duplicates.
              </div>
            )}
            
            {currentReview.has6MonthWarning && (
              <div style={{ background: theme.accent + "20", color: theme.accent, padding: 12, borderRadius: 8, fontSize: 13, ...fontBody }}>
                <strong>ℹ️ Note:</strong> This statement spans more than 6 months of data.
              </div>
            )}

            {currentReview.closingBalance !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: theme.bg, padding: 12, borderRadius: 12, boxShadow: theme.shadowInset }}>
                <input 
                  type="checkbox" 
                  checked={updateBankBalance} 
                  onChange={(e) => setUpdateBankBalance(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: theme.accent, cursor: "pointer" }}
                />
                <div style={{ fontSize: 13, color: theme.textPrimary, ...fontBody }}>
                  Update bank balance to <strong>{formatCurrency(currentReview.closingBalance, baseCurrency)}</strong>
                  {!currentReview.suggestBalanceUpdate && <div style={{ color: theme.warning, fontSize: 11, marginTop: 4 }}>Unchecked by default (statement is old)</div>}
                </div>
              </div>
            )}
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
              {currentReview.txs.map((tx, idx) => (
                <div key={idx} style={{ padding: 12, borderRadius: 12, background: theme.bg, boxShadow: theme.shadowInset }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: theme.textPrimary, ...fontBody }}>{tx.name}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: tx.type === 'income' ? theme.success : theme.textPrimary, ...fontDisplay }}>
                      {tx.type === 'income' ? '+' : ''}{formatCurrency(tx.amount, baseCurrency)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: theme.textSecondary, ...fontBody }}>
                    <span>{tx.date}</span>
                    <span>{tx.category}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => {
                  try {
                    if (importReviews.length > 1) {
                        const nextReview = importReviews[1];
                        const fallback = nextReview.fileName.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
                        setEditableBankName(nextReview.bankName || fallback);
                        setUpdateBankBalance(nextReview.suggestBalanceUpdate);
                    } else {
                        setEditableBankName("");
                    }
                    setImportReviews(prev => prev.slice(1));
                  } catch (err) {

                  }
              }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: theme.bg, color: theme.textSecondary, boxShadow: theme.shadowRaisedSm, fontWeight: 600, ...fontBody, cursor: "pointer" }}>Skip File</button>
              
              <button onClick={() => {
                try {
                const count = currentReview.txs.length;
                let targetMethod = null;
                const bankName = editableBankName.trim();
                
                if (!bankName) {
                    alert("Please enter a valid Bank Name to save these transactions.");
                    return;
                }

                const closingBalance = currentReview.closingBalance;

                const normalizedBank = bankName.toLowerCase();
                const isUpi = normalizedBank.includes('upi') || normalizedBank.includes('phonepe') || normalizedBank.includes('gpay') || normalizedBank.includes('paytm');
                
                if (isUpi) {
                    targetMethod = 'UPI';
                    if (!isNaN(closingBalance) && updateBankBalance) {
                        setBalances(prev => ({ ...prev, upi: closingBalance }));
                    }
                } else if (bankName) {
                    const cleanName = (name) => (name || "").toLowerCase().replace(/\bbank\b/g, '').trim();
                    const existingBank = banks.find(b => {
                        const bName = cleanName(b.bankName);
                        const nName = cleanName(normalizedBank);
                        return bName && nName && bName === nName;
                    });
                    
                    if (existingBank) {
                        targetMethod = String(existingBank.id);
                        if (!isNaN(closingBalance) && updateBankBalance) {
                            setBanks(prev => prev.map(b => String(b.id) === targetMethod ? { ...b, balance: closingBalance } : b));
                        }
                    } else {
                        // Always create new bank — never silently assign to existing
                        const newBankId = Date.now();
                        targetMethod = String(newBankId);
                        setBanks(prev => [...prev, { id: newBankId, bankName: bankName, balance: (!isNaN(closingBalance) && updateBankBalance) ? closingBalance : 0, icon: "🏛️" }]);
                    }
                } else {
                    // Truly no name, last resort: first bank or UPI
                    targetMethod = banks.length > 0 ? String(banks[0].id) : 'UPI';
                }

                const existingBankTxs = transactions.filter(t => String(t.method) === targetMethod);
                const txsToSave = [];
                currentReview.txs.forEach(newTx => {
                    const isDuplicate = existingBankTxs.some(existingTx => 
                        existingTx.date === newTx.date &&
                        existingTx.type === newTx.type &&
                        Math.abs(Number(existingTx.amount)) === Math.abs(Number(newTx.amount))
                    );
                    if (!isDuplicate) {
                        txsToSave.push({ ...newTx, method: targetMethod });
                    }
                });

                if (txsToSave.length > 0) {
                    setTransactions(prev => {
                        const newArr = [...txsToSave, ...prev];
                        newArr.sort((a, b) => new Date(b.date) - new Date(a.date));
                        return newArr;
                    });
                }
                
                // Record snapshot for undo (valid 24h). We do not record balance deltas anymore for statement imports.
                setLastImportSnapshot({
                  ids: txsToSave.map(t => t.id),
                  method: targetMethod,
                  balanceDelta: 0,
                  timestamp: Date.now(),
                  count: txsToSave.length,
                });

                setImportedCount(txsToSave.length);
                
                if (importReviews.length > 1) {
                    const nextReview = importReviews[1];
                    const fallback = nextReview.fileName.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
                    setEditableBankName(nextReview.bankName || fallback);
                    setUpdateBankBalance(nextReview.suggestBalanceUpdate);
                } else {
                    setEditableBankName("");
                }
                
                setImportReviews(prev => prev.slice(1));

                setShowImportCelebration(true);
                setTimeout(() => setShowImportCelebration(false), 4000);
                } catch (err) {

                }
              }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: theme.accent, color: "#fff", fontWeight: 700, ...fontBody, cursor: "pointer" }}>
                {importReviews.length > 1 ? "Save & Next" : "Save All"}
              </button>
            </div>
          </NeoSurface>
        </div>
        );
      })()}

      {/* IMPORT CONSENT MODAL */}
      {showImportConsent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 95, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <NeoSurface style={{ width: "100%", maxWidth: 360, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f59e0b22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 20 }}>🛡️</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Privacy Notice</div>
            </div>
            <div style={{ fontSize: 13.5, color: theme.textSecondary, lineHeight: 1.65, ...fontBody }}>
              {pendingImportFiles.length === 1
                ? <>Your statement (<strong style={{ color: theme.textPrimary }}>{pendingImportFiles[0]?.name}</strong>)</>
                : <><strong style={{ color: theme.textPrimary }}>{pendingImportFiles.length} files</strong> ({pendingImportFiles.map(f => f.name).join(", ")})</>
              } will be sent to <strong style={{ color: theme.textPrimary }}>Google Gemini AI</strong> for parsing.
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "#f59e0b15", border: "1px solid #f59e0b55", fontSize: 13, color: "#b45309", lineHeight: 1.6, ...fontBody }}>
              ⚠️ <strong>Avoid uploading files with:</strong>
              <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                <li>Passwords or PINs</li>
                <li>Full account numbers</li>
                <li>Aadhaar / PAN details</li>
              </ul>
              Bank statement CSVs are generally safe as they only contain transaction history.
            </div>
            <div style={{ fontSize: 12, color: theme.textSecondary, ...fontBody }}>
              Per Google's API policy, data sent via API is <strong>not used to train models</strong>.
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={() => { setShowImportConsent(false); setPendingImportFiles([]); }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: theme.bg, color: theme.textSecondary, boxShadow: theme.shadowRaisedSm, fontWeight: 600, ...fontBody, cursor: "pointer" }}>Cancel</button>
              <button onClick={async () => {
                setShowImportConsent(false);
                await processImportFiles(pendingImportFiles);
                setPendingImportFiles([]);
              }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: theme.accent, color: "#fff", fontWeight: 700, ...fontBody, cursor: "pointer" }}>Proceed →</button>
            </div>
          </NeoSurface>
        </div>
      )}

      {/* IMPORT CELEBRATION CARD */}
      {showImportCelebration && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 96, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <NeoSurface style={{ width: "100%", maxWidth: 340, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", animation: "fadeIn 0.4s ease-out" }}>
            <div style={{ fontSize: 56, lineHeight: 1, animation: "bounceIn 0.5s ease-out" }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: theme.textPrimary, ...fontDisplay }}>Import Complete!</div>
            <div style={{ fontSize: 15, color: theme.textSecondary, ...fontBody }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: theme.accent, display: "block", ...fontDisplay }}>{importedCount}</span>
              transactions added to your account
            </div>
            <div style={{ fontSize: 13, color: theme.textSecondary, ...fontBody }}>Your bank balance has been updated automatically.</div>
            <div style={{ fontSize: 12, color: theme.textSecondary, ...fontBody, background: theme.bg, borderRadius: 10, padding: "8px 12px", boxShadow: theme.shadowInset }}>
              ↩️ You can undo this import within <strong>24 hours</strong>
            </div>
            <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 4 }}>
              <button onClick={() => {
                if (lastImportSnapshot && Date.now() - lastImportSnapshot.timestamp < 86400000) {
                  setTransactions(prev => prev.filter(t => !lastImportSnapshot.ids.includes(t.id)));
                  updateBalanceForMethod(lastImportSnapshot.method, -lastImportSnapshot.balanceDelta);
                  setLastImportSnapshot(null);

                }
                setShowImportCelebration(false);
              }} style={{ flex: 1, padding: "12px", borderRadius: 30, border: `1px solid ${theme.border}`, background: "transparent", color: theme.textSecondary, fontWeight: 600, fontSize: 13, ...fontBody, cursor: "pointer" }}>
                Undo Import
              </button>
              <button onClick={() => setShowImportCelebration(false)} style={{ flex: 1, padding: "12px", borderRadius: 30, border: "none", background: theme.accent, color: "#fff", fontWeight: 700, fontSize: 14, ...fontBody, cursor: "pointer" }}>
                Awesome! 🚀
              </button>
            </div>
          </NeoSurface>
        </div>
      )}

      {duplicateWarning && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <NeoSurface style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 320 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.accent, fontWeight: 700, ...fontDisplay, fontSize: 16 }}>
                <AlertTriangle size={20} strokeWidth={2.5} />
                Duplicate Import
              </div>
              <button onClick={() => setDuplicateWarning(false)} style={{ background: "none", border: "none", color: theme.textSecondary, cursor: "pointer", display: "flex", padding: 0 }}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div style={{ color: theme.textSecondary, fontSize: 14, ...fontBody, lineHeight: 1.5 }}>
              We found <strong>0 new transactions</strong> in your statement. All records perfectly matched existing transactions based on date, amount, and type to prevent double-counting.
            </div>
            <PrimaryButton label="Got it" onClick={() => setDuplicateWarning(false)} style={{ marginTop: 8, padding: "12px 0", borderRadius: 14, fontSize: 15 }} />
          </NeoSurface>
        </div>
      )}

      {showInsights && <InsightsOverlay />}

      {/* In-App Reminder Alerts */}
      {activeReminders.length > 0 && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activeReminders.map(rem => (
            <div key={rem.id} style={{
              background: theme.bg,
              padding: '16px 20px',
              borderRadius: 16,
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              border: `1px solid ${theme.border}`,
              display: 'flex', alignItems: 'center', gap: 12,
              animation: 'slideInRight 0.3s ease'
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Bell size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h4 style={{ margin: 0, fontSize: 16, color: theme.textPrimary, ...fontDisplay }}>Reminder</h4>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: theme.textSecondary, ...fontBody }}>{rem.text}</p>
              </div>
              <button
                onClick={() => setActiveReminders(prev => prev.filter(r => r.id !== rem.id))}
                style={{ background: 'transparent', border: 'none', color: theme.textSecondary, cursor: 'pointer', padding: 8 }}
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

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
              <PrimaryButton label="Save note" icon={<Check size={15} />} onClick={() => {
                stopAlarm();
                setShowNoteModal(false);
                if (sessionNote.trim()) {
                  setHistory(h => h.map(item => item.id === currentSessionId ? { ...item, note: sessionNote.trim() } : item));
                }
                setSessionNote("");
              }} style={{ flex: 1 }} />
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
