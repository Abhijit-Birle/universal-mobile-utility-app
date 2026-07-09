import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  AlertTriangle
} from "lucide-react";
import * as XLSX from "xlsx";
import Strands from "./components/Strands";
import BreathingExercise from "./components/BreathingExercise";
import MoneyTab from "./tabs/MoneyTab.jsx";
import TodoTab from "./tabs/TodoTab.jsx";
import TimePicker from "./components/ui/TimePicker.jsx";
import NeoSelect from "./components/ui/NeoSelect.jsx";
import { useTodos } from "./hooks/useTodos.js";
import { CURRENCIES, formatCurrency, getCurrencyByCode } from "./utils/currency.js";
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
const EXPENSE_CSV_MAP = {
  Transport: ['uber', 'lyft', 'taxi', 'train', 'flight', 'irctc', 'ola', 'rapido', 'metro'],
  Food: ['swiggy', 'zomato', 'mcdonalds', 'starbucks', 'cafe', 'restaurant', 'food', 'dominos', 'kfc', 'blinkit', 'instamart', 'zepto'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'mart', 'store', 'retail', 'supermarket', 'd-mart', 'reliancemart'],
  Entertainment: ['netflix', 'spotify', 'prime', 'cinema', 'movie', 'bookmyshow', 'pvr', 'hotstar'],
  Health: ['hospital', 'pharmacy', 'clinic', 'medical', 'apollo', 'practo', 'netmeds', '1mg'],
  Bills: ['electricity', 'water', 'gas', 'internet', 'broadband', 'airtel', 'jio', 'vi', 'recharge', 'emi', 'bill'],
};
const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"];

const TX_CATEGORY_ICONS = {
  Food: <Utensils size={18} />, Transport: <Car size={18} />, Shopping: <ShoppingCart size={18} />, Bills: <FileText size={18} />, Entertainment: <Film size={18} />, Health: <HeartPulse size={18} />, Education: <BookOpen size={18} />,
  Salary: <Briefcase size={18} />, Freelance: <Laptop size={18} />, Business: <Building2 size={18} />, Investment: <TrendingUp size={18} />, Gift: <Gift size={18} />, Other: <Box size={18} />,
};

const RENDER_CUSTOM_ICON = (key, size=18) => {
  switch (key) {
    case "Box": return <Box size={size} />;
    case "Tag": return <Tag size={size} />;
    case "ShoppingCart": return <ShoppingCart size={size} />;
    case "Car": return <Car size={size} />;
    case "HeartPulse": return <HeartPulse size={size} />;
    case "BookOpen": return <BookOpen size={size} />;
    case "Film": return <Film size={size} />;
    case "Gift": return <Gift size={size} />;
    case "Smartphone": return <Smartphone size={size} />;
    case "Camera": return <Camera size={size} />;
    case "Music2": return <Music2 size={size} />;
    case "Dumbbell": return <Dumbbell size={size} />;
    case "Utensils": return <Utensils size={size} />;
    case "CreditCard": return <CreditCard size={size} />;
    case "Target": return <Target size={size} />;
    case "Award": return <Award size={size} />;
    case "Wallet": return <Wallet size={size} />;
    case "Sun": return <Sun size={size} />;
    case "Moon": return <Moon size={size} />;
    case "Briefcase": return <Briefcase size={size} />;
    case "DollarSign": return <DollarSign size={size} />;
    case "User": return <User size={size} />;
    case "Banknote": return <Banknote size={size} />;
    case "Sparkles": return <Sparkles size={size} />;
    case "Users": return <Users size={size} />;
    case "Mail": return <Mail size={size} />;
    case "Calendar": return <Calendar size={size} />;
    case "FileText": return <FileText size={size} />;
    case "GraduationCap": return <GraduationCap size={size} />;
    case "Phone": return <Phone size={size} />;
    case "Presentation": return <Presentation size={size} />;
    case "Flag": return <Flag size={size} />;
    case "Cloud": return <Cloud size={size} />;
    case "MessageSquare": return <MessageSquare size={size} />;
    case "Bell": return <Bell size={size} />;
    case "Landmark": return <Landmark size={size} />;
    case "Flame": return <Flame size={size} />;
    case "Flower2": return <Flower2 size={size} />;
    case "Laptop": return <Laptop size={size} />;
    case "Building2": return <Building2 size={size} />;
    default: return <Box size={size} />;
  }
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

const EXPENSE_KEYWORD_MAP = {
  Food: ["mcdonalds", "starbucks", "lunch", "dinner", "breakfast", "grocery", "groceries", "swiggy", "zomato", "restaurant", "cafe", "coffee", "pizza", "burger"],
  Transport: ["uber", "ola", "gas", "petrol", "taxi", "bus", "train", "flight", "metro", "auto"],
  Bills: ["netflix", "spotify", "wifi", "internet", "electricity", "water", "rent", "emi", "mobile", "recharge", "prime"],
  Shopping: ["amazon", "flipkart", "myntra", "clothes", "shoes", "electronics", "mall", "zara", "h&m"],
  Health: ["doctor", "pharmacy", "medicine", "hospital", "gym", "workout", "clinic", "therapy"],
  Education: ["course", "udemy", "school", "college", "tuition", "books", "coursera"],
  Entertainment: ["movie", "cinema", "game", "steam", "concert", "party", "club"]
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

const TAB_ORDER = ["timer", "meditation", "expense", "todo"];


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
    } catch (error) { }
  }, [key, state]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) setState(JSON.parse(item));
      } catch (e) { }
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
  const [streak, setStreak] = useLocalStorage("neo_streak", 3);
  const [linkedTodo, setLinkedTodo] = useState(null);
  const [showTodoPicker, setShowTodoPicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [sessionNote, setSessionNote] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const [transactions, setTransactions] = useLocalStorage("neo_transactions", []);

  useEffect(() => {
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
  }, [transactions, setTransactions]);
  const [customCategories, setCustomCategories] = useLocalStorage("neo_custom_categories", []);
  
  useEffect(() => {
    if (customCategories.includes("Food & Dining")) {
      setCustomCategories(prev => prev.filter(c => c !== "Food & Dining"));
    }
  }, [customCategories, setCustomCategories]);

  const [customCategoryIcons, setCustomCategoryIcons] = useLocalStorage("neo_custom_category_icons", {});
  const [customIncomeCategories, setCustomIncomeCategories] = useLocalStorage("neo_custom_income_categories", []);
  const ALL_EXPENSE_CATEGORIES = [...EXPENSE_CATEGORIES, ...customCategories];
  const ALL_INCOME_CATEGORIES = [...INCOME_CATEGORIES, ...customIncomeCategories];
  const { todos, incrementPomodoro, toggleDone, updateTodo } = useTodos();
  const [categoryBudgets, setCategoryBudgets] = useLocalStorage("neo_categoryBudgets", {});
  const [balances, setBalances] = useLocalStorage("neo_balances", { bank: 0, upi: 0 });
  const [upcomingBills, setUpcomingBills] = useLocalStorage("neo_upcomingBills", []);

  useEffect(() => {
    // Migration to clear dummy bills for existing users
    if (upcomingBills.length === 3 && upcomingBills[0].name === "Netflix" && upcomingBills[1].name === "Electricity Bill" && upcomingBills[2].name === "Rent") {
      setUpcomingBills([]);
    }
    // Migration to clear dummy balances for existing users
    if (balances.bank === 14250.00 && balances.upi === 340.50) {
      setBalances({ bank: 0, upi: 0 });
    }
  }, []);
  // Timer States
  const [showDailyGoalModal, setShowDailyGoalModal] = useState(false);
  const [tempDailyGoal, setTempDailyGoal] = useState("");

  // Bank Details States
  const [banks, setBanks] = useLocalStorage("neo_banks", []);

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
    if (method === "UPI") {
      setBalances(prev => ({ ...prev, upi: (Number(prev.upi) || 0) + delta }));
    } else {
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
  

  const [bankFormState, setBankFormState] = useState({
    bankName: "", balance: "", accountType: "Savings", cardLast4: "", cardType: "Debit"
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
  const [newAmount, setNewAmount] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCurrency, setNewCurrency] = useState("");
  const [newExchangeRate, setNewExchangeRate] = useState("1");
  const [newCat, setNewCat] = useState("Food");
  const [newType, setNewType] = useState("expense");
  const getLocalToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const getLocalTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  const [newDate, setNewDate] = useState(getLocalToday());
  const [newTime, setNewTime] = useState(getLocalTime());
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [newMethod, setNewMethod] = useState("UPI");
  const [editingTxId, setEditingTxId] = useState(null);
  const [activeAccount, setActiveAccount] = useState("bank");
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [editCategory, setEditCategory] = useState("Food");
  const [editBudgetVal, setEditBudgetVal] = useState("");
  const [activeReminders, setActiveReminders] = useState([]);

  // Reminder Logic
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      todos.forEach(task => {
        if (!task.done && task.reminder && !task.reminderNotified) {
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
        }
      });
    }, 10000); // Check every 10 seconds for testing responsiveness

    return () => clearInterval(interval);
  }, [todos, updateTodo]);

  // Todo States

  // Insights States

  const [darkMode, setDarkMode] = useLocalStorage("neo_darkMode", false);
  const [baseCurrency, setBaseCurrency] = useLocalStorage("neo_baseCurrency", "INR");

  const searchIndex = [
    ...transactions.map(t => ({ type: "expense", icon: t.type === 'expense' ? ShoppingCart : Landmark, label: t.name, meta: `${formatCurrency(t.amount, baseCurrency)} · ${t.date}`, item: t })),
    ...todos.map(t => ({ type: "todo", icon: FileText, label: t.text, meta: `${t.priority} priority`, item: t })),
    ...history.map(h => ({ type: "session", icon: TimerIcon, label: h.note || h.type, meta: `${h.minutes}m · ${h.date}`, item: h }))
  ];

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
  const [apiKey, setApiKey] = useLocalStorage("neo_gemini_api_key", "");
  const [direction, setDirection] = useState(1);
  const [showInsights, setShowInsights] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const [syncState, setSyncState] = useState("synced"); // synced | syncing
  const [customCategoryRules, setCustomCategoryRules] = useLocalStorage("neo_custom_category_rules", []);
  
  // Statement Import State
  const [importReviewData, setImportReviewData] = useState(null);
  const [updateBankBalance, setUpdateBankBalance] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrorMsg, setImportErrorMsg] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [showImportConsent, setShowImportConsent] = useState(false);
  const [pendingImportFiles, setPendingImportFiles] = useState([]);
  const [showImportCelebration, setShowImportCelebration] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [lastImportSnapshot, setLastImportSnapshot] = useLocalStorage("neo_lastImportSnapshot", null);
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
        if (showSettings) { setShowSettings(false); return; }
        if (showKeyModal) { setShowKeyModal(false); return; }
        if (showInsights) { setShowInsights(false); return; }

        // If no modal is open, exit the app
        CapacitorApp.exitApp();
      });
    };
    initListener();

    return () => {
      if (listener) listener.remove();
    };
  }, [showForm, showBudgetModal, showBudgetDropdown, showBanksList, showCategoryDrawer, showNoteModal, showDailyGoalModal, showSettings, showKeyModal, showInsights]);

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
          <div style={{ overflow: "hidden" }}>
            {children}
          </div>
        </div>
      </div>
    );
  }, [theme]);

  const SectionLabel = useCallback(({ children, style }) => (
    <div style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12, ...fontDisplay, ...style }}>
      {children}
    </div>
  ), [theme]);

  const WheelPicker = useCallback(({ options, value, onChange, label, disabled = false, width = 60, fontSize = 24, formatOption }) => {
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
          } catch (err) { }
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
            width: width,
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
                fontSize: fontSize,
                fontWeight: 700,
                color: opt === value ? theme.textPrimary : theme.textSecondary,
                opacity: opt === value ? 1 : 0.3,
                transition: 'all 0.2s',
                ...fontDisplay
              }}
            >
              {formatOption ? formatOption(opt) : opt.toString().padStart(2, '0')}
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
          setStreak((s) => s + 1);
          if (linkedTodo) incrementPomodoro(linkedTodo);
          setShowNoteModal(true);
          setPomoPhase("Break");
          setHours(0); setMinutes(pomoCycle % 4 === 0 ? 15 : 5); setSeconds(0);
        } else {
          setPomoPhase("Focus");
          setPomoCycle((c) => c + 1);
          setHours(0); setMinutes(25); setSeconds(0);
        }
      } else {
        const sid = Date.now();
        setCurrentSessionId(sid);
        const lTodo = todos.find(t => t.id === linkedTodo);
        setHistory((h) => [
          { id: sid, name: name || autoTimerName(minutes), minutes, date: new Date().toISOString(), category: lTodo ? lTodo.category : 'Personal', note: "" },
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
      setIsRunning(willRun);

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

    return (
      <div style={{ padding: "18px 18px 100px" }}>
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

        <NeoSurface style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden", maxWidth: 460, margin: "0 auto" }}>

          <div style={{ width: "100%", position: "relative", zIndex: 1, marginBottom: 32 }}>
            <NeoInput
              placeholder={autoTimerName(minutes) + " (auto if left blank)"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ textAlign: "center", fontSize: 15, fontWeight: 600 }}
            />

            <button onClick={() => setShowTodoPicker((v) => !v)} style={{
              marginTop: 14, width: "100%", border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm,
              borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 8, color: linkedTodo ? theme.accent : theme.textSecondary, fontSize: 13, fontWeight: 600, ...fontBody, cursor: "pointer"
            }}>
              <Target size={16} />
              {linkedTodo ? `Focus on: ${todos.find(t => t.id === linkedTodo)?.text || 'Unknown Task'}` : "Link to a todo (optional)"}
              <ChevronDown size={16} style={{ marginLeft: "auto" }} />
            </button>
            {showTodoPicker && (
              <div style={{ position: "relative", zIndex: 2, width: "100%", marginTop: 8, display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto", padding: 4 }}>
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

          {!isRunning ? (
            <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: svgSize, gap: 16 }}>
              <WheelPicker
                options={Array.from({ length: 24 }, (_, i) => i)}
                value={hours}
                onChange={setHours}
                label="hours"
              />
              <WheelPicker
                options={Array.from({ length: 60 }, (_, i) => i)}
                value={minutes}
                onChange={setMinutes}
                label="min"
              />
              <WheelPicker
                options={Array.from({ length: 60 }, (_, i) => i)}
                value={seconds}
                onChange={setSeconds}
                label="sec"
              />
            </div>
          ) : (
            <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: 260, width: "100%" }}>
              <div style={{ width: 240, height: 240, borderRadius: "50%", background: theme.bg, boxShadow: theme.shadowRaised, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative" }}>
                <div style={{ position: "absolute", inset: 12, borderRadius: "50%", border: `4px solid ${theme.accent}33` }} />
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  <circle cx="120" cy="120" r="108" fill="none" stroke={theme.accent} strokeWidth="8" strokeLinecap="round" strokeDasharray="678" strokeDashoffset={678 - (remaining / (hours * 3600 + minutes * 60 + seconds || 1)) * 678} style={{ transition: "stroke-dashoffset 1s linear" }} />
                </svg>
                <div style={{ width: 200, height: 200, borderRadius: "50%", background: theme.bg, boxShadow: theme.shadowPressed, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 1 }}>
                  <span style={{ fontSize: 56, fontWeight: 800, color: theme.accent, ...fontDisplay, letterSpacing: -1, lineHeight: 1 }}>
                    {Math.floor((remaining % 3600) / 60).toString().padStart(2, '0')}:{(remaining % 60).toString().padStart(2, '0')}
                  </span>
                  {hours > 0 && <span style={{ fontSize: 16, color: theme.textSecondary, fontWeight: 600, marginTop: 4 }}>{Math.floor(remaining / 3600)} hr</span>}
                </div>
              </div>
            </div>
          )}

          {/* Ambience Integrated Section */}
          <div style={{ marginTop: 32, width: "100%", position: "relative", zIndex: 1 }}>
            <div style={{ color: theme.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 12, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>
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

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 24, position: "relative", zIndex: 1, width: "100%" }}>

            <div style={{ display: "flex", alignItems: "center", gap: 8, background: theme.bg, padding: "8px 12px", borderRadius: 20, boxShadow: theme.shadowPressed, flex: 1, maxWidth: 130 }}>
              <button onClick={() => setIsMuted(m => !m)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: theme.textSecondary }}>
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }} style={{ width: "100%", accentColor: theme.accent, height: 4 }} />
            </div>

            <button
              onClick={toggleTimer}
              style={{
                width: 72, height: 72, borderRadius: "50%", border: `2px solid ${darkMode ? "#2b2f3a" : "#d1d5db"}`,
                background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: theme.shadowRaisedSm, cursor: "pointer", transition: "all 0.2s",
                flexShrink: 0
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.accent}, #5a4fcf)`,
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.2)"
              }}>
                {isRunning ? <Pause size={22} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: 3 }} />}
              </div>
            </button>

            <div style={{ flex: 1, display: "flex", justifyContent: "flex-start", maxWidth: 130 }}>
              <button
                onClick={resetTimer}
                style={{
                  width: 52, height: 52, borderRadius: "50%", background: theme.bg, border: "none",
                  boxShadow: theme.shadowPressed, display: "flex", alignItems: "center", justifyContent: "center",
                  color: theme.textSecondary, cursor: "pointer"
                }}
              >
                <RotateCcw size={20} />
              </button>
            </div>

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

  /* ---------------------------------- MEDITATION TAB ---------------------------------- */

  const renderMeditationTab = () => {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <BreathingExercise theme={theme} darkMode={darkMode} />
      </div>
    );
  };

  /* ---------------------------------- EXPENSE TAB ---------------------------------- */

  const processImportFiles = async (files) => {
    setShowImportConsent(false);
    setIsImporting(true);
    setImportErrorMsg("");
    setToastMessage(`Processing ${files.length} file(s) into one batch...`);
    try {
      const ai = new GoogleGenAI({ apiKey });
      let combinedText = "";

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
          continue; // Skip unsupported silently in batch
        }
        combinedText += `\n--- STATEMENT DATA FROM ${file.name} ---\n${textContent}\n`;
      }

      if (!combinedText.trim()) {
         setToastMessage("No valid statement data found.");
         setIsImporting(false);
         return;
      }

      const prompt = `You are a financial statement parser.\nParse the following bank statement data into a strict JSON object.\nIMPORTANT: Extract EVERY SINGLE transaction. Do not omit, summarize, or skip any transactions, even if there are hundreds.\nIf there are multiple files, combine all their transactions into the single array.\nFormat: { "bankName": "Name of Bank", "closingBalance": 15000, "transactions": [{ "name": "Description", "amount": 100, "type": "expense" or "income", "date": "YYYY-MM-DD", "category": "Food/Transport/Etc" }] }\nData:\n${combinedText.slice(0, 150000)}`;
      
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const text = (typeof response.text === 'function' ? response.text() : response.text) || "";
      let jsonStr = text;
      const match = text.match(/\{.*\}/s);
      if (match) jsonStr = match[0];
      
      let allTxs = [];
      let latestClosingBalance = null;
      let aggregatedBankName = "";
      
      try {
        const parsed = JSON.parse(jsonStr);
        allTxs = Array.isArray(parsed) ? parsed : (parsed.transactions || []);
        if (parsed.bankName) aggregatedBankName = parsed.bankName;
        if (!isNaN(Number(parsed.closingBalance))) latestClosingBalance = Number(parsed.closingBalance);
      } catch (parseErr) {
        throw new Error("Could not parse AI response: " + parseErr.message);
      }
      
      // Strict Deduplication Check against EXISTING transactions
      const uniqueNewTxs = allTxs.filter(newTx => {
        const fallbackDate = new Date().toISOString().split('T')[0];
        const newDate = newTx.date || fallbackDate;
        const newType = String(newTx.type || "expense").toLowerCase().includes("income") ? "income" : "expense";
        const newAmount = Math.abs(Number(newTx.amount) || 0);
        
        const isDuplicate = transactions.some(existingTx => 
          existingTx.date === newDate &&
          existingTx.type === newType &&
          Math.abs(Number(existingTx.amount)) === newAmount
        );
        return !isDuplicate;
      });

      // Internal Deduplication Check (within the batch itself)
      const finalTxs = [];
      uniqueNewTxs.forEach(newTx => {
        const newDate = newTx.date || new Date().toISOString().split('T')[0];
        const newType = String(newTx.type || "expense").toLowerCase().includes("income") ? "income" : "expense";
        const newAmount = Math.abs(Number(newTx.amount) || 0);

        const alreadyInBatch = finalTxs.some(t => t.date === newDate && t.type === newType && t.amount === newAmount);
        if (!alreadyInBatch) finalTxs.push({ ...newTx, date: newDate, type: newType, amount: newAmount });
      });

      if (!finalTxs || finalTxs.length === 0) {
        setDuplicateWarning(true);
        setIsImporting(false);
        return;
      }

      const txs = finalTxs.map(t => {
        return {
          id: "imp_" + Date.now() + "_" + Math.random().toString(36).substring(7),
          name: t.name || t.description || "Imported Tx",
          desc: t.name || t.description || "Imported Tx",
          category: t.category || (t.type === "income" ? "Income" : "Other"),
          type: t.type,
          amount: t.amount,
          date: t.date,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
      });

      setImportReviewData({
        txs,
        bankName: aggregatedBankName,
        closingBalance: latestClosingBalance
      });
    } catch (err) {
      console.error("Import error:", err);
      const msg = "Import failed: " + (err.message || String(err));
      setToastMessage(msg);
      setImportErrorMsg(msg);
    } finally {
      setIsImporting(false);
    }
  };


  const renderExpenseTab = () => {


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
    
    if (filterStartDate) {
      dayFiltered = dayFiltered.filter(t => t.date >= filterStartDate);
    }
    if (filterEndDate) {
      dayFiltered = dayFiltered.filter(t => t.date <= filterEndDate);
    }

    if (!filterStartDate && !filterEndDate && selectedDate) {
      dayFiltered = dayFiltered.filter((t) => {
        const [y, m, d] = t.date.split("-");
        return y === targetYearStr && m === targetMonthStr && Number(d) === selectedDate;
      });
    }

    if (filterType !== "All") {
      dayFiltered = dayFiltered.filter(t => t.type === filterType.toLowerCase());
    }
    if (filterBank !== "All") {
      dayFiltered = dayFiltered.filter(t => String(t.method) === String(filterBank));
    }
    if (filterCategory !== "All") {
      dayFiltered = dayFiltered.filter(t => t.category === filterCategory);
    }

    // Sort descending by date
    dayFiltered.sort((a, b) => new Date(b.date) - new Date(a.date));

    const handleImportStatement = (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      e.target.value = '';
      if (!apiKey) {
        setShowKeyModal(true);
        setToastMessage("⚠️ Please set your Gemini API key first.");
        return;
      }
      setPendingImportFiles(files);
      setShowImportConsent(true);
    };


    const exportFilteredDataToCSV = () => {
      if (dayFiltered.length === 0) return;
      const headers = ["ID", "Date", "Time", "Type", "Category", "Amount", "Method", "Description"];
      const rows = dayFiltered.map(t => [
        t.id, t.date, t.time, t.type, t.category, t.amount, methodLabel(t.method), t.description || ""
      ]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const deleteTx = (id) => {
      const tx = transactions.find(t => t.id === id);
      if (tx) {
        const delta = tx.type === "expense" ? -tx.amount : tx.amount;
        updateBalanceForMethod(tx.method, -delta);
      }
      setTransactions((t) => t.filter((x) => x.id !== id));
    };

    // ponytail: swipe-left to reveal delete — no library, no abstraction
    const SwipeRow = ({ onDelete, children, style }) => {
      const [offset, setOffset] = React.useState(0);
      const startX = React.useRef(0);
      const dragging = React.useRef(false);
      const THRESHOLD = 60;
      const onTouchStart = (e) => { e.stopPropagation(); startX.current = e.touches[0].clientX; dragging.current = true; };
      const onTouchMove = (e) => {
        if (!dragging.current) return;
        e.stopPropagation();
        const dx = e.touches[0].clientX - startX.current;
        if (dx < 0) setOffset(Math.max(dx, -THRESHOLD));
      };
      const onTouchEnd = (e) => {
        e.stopPropagation();
        dragging.current = false;
        setOffset(o => o < -THRESHOLD / 2 ? -THRESHOLD : 0);
      };
      return (
        <div style={{ position: 'relative', ...style }}>
          {/* delete bg */}
          <div style={{ 
            position: 'absolute', 
            inset: 0,
            background: theme.danger, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end', 
            paddingRight: 22,
            borderRadius: 20,
            zIndex: 1,
            boxShadow: theme.shadowInset
          }}
            onClick={onDelete}>
            <Trash2 size={18} color="#fff" />
          </div>
          {/* sliding content */}
          <div
            style={{ position: 'relative', zIndex: 2, transform: `translateX(${offset}px)`, transition: dragging.current ? 'none' : 'transform .2s' }}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          >
            {children}
          </div>
        </div>
      );
    };

    const openEdit = (tx) => {
      setEditingTxId(tx.id);
      setNewType(tx.type);
      setNewAmount(tx.originalAmount ? tx.originalAmount.toString() : tx.amount.toString());
      setNewDesc(tx.name || tx.desc || "");
      setNewCat(tx.category || "Food");
      setNewMethod(tx.method || "UPI");
      setNewDate(tx.date === "Today" || !tx.date ? getLocalToday() : tx.date);
      setNewTime(tx.time || getLocalTime());
      setNewCurrency(tx.originalCurrency || "");
      setNewExchangeRate(tx.exchangeRate ? tx.exchangeRate.toString() : "1");
      setShowForm(true);
    };

    const closeForm = () => {
      setShowForm(false);
      setEditingTxId(null);
      setNewAmount("");
      setNewDesc("");
      setNewDate(getLocalToday());
      setNewTime(getLocalTime());
      setNewCurrency("");
      setNewExchangeRate("1");
    };

    const handleDescChange = (val) => {
      setNewDesc(val);
      const lower = val.toLowerCase();
      for (const [cat, keywords] of Object.entries(EXPENSE_KEYWORD_MAP)) {
        if (keywords.some(k => lower.includes(k))) {
          setNewCat(cat);
          break;
        }
      }
    };

    return (
      <div style={{ padding: "18px 18px 100px" }}>
        {showForm ? (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <NeoSurface style={{ padding: 16, width: "100%", maxWidth: 380, maxHeight: "95vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: theme.textPrimary, ...fontDisplay }}>{editingTxId ? "Edit transaction" : "Add transaction"}</div>
                <button onClick={closeForm} style={{ border: "none", background: "none", color: theme.textSecondary }}><X size={20} /></button>
              </div>

              <div style={{ display: "flex", gap: 8, background: theme.bg, padding: 4, borderRadius: 16, boxShadow: theme.shadowInset }}>
                <div onClick={() => setNewType("expense")} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: newType === "expense" ? theme.danger : theme.textSecondary, background: newType === "expense" ? theme.bg : "transparent", boxShadow: newType === "expense" ? theme.shadowRaisedSm : "none", transition: "all .2s", cursor: "pointer" }}>Expense</div>
                <div onClick={() => setNewType("income")} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: newType === "income" ? theme.success : theme.textSecondary, background: newType === "income" ? theme.bg : "transparent", boxShadow: newType === "income" ? theme.shadowRaisedSm : "none", transition: "all .2s", cursor: "pointer" }}>Income</div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 8, height: 44 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: theme.textPrimary, ...fontDisplay }}>{getCurrencyByCode(newCurrency || baseCurrency).symbol}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newAmount}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    if ((val.match(/\./g) || []).length <= 1) {
                      setNewAmount(val);
                    }
                  }}
                  placeholder="0"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 36,
                    fontWeight: 800,
                    color: theme.textPrimary,
                    width: `${Math.max(1.2, (newAmount || "").toString().length)}ch`,
                    textAlign: "center",
                    padding: 0,
                    ...fontDisplay
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: theme.accent, flexShrink: 0 }}>
                  <Calendar size={18} />
                </div>
                {/* ponytail: min change, flex row for side-by-side pickers */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}><NeoDatePicker value={newDate} onChange={setNewDate} /></div>
                  <div style={{ width: 1, height: 24, background: theme.border, opacity: 0.5 }} />
                  <div style={{ flex: 1 }}><TimePicker value={newTime} onChange={setNewTime} theme={theme} fontBody={fontBody} alignRight openDown /></div>
                </div>
              </div>
              
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>PAYMENT METHOD</div>
              {/* ponytail: replaced native select with NeoSelect for neomorphism */}
              <NeoSelect
                value={newMethod}
                onChange={setNewMethod}
                options={[
                  { value: "UPI", label: "UPI" },
                  ...banks.map(b => ({ value: b.id, label: b.bankName }))
                ]}
                theme={theme}
                fontBody={fontBody}
              />

              <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>DESCRIPTION</div>
              <NeoInput placeholder="Description (e.g., Starbucks, Uber)" value={newDesc} onChange={e => handleDescChange(e.target.value)} />

              <div style={{ marginTop: 24, marginBottom: 24 }}>
                <CollapsibleSection
                  title="CATEGORY"
                  defaultOpen={false}
                  extraHeader={
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: theme.accent, fontSize: 12, fontWeight: 700 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {TX_CATEGORY_ICONS[newCat] || (customCategoryIcons[newCat] ? RENDER_CUSTOM_ICON(customCategoryIcons[newCat], 14) : <Box size={14} />)}
                      </div>
                      {newCat}
                    </div>
                  }
                >
                  {/* ponytail: min change, grid 4 columns, smaller padding */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 12 }}>
                    {(newType === "expense" ? ALL_EXPENSE_CATEGORIES : ALL_INCOME_CATEGORIES).map(c => (
                      <div
                        key={c}
                        onClick={() => setNewCat(c)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          cursor: "pointer",
                          padding: "10px 4px",
                          borderRadius: 12,
                          background: newCat === c ? theme.accent : theme.bg,
                          boxShadow: newCat === c ? theme.shadowInset : theme.shadowRaisedSm,
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 2 }}>
                          {TX_CATEGORY_ICONS[c] || (customCategoryIcons[c] ? RENDER_CUSTOM_ICON(customCategoryIcons[c], 16) : <Box size={16} />)}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, ...fontBody, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", color: newCat === c ? "#fff" : theme.textSecondary }}>
                          {c}
                        </div>
                      </div>
                    ))}
                    
                    {newType === "expense" && (
                      <div
                        onClick={() => setShowCategoryForm(true)}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                          cursor: "pointer", padding: "10px 4px", borderRadius: 12, background: theme.bg, boxShadow: theme.shadowRaisedSm, transition: "all 0.2s"
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 2, color: theme.textSecondary }}><Plus size={18} /></div>
                        <div style={{ fontSize: 10, fontWeight: 700, ...fontBody, textAlign: "center", color: theme.textSecondary }}>Add New</div>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              </div>

              <PrimaryButton label={editingTxId ? "Save Changes" : "Add transaction"} icon={<Check size={18} />} onClick={() => {
                if (newAmount) {
                  const origAmount = parseFloat(newAmount) || 0;
                  const rate = parseFloat(newExchangeRate) || 1;
                  const finalAmount = origAmount * rate;
                  const newDelta = newType === "expense" ? -finalAmount : finalAmount;

                  if (editingTxId) {
                    const oldTx = transactions.find(t => t.id === editingTxId);
                    if (oldTx) {
                      const oldDelta = oldTx.type === "expense" ? -oldTx.amount : oldTx.amount;
                      updateBalanceForMethod(oldTx.method, -oldDelta);
                    }
                  }
                  
                  updateBalanceForMethod(newMethod, newDelta);

                  const updatedTx = {
                    id: editingTxId || Date.now(),
                    type: newType,
                    amount: finalAmount,
                    originalAmount: origAmount,
                    originalCurrency: newCurrency || baseCurrency,
                    exchangeRate: rate,
                    name: newDesc || (newType === "expense" ? "Expense" : "Income"),
                    desc: newDesc || (newType === "expense" ? "Expense" : "Income"),
                    category: newCat,
                    method: newMethod,
                    date: newDate || "Today",
                    time: newTime || "",
                  };
                  if (editingTxId) {
                    setTransactions(t => t.map(x => x.id === editingTxId ? updatedTx : x));
                  } else {
                    setTransactions(t => [updatedTx, ...t]);
                  }
                  closeForm();
                }
              }} style={{ marginTop: 4, padding: "12px" }} />
            </NeoSurface>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24, marginTop: 8 }}>
            </div>

            <NeoSurface style={{ padding: 20, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div>
                <div style={{ fontSize: 13, color: theme.textSecondary, fontWeight: 600 }}>{netSavings > 0 ? "Savings this month" : "Net Cashflow"}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 700, ...fontDisplay }}>
                    {netSavings > 0 ? "+" : netSavings < 0 ? "-" : ""}{formatCurrency(Math.abs(netSavings), baseCurrency)}
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: theme.textSecondary }}>Income: <span style={{ color: theme.success, fontWeight: 600 }}>{formatCurrency(incomeThisMonth, baseCurrency)}</span></div>
                  <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>Spent: <span style={{ color: theme.danger, fontWeight: 600 }}>{formatCurrency(spentThisMonth, baseCurrency)}</span></div>
                </div>
              </div>

              {pieData.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <PieChart width={80} height={80}>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={35} stroke="none" paddingAngle={5}>
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                  </PieChart>
                </div>
              )}
              {pieData.length === 0 && (
                <div style={{ color: theme.textSecondary, fontSize: 12 }}>No Data</div>
              )}
            </NeoSurface>

            {categoryPieData.length > 0 ? (
              <NeoSurface style={{ padding: 20, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                  <div style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 700, ...fontDisplay }}>Expenses by Category</div>
                  <NeoSelect
                    value={activeCategoryPie ? activeCategoryPie.name : "All"}
                    onChange={(val) => {
                      if (val === "All") setActiveCategoryPie(null);
                      else {
                        const found = categoryPieData.find(c => c.name === val);
                        if (found) setActiveCategoryPie(found);
                      }
                    }}
                    options={[
                      { label: "All Categories", value: "All" },
                      ...categoryPieData.map(c => ({ label: c.name, value: c.name }))
                    ]}
                    theme={theme}
                    fontBody={fontBody}
                    style={{ width: 140, marginBottom: 0 }}
                  />
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 220 }}>
                  <PieChart width={220} height={220}>
                    <Pie 
                      data={categoryPieData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={65} 
                      outerRadius={100} 
                      stroke="none" 
                      paddingAngle={2}
                      onMouseEnter={(data) => setActiveCategoryPie(data.payload || data)}
                      onMouseLeave={() => setActiveCategoryPie(null)}
                      onClick={(data) => setActiveCategoryPie(data.payload || data)}
                    >
                      {categoryPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                  </PieChart>
                  
                  {/* Center Text (Interactive) */}
                  <div style={{ position: 'absolute', pointerEvents: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 110, height: 110, borderRadius: '50%' }}>
                    {activeCategoryPie ? (
                      <>
                        <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 700, ...fontBody, lineHeight: 1.2, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "90%" }}>
                          {activeCategoryPie.name}
                        </div>
                        <div style={{ color: activeCategoryPie.fill, fontSize: 16, fontWeight: 800, ...fontDisplay }}>
                          {formatCurrency(activeCategoryPie.value, baseCurrency)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 700, ...fontBody, lineHeight: 1.2, marginBottom: 2 }}>
                          Total
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: 16, fontWeight: 800, ...fontDisplay }}>
                          {formatCurrency(categoryPieData.reduce((sum, item) => sum + item.value, 0), baseCurrency)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </NeoSurface>
            ) : (
              <NeoSurface style={{ padding: 20, marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
                <div style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 700, ...fontDisplay, marginBottom: 16, alignSelf: 'flex-start' }}>Expenses by Category</div>
                <div style={{ color: theme.textSecondary, fontSize: 13, ...fontBody, padding: 40, textAlign: 'center' }}>
                  No expenses recorded in {new Date(targetYearStr, targetMonthStr - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}.
                </div>
              </NeoSurface>
            )}

            <div onTouchStart={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {/* Bank card — icon opens bank list, total = sum of all bank balances */}
              {(() => {
                const bankTotal = banks.reduce((s, b) => s + (parseFloat(b.balance) || 0), 0);
                return (
                  <NeoSurface onClick={() => { setActiveAccount("bank"); setShowBanksList(true); }} pressed={activeAccount === "bank"} style={{ minWidth: 145, flex: 1, padding: "20px", cursor: "pointer", borderRadius: 20, position: "relative" }}>
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: "50%", background: theme.bg,
                        boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 16, color: theme.accent
                      }}
                    >
                      <Landmark size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, ...fontBody }}>Bank</div>
                      <div style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 700, ...fontDisplay }}>{formatCurrency(bankTotal, baseCurrency)}</div>
                      {banks.length > 0 && <div style={{ color: theme.textSecondary, fontSize: 10, marginTop: 2, ...fontBody }}>{banks.length} account{banks.length !== 1 ? "s" : ""}</div>}
                    </div>
                  </NeoSurface>
                );
              })()}

              {/* UPI card — icon opens edit-balance modal */}
              <NeoSurface
                onClick={(e) => {
                  const acc = { id: "upi", label: "UPI", icon: Smartphone, balance: balances.upi };
                  if (e.target.closest('.edit-btn')) {
                    handleEditBalance(acc);
                  } else {
                      setActiveAccount("upi"); 
                      setEditingBalanceAcc(acc);
                      setTempBalance(acc.balance.toString());
                      setShowEditBalanceModal(true);
                  }
                }} pressed={activeAccount === "upi"} style={{ minWidth: 145, flex: 1, padding: "20px", cursor: "pointer", borderRadius: 20, position: "relative" }}>
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: "50%", background: theme.bg,
                        boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 16, color: theme.accent
                      }}
                    >
                      <Smartphone size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, ...fontBody }}>UPI</div>
                      <div style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 700, ...fontDisplay }}>{formatCurrency(balances.upi || 0, baseCurrency)}</div>
                    </div>
                  </NeoSurface>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 32 }}>
              <div>
                <div style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4, ...fontBody }}>Spent this month</div>
                <div style={{ color: theme.textPrimary, fontSize: 32, fontWeight: 800, letterSpacing: -0.5, ...fontDisplay }}>
                  {formatCurrency(spentThisMonth, baseCurrency)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <NeoSurface style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 16, cursor: isImporting ? "wait" : "pointer", color: theme.accent, overflow: "hidden" }}>
                  {!isImporting && <input type="file" accept=".csv,.txt,.xls,.xlsx" multiple onChange={handleImportStatement} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 10 }} title="Import Statement" />}
                  {isImporting ? (
                    <div style={{ position: "relative", zIndex: 1, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", overflow: "hidden" }}>
                      <Strands
                        colors={["#F97316","#7C3AED","#06B6D4"]}
                        count={4}
                        speed={1.7}
                        amplitude={2.1}
                        waviness={1.6}
                        thickness={0.7}
                        glow={2.6}
                        taper={3}
                        spread={1}
                        intensity={0.7}
                        saturation={1.5}
                        opacity={1}
                        scale={1.3}
                        glass
                        refraction={1.35}
                        dispersion={1}
                        glassSize={1}
                        hueShift={0.26}
                      />
                    </div>
                  ) : (
                    <Upload size={18} strokeWidth={2.5} style={{ position: "relative", zIndex: 1 }} />
                  )}
                </NeoSurface>
                <PrimaryButton icon={<Plus size={16} strokeWidth={2.5} />} label="New" onClick={() => setShowForm(true)} style={{ padding: "12px 24px", borderRadius: 16, fontSize: 15 }} />
              </div>
            </div>

            {importErrorMsg && (
              <div style={{ margin: "0 0 16px", padding: "12px 16px", borderRadius: 12, background: "#ff3b3022", border: "1px solid #ff3b30", color: theme.danger, fontSize: 13, ...fontBody }}>
                ⚠️ {importErrorMsg}
                <button onClick={() => setImportErrorMsg("")} style={{ float: "right", background: "none", border: "none", color: theme.danger, cursor: "pointer", fontWeight: 700 }}>✕</button>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <SectionLabel style={{ margin: 0, textTransform: "uppercase", fontSize: 13, letterSpacing: 0.5 }}>Category budgets</SectionLabel>
              <button onClick={() => setShowBudgetModal(true)} style={{ border: "none", background: "none", color: theme.accent, fontSize: 13, cursor: "pointer", fontWeight: 600, ...fontBody }}>Edit</button>
            </div>
            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 24, background: theme.bg, borderRadius: 24, boxShadow: theme.shadowPressed, marginBottom: 32 }}>
              {BUDGETS.length === 0 ? (
                <div style={{ textAlign: "center", color: theme.textSecondary, fontSize: 13, ...fontBody }}>
                  No budgets set yet.
                  <br />
                  <button onClick={() => setShowBudgetModal(true)} style={{ marginTop: 12, padding: "8px 16px", background: theme.accent, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", ...fontBody }}>Set a budget</button>
                </div>
              ) : (
                BUDGETS.map((b) => {
                  const spent = spentByCategory[b.category] || 0;
                  const pct = b.budget > 0 ? Math.min(100, (spent / b.budget) * 100) : 0;
                  const over = b.budget > 0 && spent > b.budget;
                  return (
                    <div key={b.category}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ color: theme.textPrimary, fontSize: 15, fontWeight: 600, ...fontBody }}>{b.category}</span>
                        <span style={{ color: over ? theme.danger : theme.textSecondary, fontSize: 15, fontWeight: 600, ...fontBody }}>
                          {formatCurrency(spent, baseCurrency)} / {formatCurrency(b.budget, baseCurrency)}
                        </span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: theme.bg, boxShadow: theme.shadowPressed, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: over ? theme.danger : b.color, transition: "width .3s" }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <CollapsibleSection title="Recent transactions" defaultOpen={true}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {transactions.slice(0, 4).map((t) => {
                  const isExp = t.type === "expense";
                  return (
                    <SwipeRow key={t.id} onDelete={() => deleteTx(t.id)}>
                      <NeoSurface onClick={() => openEdit(t)} style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, borderRadius: 20, cursor: "pointer" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: isExp ? `${theme.danger}15` : `${theme.success}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                          {TX_CATEGORY_ICONS[t.category] || (customCategoryIcons[t.category] ? RENDER_CUSTOM_ICON(customCategoryIcons[t.category], 18) : <Box size={18} />)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <div style={{ color: theme.textPrimary, fontSize: 14, fontWeight: 700, ...fontBody }}>{t.category}</div>
                            <BankBadge tx={t} />
                          </div>
                          <div style={{ color: theme.textSecondary, fontSize: 11, ...fontBody }}>{t.desc} • {t.date}</div>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: isExp ? theme.danger : theme.success, ...fontBody }}>
                          {isExp ? "-" : "+"}{formatCurrency(t.amount, baseCurrency)}
                        </span>
                      </NeoSurface>
                    </SwipeRow>
                  );
                })}
              </div>
            </CollapsibleSection>

            <CollapsibleSection 
              title="Upcoming Bills" 
              defaultOpen={true}
              extraHeader={
                <div style={{ display: "flex", flex: 1, justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 500 }}>Burn Rate: <span style={{ color: theme.danger, fontWeight: 700 }}>{formatCurrency(monthlyBurnRate, baseCurrency)}</span></div>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setEditingBill(null);
                    setBillFormState({ name: "", amount: "", daysLeft: "" });
                    setShowBillModal(true);
                  }} style={{ border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm, padding: "6px 12px", borderRadius: 12, color: theme.textPrimary, fontSize: 13, fontWeight: 700, cursor: "pointer", ...fontBody }}>+ Add</button>
                </div>
              }
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upcomingBills.map((b) => {
                  const now = new Date();
                  const currentDay = now.getDate();
                  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

                  let targetDay = Math.min(b.daysLeft, daysInCurrentMonth);
                  let daysUntilDue = targetDay - currentDay;

                  if (daysUntilDue < 0) {
                    const daysInNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate();
                    const nextTargetDay = Math.min(b.daysLeft, daysInNextMonth);
                    daysUntilDue = (daysInCurrentMonth - currentDay) + nextTargetDay;
                  }
                  const getOrdinal = (n) => {
                    const s = ["th", "st", "nd", "rd"];
                    const v = n % 100;
                    return n + (s[(v - 20) % 10] || s[v] || s[0]);
                  };

                  return (
                    <SwipeRow key={b.id} onDelete={() => setUpcomingBills(bills => bills.filter(x => x.id !== b.id))}>
                      <NeoSurface onClick={() => {
                            setEditingBill(b);
                            setBillFormState({ name: b.name, amount: b.amount.toString(), daysLeft: b.daysLeft.toString() });
                            setShowBillModal(true);
                          }} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, borderRadius: 20, cursor: "pointer" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: daysUntilDue <= 3 ? theme.danger : theme.accent }}>
                          <Bell size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 13.5, ...fontBody }}>{b.name}</div>
                          <div style={{ color: theme.textSecondary, fontSize: 11, ...fontBody }}>Due on the {getOrdinal(b.daysLeft)} • {daysUntilDue} day{daysUntilDue !== 1 ? "s" : ""} left</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13.5, ...fontDisplay }}>{formatCurrency(b.amount, baseCurrency)}</div>
                        </div>
                      </NeoSurface>
                    </SwipeRow>
                  );
                })}
              </div>
            </CollapsibleSection>

            <CollapsibleSection 
              title={
                filterStartDate || filterEndDate 
                  ? `From ${filterStartDate || '...'} to ${filterEndDate || '...'}`
                  : selectedDate 
                    ? `On ${selectedDate} ${monthLabel}` 
                    : "All transactions"
              }
              defaultOpen={false}
              extraHeader={(isOpen) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                  {isOpen && (
                    <button onClick={(e) => { e.stopPropagation(); setShowCalendarWidget(!showCalendarWidget); }} style={{ width: 28, height: 28, borderRadius: 8, background: showCalendarWidget ? theme.accent : theme.bg, border: "none", boxShadow: showCalendarWidget ? theme.shadowInset : theme.shadowRaisedSm, color: showCalendarWidget ? "#fff" : theme.accent, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} title="Toggle Calendar">
                      <Calendar size={14} />
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); exportFilteredDataToCSV(); }} style={{ width: 28, height: 28, borderRadius: 8, background: theme.bg, border: "none", boxShadow: theme.shadowRaisedSm, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Export as CSV">
                    <Download size={14} />
                  </button>
                </div>
              )}
            >

              {showCalendarWidget && (
                <NeoSurface style={{ padding: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <IconBtn size={32} icon={<ChevronLeft size={15} />} onClick={() => setMonthOffset((m) => m - 1)} />
                    <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13.5, ...fontDisplay }}>{monthLabel}</div>
                    <IconBtn size={32} icon={<ChevronRight size={15} />} onClick={() => setMonthOffset((m) => m + 1)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <div key={i} style={{ textAlign: "center", fontSize: 10, color: theme.textSecondary, ...fontBody }}>{d}</div>
                    ))}
                    {Array.from({ length: 3 }).map((_, i) => <div key={"pad" + i} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const has = txByDay[day] || [];
                      const isSelected = selectedDate === day;

                      const dailyExpense = has.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                      const isPastOrPresent = monthOffset < 0 || (monthOffset === 0 && day <= now.getDate());

                      let textColor = theme.textPrimary;
                      if (isPastOrPresent) {
                        if (dailyExpense === 0) textColor = theme.success;
                        else if (dailyExpense > 0) textColor = theme.danger;
                      }

                      return (
                        <button key={day} onClick={() => setSelectedDate(isSelected ? null : day)} style={{
                          aspectRatio: "1", borderRadius: 10, border: "none", background: theme.bg,
                          boxShadow: isSelected ? theme.shadowPressed : theme.shadowRaisedSm,
                          color: isSelected ? theme.accent : textColor, fontSize: 15, fontWeight: 700, position: "relative", ...fontBody,
                          opacity: isPastOrPresent ? 1 : 0.5
                        }}>
                          {day}
                          {dailyExpense > 0 && <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: theme.danger }} />}
                        </button>
                      );
                    })}
                  </div>
                </NeoSurface>
              )}
              
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ flexShrink: 0, padding: "6px 8px", borderRadius: 10, background: theme.bg, color: theme.textPrimary, border: "none", boxShadow: theme.shadowInset, fontSize: 11, fontWeight: 600, outline: "none", ...fontBody }}>
                  <option value="All">All Types</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
                <select value={filterBank} onChange={e => setFilterBank(e.target.value)} style={{ flexShrink: 0, padding: "6px 8px", borderRadius: 10, background: theme.bg, color: theme.textPrimary, border: "none", boxShadow: theme.shadowInset, fontSize: 11, fontWeight: 600, outline: "none", ...fontBody }}>
                  <option value="All">All Banks</option>
                  <option value="UPI">UPI</option>
                  {banks.map(b => <option key={b.id} value={b.id}>{b.bankName.substring(0, 10)}</option>)}
                </select>
                <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setVisibleTxCount(20); }} style={{ flexShrink: 0, padding: "6px 8px", borderRadius: 10, background: theme.bg, color: theme.textPrimary, border: "none", boxShadow: theme.shadowInset, fontSize: 11, fontWeight: 600, outline: "none", ...fontBody }}>
                  <option value="All">All Categories</option>
                  {[...new Set(transactions.map(t => t.category))].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <NeoDatePicker value={filterStartDate} onChange={setFilterStartDate} placeholder="From" style={{ height: 28, fontSize: 10, padding: "4px 8px", minWidth: 70 }} wrapperStyle={{ flex: "1 1 70px" }} />
                <NeoDatePicker value={filterEndDate} onChange={setFilterEndDate} placeholder="To" style={{ height: 28, fontSize: 10, padding: "4px 8px", minWidth: 70 }} wrapperStyle={{ flex: "1 1 70px" }} />
              </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(() => {
                  const displayedTxs = dayFiltered.slice(0, visibleTxCount);
                  const grouped = {};
                  displayedTxs.forEach(t => {
                    const mKey = t.date.substring(0, 7);
                    if (!grouped[mKey]) grouped[mKey] = { total: 0, txs: [] };
                    grouped[mKey].txs.push(t);
                    grouped[mKey].total += (t.type === "income" ? t.amount : -t.amount);
                  });
                  const sortedMonths = Object.keys(grouped).sort((a,b) => b.localeCompare(a));

                  return sortedMonths.map(monthKey => {
                    const monthData = grouped[monthKey];
                    const [y, m] = monthKey.split("-");
                    const dateObj = new Date(y, m - 1);
                    const monthLabel = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                    
                    let lastDate = "";
                    return (
                      <div key={monthKey} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "0 4px" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: theme.textPrimary, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            {monthLabel}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: monthData.total >= 0 ? theme.success : theme.danger }}>
                            {monthData.total >= 0 ? "+" : "-"}{formatCurrency(Math.abs(monthData.total), baseCurrency)}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {monthData.txs.map((t) => {
                            const showDate = t.date !== lastDate;
                            lastDate = t.date;
                            return (
                              <div key={t.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {showDate && (
                                  <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: 1, paddingLeft: 4 }}>
                                    {new Date(t.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                  </div>
                                )}
                                <SwipeRow onDelete={() => deleteTx(t.id)}>
                                  <NeoSurface onClick={() => openEdit(t)} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, borderRadius: 20, cursor: "pointer" }}>
                                    <div style={{
                                      width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: theme.bg,
                                      boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center",
                                      fontSize: 16
                                    }}>
                                      {TX_CATEGORY_ICONS[t.category] || (customCategoryIcons[t.category] ? RENDER_CUSTOM_ICON(customCategoryIcons[t.category], 16) : <Box size={16} />)}
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 13.5, ...fontBody }}>{t.category}</span>
                                        <BankBadge tx={t} />
                                        {t.recurring && <Repeat size={12} color={theme.textSecondary} />}
                                        {t.split && <Split size={12} color={theme.accent} />}
                                      </div>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.textSecondary, fontSize: 11, ...fontBody }}>
                                        <span>{t.name}</span>

                                        {t.originalCurrency && t.originalCurrency !== baseCurrency && (
                                          <span style={{ color: theme.textSecondary }}>· {formatCurrency(t.originalAmount, t.originalCurrency)}</span>
                                        )}
                                        {t.split && <span style={{ color: theme.accent }}>· split with {t.splitWith}</span>}
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ fontSize: 14, fontWeight: 700, color: t.type === "income" ? theme.success : theme.danger, ...fontBody }}>
                                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, baseCurrency)}
                                      </span>
                                    </div>
                                  </NeoSurface>
                                </SwipeRow>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
                {dayFiltered.length > visibleTxCount && (
                  <PrimaryButton label="Load More" onClick={() => setVisibleTxCount(prev => prev + 20)} style={{ marginTop: 8, padding: "12px 0", borderRadius: 14, fontSize: 14 }} />
                )}
              </div>
            </CollapsibleSection>

            {showBudgetModal && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
                <NeoSurface style={{ padding: 20, width: "100%", maxWidth: 320 }}>
                  <div style={{ color: theme.textPrimary, fontSize: 16, fontWeight: 700, marginBottom: 16, ...fontDisplay }}>Set Budgets</div>
                  <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
                    {Object.keys(categoryBudgets).filter(c => categoryBudgets[c] > 0).map(cat => (
                      <div key={cat} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, ...fontBody }}>{cat}</div>
                          <NeoInput type="number" placeholder="Amount" value={categoryBudgets[cat] || ""} onChange={(e) => setCategoryBudgets(prev => ({ ...prev, [cat]: Number(e.target.value) || 0 }))} />
                        </div>
                        <button onClick={() => setCategoryBudgets(prev => ({ ...prev, [cat]: 0 }))} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", padding: 8 }}><Trash2 size={16} /></button>
                      </div>
                    ))}

                    {EXPENSE_CATEGORIES.filter(c => !(categoryBudgets[c] > 0)).length > 0 && (
                      <div style={{ marginTop: 16, position: "relative" }}>
                        <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, ...fontBody }}>Add Category Budget</div>
                        <button
                          onClick={() => setShowBudgetDropdown(!showBudgetDropdown)}
                          style={{
                            width: "100%", padding: "12px 14px", borderRadius: 14,
                            border: "none", background: theme.bg, color: theme.textPrimary,
                            boxShadow: theme.shadowInset, fontSize: 14, outline: "none",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            cursor: "pointer",
                            ...fontBody
                          }}
                        >
                          <span>Select category...</span>
                          <ChevronDown size={16} color={theme.textSecondary} />
                        </button>
                        {showBudgetDropdown && (
                          <div style={{
                            marginTop: 8,
                            background: theme.bg, borderRadius: 14, boxShadow: theme.shadowInset,
                            maxHeight: 200, overflowY: "auto", padding: 8
                          }}>
                            {EXPENSE_CATEGORIES.filter(c => !(categoryBudgets[c] > 0)).map(cat => (
                              <button
                                key={cat}
                                onClick={() => {
                                  setCategoryBudgets(prev => ({ ...prev, [cat]: 1000 }));
                                  setShowBudgetDropdown(false);
                                }}
                                style={{
                                  width: "100%", padding: "10px", background: "transparent", border: "none",
                                  textAlign: "left", color: theme.textPrimary, fontSize: 14, display: "flex", alignItems: "center", gap: 10,
                                  borderRadius: 8, cursor: "pointer", ...fontBody
                                }}
                              >
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: theme.accent + "1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                                  {TX_CATEGORY_ICONS[cat] || (customCategoryIcons[cat] ? RENDER_CUSTOM_ICON(customCategoryIcons[cat], 14) : <Box size={14} />)}
                                </div>
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                    <button onClick={() => setShowBudgetModal(false)} style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", ...fontBody }}>Done</button>
                  </div>
                </NeoSurface>
              </div>
            )}

            {showBanksList && (
              <div style={{ position: "fixed", inset: 0, background: theme.bg, zIndex: 60, padding: "20px 20px 100px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                  <button onClick={() => setShowBanksList(false)} style={{ border: "none", background: "none", color: theme.textPrimary, cursor: "pointer" }}><ChevronLeft size={24} /></button>
                  <div style={{ fontSize: 20, fontWeight: 800, color: theme.textPrimary, ...fontDisplay }}>My Banks</div>
                </div>

                {/* Total across all banks */}
                {banks.length > 0 && (
                  <NeoSurface style={{ padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ color: theme.textSecondary, fontSize: 12, fontWeight: 700, ...fontBody }}>TOTAL BALANCE</div>
                    <div style={{ color: theme.textPrimary, fontSize: 22, fontWeight: 800, ...fontDisplay }}>
                      {formatCurrency(banks.reduce((s, b) => s + (parseFloat(b.balance) || 0), 0), baseCurrency)}
                    </div>
                  </NeoSurface>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  {banks.length === 0 ? (
                    <div style={{ color: theme.textSecondary, fontSize: 14, textAlign: "center", marginTop: 40, ...fontBody }}>No banks added yet. Tap + to add one.</div>
                  ) : banks.map(bank => (
                    <SwipeRow key={bank.id} onDelete={() => setBanks(prev => prev.filter(b => b.id !== bank.id))}>
                      <NeoSurface onClick={() => {
                        setEditingBankId(bank.id);
                        setBankFormState(bank);
                        setShowBankForm(true);
                      }} style={{ padding: 16, cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>{bank.bankName}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: theme.accent, marginTop: 2, ...fontDisplay }}>
                              {formatCurrency(parseFloat(bank.balance) || 0, baseCurrency)}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {bank.accountType && <div style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: theme.bg, boxShadow: theme.shadowRaisedSm, color: theme.textSecondary, ...fontBody }}>{bank.accountType}</div>}
                          {bank.cardType && <div style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: theme.bg, boxShadow: theme.shadowRaisedSm, color: theme.textSecondary, ...fontBody }}>{bank.cardType} Card</div>}
                          {bank.cardLast4 && <div style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: theme.bg, boxShadow: theme.shadowRaisedSm, color: theme.textSecondary, ...fontBody }}>•••• {bank.cardLast4}</div>}
                        </div>
                      </NeoSurface>
                    </SwipeRow>
                  ))}
                </div>

                {/* Disclaimer */}
                <div style={{ margin: "20px 0 8px", padding: "10px 14px", borderRadius: 12, background: theme.bg, boxShadow: theme.shadowInset, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 16 }}>🔒</div>
                  <div style={{ color: theme.textSecondary, fontSize: 11, lineHeight: 1.5, ...fontBody }}>All data is stored locally on your device only. Nothing is transmitted to any server.</div>
                </div>

                <div style={{ position: "fixed", bottom: 20, left: 20, right: 20, zIndex: 61 }}>
                  <PrimaryButton icon={<Plus size={20} />} label="Add Bank" onClick={() => {
                    setEditingBankId(null);
                    setBankFormState({ bankName: "", balance: "", accountType: "Savings", cardLast4: "", cardType: "Debit" });
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
                  <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: -8, ...fontBody }}>Select Preset (Optional)</div>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none", alignItems: "center" }}>
                    {PRESET_BANKS.map(p => (
                      <div 
                        key={p.name} 
                        onClick={() => setBankFormState({ ...bankFormState, bankName: p.name + " Bank" })}
                        style={{
                          padding: "8px 12px", borderRadius: 12, background: p.color + "15", color: p.color,
                          fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", cursor: "pointer",
                          border: bankFormState.bankName.includes(p.name) ? `2px solid ${p.color}` : "2px solid transparent",
                          ...fontBody
                        }}
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>
                  
                  <NeoInput placeholder="Bank Name (e.g. HDFC Bank)" value={bankFormState.bankName} onChange={e => setBankFormState({ ...bankFormState, bankName: e.target.value })} />
                  <NeoInput placeholder="Current Balance" type="number" value={bankFormState.balance} onChange={e => setBankFormState({ ...bankFormState, balance: e.target.value })} />

                  <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: -8, ...fontBody }}>Account Type</div>
                  <div style={{ display: "flex", gap: 8, background: theme.bg, padding: 4, borderRadius: 16, boxShadow: theme.shadowInset }}>
                    {["Savings", "Current"].map(t => (
                      <div key={t} onClick={() => setBankFormState({ ...bankFormState, accountType: t })} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", color: bankFormState.accountType === t ? theme.accent : theme.textSecondary, background: bankFormState.accountType === t ? theme.bg : "transparent", boxShadow: bankFormState.accountType === t ? theme.shadowRaisedSm : "none", transition: "all .2s" }}>{t}</div>
                    ))}
                  </div>

                  <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: -8, ...fontBody }}>Card Type</div>
                  <div style={{ display: "flex", gap: 8, background: theme.bg, padding: 4, borderRadius: 16, boxShadow: theme.shadowInset }}>
                    {["Debit", "Credit"].map(t => (
                      <div key={t} onClick={() => setBankFormState({ ...bankFormState, cardType: t })} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", color: bankFormState.cardType === t ? theme.accent : theme.textSecondary, background: bankFormState.cardType === t ? theme.bg : "transparent", boxShadow: bankFormState.cardType === t ? theme.shadowRaisedSm : "none", transition: "all .2s" }}>{t}</div>
                    ))}
                  </div>

                  <NeoInput placeholder="Card last 4 digits" type="number" maxLength={4} value={bankFormState.cardLast4} onChange={e => setBankFormState({ ...bankFormState, cardLast4: e.target.value.slice(0, 4) })} />
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

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, ...fontBody }}>Amount ({getCurrencyByCode(baseCurrency).symbol})</div>
                <NeoInput type="number" placeholder="0" value={billFormState.amount} onChange={e => setBillFormState(s => ({ ...s, amount: e.target.value }))} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, ...fontBody }}>Recurring Date (1-31)</div>
                <NeoInput type="number" placeholder="e.g. 15" min="1" max="31" value={billFormState.daysLeft} onChange={(e) => setBillFormState({ ...billFormState, daysLeft: e.target.value })} />
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
            {/* Profile Section */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm, marginBottom: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                <User size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Abhijit Birle</div>
                <div style={{ fontSize: 13, color: theme.textSecondary, ...fontBody }}>Local User Profile</div>
              </div>
            </div>

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

            {/* Manage Categories */}
            <div
              onClick={() => { setShowSettings(false); setShowManageCategories(true); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm, cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Tag size={18} color={theme.textPrimary} />
                <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Manage Categories</span>
              </div>
              <ChevronDown size={16} color={theme.textSecondary} style={{ transform: "rotate(-90deg)" }} />
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

            {/* Base Currency */}
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <DollarSign size={18} color={theme.textPrimary} />
                <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Base Currency</span>
              </div>
              {/* ponytail: replaced native select with NeoSelect for neomorphism */}
              <div style={{ width: 140 }}>
                <NeoSelect
                  value={baseCurrency}
                  onChange={setBaseCurrency}
                  options={CURRENCIES.map(c => ({ value: c.code, label: `${c.code} (${c.symbol})` }))}
                  theme={theme}
                  fontBody={fontBody}
                  style={{ marginBottom: 0 }}
                />
              </div>
            </div>
            
            {/* Custom Category Rules */}
            <div style={{ background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontDisplay, marginBottom: 12 }}>Custom Category Rules</div>
              
              {customCategoryRules.length === 0 && (
                 <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 12 }}>Add rules to auto-categorize CSV imports.</div>
              )}
              
              {customCategoryRules.map((rule, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: theme.textSecondary, flex: 1 }}>"{rule.keyword}" &rarr; <b style={{color: theme.textPrimary}}>{rule.category}</b></span>
                  <button onClick={() => setCustomCategoryRules(prev => prev.filter((_, i) => i !== idx))} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer" }}><X size={14} /></button>
                </div>
              ))}
              
              <button onClick={() => setShowRuleModal(true)} style={{ width: "100%", background: theme.accent, color: "#fff", border: "none", borderRadius: 8, padding: "12px", cursor: "pointer", fontWeight: 600, ...fontBody, marginTop: 8 }}>
                Add Custom Rule
              </button>
            </div>
            
            {/* Wipe Data */}
            <div
              onClick={() => setShowWipeConfirm(true)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#ff4d4d", padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm, cursor: "pointer", marginTop: 8 }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", ...fontBody }}>Wipe Transactions Data</span>
            </div>
          </div>
        </NeoSurface>
      </div>
    );
  }



  /* ---------------------------------- INSIGHTS OVERLAY ---------------------------------- */

  function InsightsOverlay() {
    return (
      <div style={{ position: "fixed", inset: 0, background: theme.bg, zIndex: 60, display: "flex", flexDirection: "column" }}>
        <NeoSurface style={{ padding: "20px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, paddingTop: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={20} color={theme.accent} />
            <span style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>AI Insights</span>
          </div>
          <button onClick={() => setShowInsights(false)} style={{ border: "none", background: "none", color: theme.textSecondary, cursor: "pointer", display: "flex" }}><X size={22} /></button>
        </NeoSurface>
        <div style={{ flex: 1, overflowY: "auto", background: theme.bg }}>
          {renderInsightsTab()}
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

        {/* Undo Last Import */}
        {lastImportSnapshot && Date.now() - lastImportSnapshot.timestamp < 86400000 && (
          <div style={{ background: theme.bg, borderRadius: 16, padding: 16, marginTop: 12, boxShadow: theme.shadowRaisedSm, border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.textPrimary, ...fontDisplay, marginBottom: 6 }}>↩️ Undo Last Import</div>
            <div style={{ fontSize: 12, color: theme.textSecondary, ...fontBody, marginBottom: 12 }}>
              {lastImportSnapshot.count} transactions imported. You can undo this for{" "}
              <strong>{Math.ceil((86400000 - (Date.now() - lastImportSnapshot.timestamp)) / 3600000)}h</strong> more.
            </div>
            <button
              onClick={() => {
                setTransactions(prev => prev.filter(t => !lastImportSnapshot.ids.includes(t.id)));
                updateBalanceForMethod(lastImportSnapshot.method, -lastImportSnapshot.balanceDelta);
                setLastImportSnapshot(null);
                setToastMessage("↩️ Import undone successfully");
                setTimeout(() => setToastMessage(""), 3000);
                setShowSettings(false);
              }}
              style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: theme.danger + "22", color: theme.danger, fontWeight: 700, fontSize: 13, ...fontBody, cursor: "pointer" }}
            >
              Undo Import
            </button>
          </div>
        )}
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
            Used to power AI insights & statement import with Gemini 2.5 Flash. Saved securely in your browser.
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
    { id: "meditation", label: "Meditation", icon: Flower2 },
    { id: "expense", label: "Expense", icon: Wallet },
    { id: "todo", label: "Todo", icon: ListChecks },
  ];
  const titles = { timer: "Focus Timer", meditation: "Mindfulness", expense: "Expense Tracker", todo: "Today's Tasks" };
  const subtitles = {
    timer: "Stay in the zone",
    meditation: "Breathe, relax, and center yourself",
    expense: apiKey ? "Synced with AI insight engine" : "Track every rupee",
    todo: "Auto-sorted for you",
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
      `}</style>
      <div style={{ width: "100%", minHeight: "100vh", background: theme.pageBg, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

        {/* header */}
        <div style={{ padding: "20px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 700, ...fontDisplay }}>{titles[activeTab]}</div>
            <div style={{ color: theme.textSecondary, fontSize: 11.5, marginTop: 2, ...fontBody }}>{subtitles[activeTab]}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <IconBtn size={38} icon={<Sparkles size={15} />} onClick={() => setShowInsights(true)} />
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
            {activeTab === "meditation" && renderMeditationTab()}
            {activeTab === "expense" && renderExpenseTab()}
            {activeTab === "todo" && <TodoTab theme={theme} NeoSurface={NeoSurface} NeoInput={NeoInput} PrimaryButton={PrimaryButton} SectionLabel={SectionLabel} fontDisplay={fontDisplay} fontBody={fontBody} />}
          </div>
        </div>
        <audio ref={audioRef} style={{ display: 'none' }} />
        <div id="yt-audio-player" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", visibility: "hidden" }}></div>
      </div>

      {showKeyModal && <ApiKeyModal />}
      {showSettings && <SettingsModal />}
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
                    if (newCategoryType === "income" && !ALL_INCOME_CATEGORIES.includes(catName)) {
                      setCustomIncomeCategories(prev => [...prev, catName]);
                      setCustomCategoryIcons(prev => ({...prev, [catName]: newCategoryIcon}));
                      setNewCat(catName); // Auto-select it
                    } else if (newCategoryType === "expense" && !ALL_EXPENSE_CATEGORIES.includes(catName)) {
                      setCustomCategories(prev => [...prev, catName]);
                      setCustomCategoryIcons(prev => ({...prev, [catName]: newCategoryIcon}));
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
            
            {customCategories.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: theme.textSecondary, ...fontBody }}>No custom categories added yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {customCategories.map(cat => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 16, background: theme.bg, boxShadow: theme.shadowInset }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, color: theme.textSecondary }}>
                        {customCategoryIcons[cat] ? RENDER_CUSTOM_ICON(customCategoryIcons[cat], 20) : <Box size={20} />}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>{cat}</span>
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
                setToastMessage("Transactions cleared successfully");
              }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: theme.danger, color: "#fff", fontWeight: 600, ...fontBody, cursor: "pointer" }}>Wipe Data</button>
            </div>
          </NeoSurface>
        </div>
      )}

      {/* IMPORT REVIEW MODAL */}
      {importReviewData && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <NeoSurface style={{ width: '90%', maxWidth: 400, maxHeight: '80vh', padding: 24, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Review Imported Transactions</div>
            <div style={{ fontSize: 14, color: theme.textSecondary, ...fontBody }}>
              {importReviewData.txs.length} new transactions found.
              {importReviewData.bankName && <div style={{ marginTop: 4 }}>Account: <strong>{importReviewData.bankName}</strong></div>}
            </div>

            {importReviewData.closingBalance !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: theme.bg, padding: 12, borderRadius: 12, boxShadow: theme.shadowInset }}>
                <input 
                  type="checkbox" 
                  checked={updateBankBalance} 
                  onChange={(e) => setUpdateBankBalance(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: theme.accent, cursor: "pointer" }}
                />
                <div style={{ fontSize: 13, color: theme.textPrimary, ...fontBody }}>
                  Update bank balance to <strong>{formatCurrency(importReviewData.closingBalance, baseCurrency)}</strong>
                </div>
              </div>
            )}
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
              {importReviewData.txs.map((tx, idx) => (
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
              <button onClick={() => setImportReviewData(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: theme.bg, color: theme.textSecondary, boxShadow: theme.shadowRaisedSm, fontWeight: 600, ...fontBody, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => {
                const count = importReviewData.txs.length;
                let targetMethod = 'UPI';
                const bankName = importReviewData.bankName;
                const closingBalance = importReviewData.closingBalance;
                let bankUpdated = false;

                if (bankName) {
                    const normalizedBank = bankName.toLowerCase();
                    const isUpi = normalizedBank.includes('upi') || normalizedBank.includes('phonepe') || normalizedBank.includes('gpay') || normalizedBank.includes('paytm');
                    
                    if (isUpi) {
                        targetMethod = 'UPI';
                        if (!isNaN(closingBalance) && updateBankBalance) {
                            setBalances(prev => ({ ...prev, upi: closingBalance }));
                            bankUpdated = true;
                        }
                    } else {
                        const existingBank = banks.find(b => b.bankName.toLowerCase().includes(normalizedBank) || normalizedBank.includes(b.bankName.toLowerCase()));
                        if (existingBank) {
                            targetMethod = String(existingBank.id);
                            if (!isNaN(closingBalance) && updateBankBalance) {
                                setBanks(prev => prev.map(b => String(b.id) === targetMethod ? { ...b, balance: closingBalance } : b));
                                bankUpdated = true;
                            }
                        } else {
                            targetMethod = Date.now().toString();
                            setBanks(prev => [...prev, { id: targetMethod, bankName: bankName, balance: (!isNaN(closingBalance) && updateBankBalance) ? closingBalance : 0, icon: "🏛️" }]);
                            bankUpdated = true;
                        }
                    }
                } else if (banks.length > 0) {
                    targetMethod = String(banks[0].id);
                }

                const txsToSave = importReviewData.txs.map(tx => ({ ...tx, method: targetMethod }));
                setTransactions(prev => [...txsToSave, ...prev]);
                
                // Record snapshot for undo (valid 24h)
                setLastImportSnapshot({
                  ids: txsToSave.map(t => t.id),
                  method: targetMethod,
                  balanceDelta: updateBankBalance ? 0 : txsToSave.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0),
                  timestamp: Date.now(),
                  count: txsToSave.length,
                });
                
                // If the user opted not to use the closing balance (unchecked or missing), we apply the deltas manually
                if (!bankUpdated && updateBankBalance) {
                   // wait, if updateBankBalance is true but bankUpdated is false (e.g. no closing balance in statement), we apply deltas
                   txsToSave.forEach(tx => {
                     const delta = tx.type === 'income' ? tx.amount : -tx.amount;
                     updateBalanceForMethod(tx.method, delta);
                   });
                } else if (!updateBankBalance) {
                   // If user explicitly unchecks it (e.g. historical data), they don't want the bank balance touched at all.
                   // So we do NOTHING to the balance. It remains as is.
                }

                setImportedCount(count);
                setImportReviewData(null);
                setShowImportCelebration(true);
                setTimeout(() => setShowImportCelebration(false), 4000);
              }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: theme.accent, color: "#fff", fontWeight: 700, ...fontBody, cursor: "pointer" }}>Save All ✓</button>
            </div>
          </NeoSurface>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: theme.textPrimary, color: theme.bg, padding: "12px 24px", borderRadius: 30, fontSize: 14, fontWeight: 600, ...fontBody, zIndex: 100, boxShadow: theme.shadowRaisedLg, animation: "fadeIn 0.3s ease-out" }}>
          {toastMessage}
        </div>
      )}


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
                  setToastMessage("↩️ Import undone successfully");
                  setTimeout(() => setToastMessage(""), 3000);
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
      {showWidget && <WidgetPreviewModal />}

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
    </div>
  );
}
