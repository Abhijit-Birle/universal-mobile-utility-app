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
} from "lucide-react";
import Strands from "./components/Strands";
import BreathingExercise from "./components/BreathingExercise";
import MoneyTab from "./tabs/MoneyTab.jsx";
import TodoTab from "./tabs/TodoTab.jsx";
import TimePicker from "./components/ui/TimePicker.jsx";
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
const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"];

const CATEGORY_EMOJIS = {
  Food: "🍔", Transport: "🚕", Shopping: "🛍️", Bills: "📄", Entertainment: "🎬", Health: "💊", Education: "📚",
  Salary: "💼", Freelance: "💻", Business: "🏢", Investment: "📈", Gift: "🎁", Other: "📦",
};
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

const TAB_ORDER = ["timer", "meditation", "expense", "todo", "insights"];


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
  const { todos, incrementPomodoro, toggleDone, updateTodo } = useTodos();
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
  const [newMethod, setNewMethod] = useState("Cash");
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
  const [apiKey, setApiKey] = useState("");
  const [direction, setDirection] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [syncState, setSyncState] = useState("synced"); // synced | syncing
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
        if (showSearch) { setShowSearch(false); return; }

        // If no modal is open, exit the app
        CapacitorApp.exitApp();
      });
    };
    initListener();

    return () => {
      if (listener) listener.remove();
    };
  }, [showForm, showBudgetModal, showBudgetDropdown, showBanksList, showCategoryDrawer, showNoteModal, showDailyGoalModal, showSettings, showKeyModal, showSearch]);

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

  const NeoDatePicker = useCallback(({ value, onChange }) => {
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
      <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
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
            ...fontBody
          }}
        >
          {value || "Select Date"}
        </div>

        {open && (
          <NeoSurface style={{ padding: 16, marginTop: 8 }}>
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
    const incomeThisMonth = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = incomeThisMonth - spentThisMonth;
    const monthlyBurnRate = upcomingBills.reduce((sum, b) => sum + Number(b.amount), 0);

    const spentByCategory = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
      }
    });

    const pieData = [];
    if (incomeThisMonth > 0) pieData.push({ name: "Income", value: incomeThisMonth, fill: theme.success });
    if (spentThisMonth > 0) pieData.push({ name: "Expense", value: spentThisMonth, fill: theme.danger });

    const BUDGETS = EXPENSE_CATEGORIES.map(cat => ({
      category: cat,
      budget: categoryBudgets[cat] || 0,
      color: theme.accent
    })).filter(b => b.budget > 0);

    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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

    // ponytail: swipe-left to reveal delete — no library, no abstraction
    const SwipeRow = ({ onDelete, children, style }) => {
      const [offset, setOffset] = React.useState(0);
      const startX = React.useRef(0);
      const dragging = React.useRef(false);
      const THRESHOLD = 60;
      const onTouchStart = (e) => { startX.current = e.touches[0].clientX; dragging.current = true; };
      const onTouchMove = (e) => {
        if (!dragging.current) return;
        const dx = e.touches[0].clientX - startX.current;
        if (dx < 0) setOffset(Math.max(dx, -THRESHOLD));
      };
      const onTouchEnd = () => {
        dragging.current = false;
        setOffset(o => o < -THRESHOLD / 2 ? -THRESHOLD : 0);
      };
      return (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, ...style }}>
          {/* delete bg */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: THRESHOLD, background: theme.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 20px 20px 0' }}
            onClick={onDelete}>
            <Trash2 size={18} color="#fff" />
          </div>
          {/* sliding content */}
          <div
            style={{ transform: `translateX(${offset}px)`, transition: dragging.current ? 'none' : 'transform .2s' }}
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
      setNewMethod(tx.method || "Cash");
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

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <select
                    value={newCurrency || baseCurrency}
                    onChange={e => {
                      setNewCurrency(e.target.value);
                      if (e.target.value === baseCurrency) setNewExchangeRate("1");
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: theme.bg,
                      color: theme.textPrimary,
                      border: "none",
                      boxShadow: theme.shadowInset,
                      fontSize: 14,
                      ...fontBody,
                      outline: "none"
                    }}
                  >
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                  </select>
                  {((newCurrency || baseCurrency) !== baseCurrency) && (
                    <div style={{
                      display: "flex", flex: 1, alignItems: "center",
                      background: theme.bg, borderRadius: 14, border: "none",
                      boxShadow: theme.shadowInset, padding: "0 12px"
                    }}>
                      <span style={{ color: theme.textSecondary, fontSize: 13, marginRight: 4 }}>Rate</span>
                      <input
                        type="number"
                        placeholder="to base"
                        value={newExchangeRate}
                        onChange={e => setNewExchangeRate(e.target.value)}
                        style={{ flex: 1, background: "none", border: "none", color: theme.textPrimary, fontSize: 14, width: "100%", outline: "none", ...fontBody }}
                      />
                    </div>
                  )}
                </div>
                <NeoInput placeholder="Description (e.g., Starbucks, Uber)" value={newDesc} onChange={e => handleDescChange(e.target.value)} />
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: theme.accent, flexShrink: 0 }}>
                    <Calendar size={18} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <NeoDatePicker value={newDate} onChange={setNewDate} />
                    <div style={{ height: 1, background: theme.border, opacity: 0.5 }} />
                    <TimePicker value={newTime} onChange={setNewTime} theme={theme} fontBody={fontBody} />
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>CATEGORY</div>
              <button
                onClick={() => setShowCategoryDrawer(true)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: theme.bg,
                  boxShadow: theme.shadowRaisedSm,
                  border: "none",
                  borderRadius: 14,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: theme.textPrimary,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  ...fontBody
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: theme.accent + "1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    {CATEGORY_EMOJIS[newCat] || "📦"}
                  </div>
                  {newCat}
                </div>
                <ChevronDown size={18} color={theme.textSecondary} />
              </button>

              <PrimaryButton label={editingTxId ? "Save Changes" : "Add transaction"} icon={<Check size={18} />} onClick={() => {
                if (newAmount) {
                  const origAmount = parseFloat(newAmount) || 0;
                  const rate = parseFloat(newExchangeRate) || 1;
                  const finalAmount = origAmount * rate;

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

            <NeoSurface style={{ padding: 20, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              </div>

              {pieData.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                  <PieChart width={200} height={200}>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none" paddingAngle={5}>
                      {pieData.map((entry, index) => {
                        return <Cell key={`cell-${index}`} fill={entry.fill} />
                      })}
                    </Pie>
                  </PieChart>
                </div>
              )}
              {pieData.length === 0 && (
                <div style={{ textAlign: 'center', color: theme.textSecondary, fontSize: 13, padding: '20px 0' }}>No transactions this month.</div>
              )}
            </NeoSurface>

            <div onTouchStart={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {[
                { id: "bank", label: "Bank", icon: Landmark, balance: balances.bank },
                { id: "cash", label: "Cash", icon: Wallet2, balance: balances.cash },
              ].map(acc => (
                <NeoSurface key={acc.id} onClick={() => setActiveAccount(acc.id)} pressed={activeAccount === acc.id} style={{ minWidth: 145, flex: 1, padding: "20px", cursor: "pointer", borderRadius: 20, position: "relative" }}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBalanceAcc(acc);
                      setTempBalance(acc.balance.toString());
                      setShowEditBalanceModal(true);
                    }}
                    style={{
                      width: 44, height: 44, borderRadius: "50%", background: theme.bg,
                      boxShadow: theme.shadowPressed, display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: 16, color: theme.accent, cursor: "pointer",
                    }}
                  >
                    <acc.icon size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, ...fontBody }}>{acc.label}</div>
                    <div style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 700, ...fontDisplay }}>{formatCurrency(acc.balance, baseCurrency)}</div>
                  </div>
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
                  {formatCurrency(spentThisMonth, baseCurrency)}
                </div>
              </div>
              <PrimaryButton icon={<Plus size={16} strokeWidth={2.5} />} label="New" onClick={() => setShowForm(true)} style={{ padding: "12px 24px", borderRadius: 16, fontSize: 15 }} />
            </div>

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

            <SectionLabel>Recent transactions</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {transactions.slice(0, 4).map((t) => {
                const isExp = t.type === "expense";
                return (
                  <SwipeRow key={t.id} onDelete={() => deleteTx(t.id)}>
                    <NeoSurface style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, borderRadius: 20 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: isExp ? `${theme.danger}15` : `${theme.success}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                        {CATEGORY_EMOJIS[t.category] || "📦"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: theme.textPrimary, fontSize: 14, fontWeight: 700, marginBottom: 2, ...fontBody }}>{t.category}</div>
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

            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                <div>
                  <SectionLabel>Upcoming Bills</SectionLabel>
                  <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2, fontWeight: 500 }}>Monthly Burn Rate: <span style={{ color: theme.danger, fontWeight: 700 }}>{formatCurrency(monthlyBurnRate, baseCurrency)}</span></div>
                </div>
                <button onClick={() => {
                  setEditingBill(null);
                  setBillFormState({ name: "", amount: "", daysLeft: "" });
                  setShowBillModal(true);
                }} style={{ border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm, padding: "6px 12px", borderRadius: 12, color: theme.textPrimary, fontSize: 13, fontWeight: 700, cursor: "pointer", ...fontBody }}>+ Add</button>
              </div>
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
                      <NeoSurface style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, borderRadius: 20 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: daysUntilDue <= 3 ? theme.danger : theme.accent }}>
                          <Bell size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 13.5, ...fontBody }}>{b.name}</div>
                          <div style={{ color: theme.textSecondary, fontSize: 11, ...fontBody }}>Due on the {getOrdinal(b.daysLeft)} • {daysUntilDue} day{daysUntilDue !== 1 ? "s" : ""} left</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13.5, marginRight: 8, ...fontDisplay }}>{formatCurrency(b.amount, baseCurrency)}</div>
                          <button onClick={() => {
                            setEditingBill(b);
                            setBillFormState({ name: b.name, amount: b.amount.toString(), daysLeft: b.daysLeft.toString() });
                            setShowBillModal(true);
                          }} style={{ border: "none", background: "none", color: theme.textSecondary, cursor: "pointer" }}><Pencil size={14} /></button>
                        </div>
                      </NeoSurface>
                    </SwipeRow>
                  );
                })}
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
            </div>

            <div style={{ marginTop: 20 }}>
              <SectionLabel>{selectedDate ? `Transactions on ${selectedDate} ${monthLabel}` : "All transactions"}</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {dayFiltered.map((t) => {
                  return (
                    <SwipeRow key={t.id} onDelete={() => deleteTx(t.id)}>
                      <NeoSurface style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, borderRadius: 20 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: theme.bg,
                          boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16
                        }}>
                          {CATEGORY_EMOJIS[t.category] || "📦"}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 13.5, ...fontBody }}>{t.category}</span>
                            {t.recurring && <Repeat size={12} color={theme.textSecondary} />}
                            {t.split && <Split size={12} color={theme.accent} />}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.textSecondary, fontSize: 11, ...fontBody }}>
                            <span>{t.name}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>{methodIcon(t.method)} {methodLabel(t.method)}</span>
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
                          <button onClick={() => openEdit(t)} style={{ border: "none", background: "none", color: theme.textSecondary }}><Pencil size={14} /></button>
                        </div>
                      </NeoSurface>
                    </SwipeRow>
                  );
                })}
              </div>
            </div>

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
                                  {CATEGORY_EMOJIS[cat] || "📦"}
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
                  <NeoInput placeholder="Bank Name (e.g. HDFC Bank)" value={bankFormState.bankName} onChange={e => setBankFormState({ ...bankFormState, bankName: e.target.value })} />
                  <NeoInput placeholder="Account Number" type="number" value={bankFormState.accountNumber} onChange={e => setBankFormState({ ...bankFormState, accountNumber: e.target.value })} />
                  <NeoInput placeholder="IFSC Code" value={bankFormState.ifsc} onChange={e => setBankFormState({ ...bankFormState, ifsc: e.target.value })} />

                  <SectionLabel>Card Details</SectionLabel>
                  <div style={{ display: "flex", gap: 8, background: theme.bg, padding: 4, borderRadius: 16, boxShadow: theme.shadowInset }}>
                    {["Debit", "Credit"].map(t => (
                      <div key={t} onClick={() => setBankFormState({ ...bankFormState, cardType: t })} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: bankFormState.cardType === t ? theme.accent : theme.textSecondary, background: bankFormState.cardType === t ? theme.bg : "transparent", boxShadow: bankFormState.cardType === t ? theme.shadowRaisedSm : "none", transition: "all .2s" }}>{t}</div>
                    ))}
                  </div>
                  <NeoInput placeholder="Card Number" type="number" value={bankFormState.cardNumber} onChange={e => setBankFormState({ ...bankFormState, cardNumber: e.target.value })} />
                  <div style={{ display: "flex", gap: 12 }}>
                    <NeoInput placeholder="MM/YY" style={{ flex: 1 }} value={bankFormState.expiry} onChange={e => setBankFormState({ ...bankFormState, expiry: e.target.value })} />
                    <NeoInput placeholder="CVV" type="password" style={{ flex: 1 }} value={bankFormState.cvv} onChange={e => setBankFormState({ ...bankFormState, cvv: e.target.value })} />
                  </div>
                  <NeoInput placeholder="PIN Code" type="password" value={bankFormState.pin} onChange={e => setBankFormState({ ...bankFormState, pin: e.target.value })} />

                  <SectionLabel>Netbanking Details</SectionLabel>
                  <NeoInput placeholder="Username / Customer ID" value={bankFormState.netbankingUser} onChange={e => setBankFormState({ ...bankFormState, netbankingUser: e.target.value })} />
                  <NeoInput placeholder="Password" type="password" value={bankFormState.netbankingPass} onChange={e => setBankFormState({ ...bankFormState, netbankingPass: e.target.value })} />
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

        {/* Category Bottom Drawer */}
        {showCategoryDrawer && (
          <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowCategoryDrawer(false)}
            />
            <div style={{
              position: "relative",
              background: theme.bg,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: "24px 20px 40px",
              boxShadow: "0 -10px 40px rgba(0,0,0,0.1)",
              animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: theme.textSecondary, opacity: 0.3, margin: "0 auto 20px" }} />
              <h3 style={{ margin: "0 0 20px", fontSize: 18, color: theme.textPrimary, ...fontDisplay }}>Select Category</h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {(newType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(c => (
                  <div
                    key={c}
                    onClick={() => { setNewCat(c); setShowCategoryDrawer(false); }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      opacity: newCat === c ? 1 : 0.6,
                      transform: newCat === c ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      background: newCat === c ? theme.accent : theme.pageBg,
                      boxShadow: newCat === c ? `0 8px 16px ${theme.accent}40` : theme.shadowRaisedSm,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24
                    }}>
                      {CATEGORY_EMOJIS[c] || "📦"}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: newCat === c ? theme.accent : theme.textSecondary, textAlign: "center", ...fontBody }}>
                      {c}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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

            {/* Base Currency */}
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <DollarSign size={18} color={theme.textPrimary} />
                <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Base Currency</span>
              </div>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                style={{
                  background: theme.bg, color: theme.textPrimary, border: `1px solid ${theme.border}`,
                  borderRadius: 8, padding: "4px 8px", fontSize: 14, ...fontBody, outline: "none"
                }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </select>
            </div>
          </div>
        </NeoSurface>
      </div>
    );
  }

  /* ---------------------------------- GLOBAL SEARCH ---------------------------------- */

  function SearchOverlay() {
    const [searchQuery, setSearchQuery] = useState("");
    const q = searchQuery.trim().toLowerCase();

    // We recreate searchIndex here so it has the latest baseCurrency
    const searchIndexData = [
      ...transactions.map(t => ({ type: "expense", icon: t.type === 'expense' ? ShoppingCart : Landmark, label: t.name, meta: `${formatCurrency(t.amount, baseCurrency)} · ${t.date}`, item: t })),
      ...todos.map(t => ({ type: "todo", icon: FileText, label: t.text, meta: `${t.priority} priority`, item: t })),
      ...history.map(h => ({ type: "session", icon: TimerIcon, label: h.note || h.type, meta: `${h.minutes}m · ${h.date}`, item: h }))
    ];

    const results = q ? searchIndexData.filter((r) => r.label.toLowerCase().includes(q)) : searchIndexData;
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
    { id: "meditation", label: "Meditation", icon: Flower2 },
    { id: "expense", label: "Expense", icon: Wallet },
    { id: "todo", label: "Todo", icon: ListChecks },
    { id: "insights", label: "Insights", icon: BarChart3 },
  ];
  const titles = { timer: "Focus Timer", meditation: "Mindfulness", expense: "Expense Tracker", todo: "Today's Tasks", insights: "Insights" };
  const subtitles = {
    timer: "Stay in the zone",
    meditation: "Breathe, relax, and center yourself",
    expense: apiKey ? "Synced with AI insight engine" : "Track every rupee",
    todo: "Auto-sorted for you",
    insights: apiKey ? "Powered by your Gemini key" : "Add an API key for live AI insights",
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
            {activeTab === "meditation" && renderMeditationTab()}
            {activeTab === "expense" && renderExpenseTab()}
            {activeTab === "todo" && <TodoTab theme={theme} NeoSurface={NeoSurface} NeoInput={NeoInput} PrimaryButton={PrimaryButton} SectionLabel={SectionLabel} fontDisplay={fontDisplay} fontBody={fontBody} />}
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
