import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import * as LucideIcons from 'lucide-react';
import { getLocalDateString, getLocalToday, getLocalTime } from '../utils/date.js';
import { formatCurrency, getCurrencyByCode } from '../utils/currency.js';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import Strands from '../components/Strands.jsx';
import SplitText from '../components/ui/SplitText.jsx';

const Aurora = React.lazy(() => import('../components/reactbits/Aurora.jsx'));
const RisingBubbles = React.lazy(() => import('../components/reactbits/RisingBubbles.jsx'));
const Particles = React.lazy(() => import('../components/reactbits/Particles.jsx'));
const Waves = React.lazy(() => import('../components/reactbits/Waves.jsx'));
const MagicRings = React.lazy(() => import('../components/reactbits/MagicRings.jsx'));
const ElectricBorder = React.lazy(() => import('../components/reactbits/ElectricBorder.jsx'));
const OrbitNodes = React.lazy(() => import('../components/reactbits/OrbitNodes.jsx'));
const FallingParticles = React.lazy(() => import('../components/reactbits/FallingParticles.jsx'));
const OrbitingDots = React.lazy(() => import('../components/reactbits/OrbitingDots.jsx'));
const GradientFlow = React.lazy(() => import('../components/reactbits/GradientFlow.jsx'));
const FluidMetaballs = React.lazy(() => import('../components/reactbits/FluidMetaballs.jsx'));
const MagneticAttraction = React.lazy(() => import('../components/reactbits/MagneticAttraction.jsx'));
const FractalExpansion = React.lazy(() => import('../components/reactbits/FractalExpansion.jsx'));

export default function ExpenseTab(props) {
  const {
    show, setShow, copyMsg, setCopyMsg, activeTab, setActiveTab, swipeToast, setSwipeToast, swipeToastKey, setSwipeToastKey, swipeToastTimer, navBarRef, hasSeenNavHint, setHasSeenNavHint, history, setHistory, historyLoading, dailyGoalMinutes, setDailyGoalMinutes, hours, setHours, showCustomTimer, setShowCustomTimer, minutes, setMinutes, seconds, setSeconds, name, setName, isRunning, setIsRunning, remaining, setRemaining, activeSource, setActiveSource, audioUrl, setAudioUrl, youtubeId, setYoutubeId, isPlaying, setIsPlaying, volume, setVolume, isMuted, setIsMuted, activeCategoryPie, setActiveCategoryPie, fileInputRef, audioRef, audioCtxRef, oscillatorIntervalRef, alarmTimeoutRef, ytPlayerRef, ytLink, setYtLink, svgRef, mode, setMode, pomoPhase, setPomoPhase, pomoCycle, setPomoCycle, pomoFocusDuration, setPomoFocusDuration, pomoBreakDuration, setPomoBreakDuration, pomoMaxCycles, setPomoMaxCycles, transactions, setTransactions, transactionsLoading, linkedTodo, setLinkedTodo, showTodoPicker, setShowTodoPicker, showNoteModal, setShowNoteModal, sessionNote, setSessionNote, currentSessionId, setCurrentSessionId, migrationDoneRef, customCategories, setCustomCategories, customCategoryIcons, setCustomCategoryIcons, customIncomeCategories, setCustomIncomeCategories, todos, incrementPomodoro, toggleDone, updateTodo, categoryBudgets, setCategoryBudgets, upcomingBills, setUpcomingBills, billsLoading, showDailyGoalModal, setShowDailyGoalModal, tempDailyGoal, setTempDailyGoal, banks, setBanks, banksLoading, showBanksList, setShowBanksList, showBankForm, setShowBankForm, editingBankId, setEditingBankId, showCategoryForm, setShowCategoryForm, showManageCategories, setShowManageCategories, showCalendarWidget, setShowCalendarWidget, newCategoryName, setNewCategoryName, newCategoryIcon, setNewCategoryIcon, newCategoryType, setNewCategoryType, bankFormState, setBankFormState, showForm, setShowForm, showEditBalanceModal, setShowEditBalanceModal, editingBalanceAcc, setEditingBalanceAcc, tempBalance, setTempBalance, showBillModal, setShowBillModal, editingBill, setEditingBill, billFormState, setBillFormState, monthOffset, setMonthOffset, selectedDate, setSelectedDate, filterType, setFilterType, filterBank, setFilterBank, filterStartDate, setFilterStartDate, filterEndDate, setFilterEndDate, filterCategory, setFilterCategory, visibleTxCount, setVisibleTxCount, bankTxFilterType, setBankTxFilterType, bankTxFilterCategory, setBankTxFilterCategory, newAmount, setNewAmount, newDesc, setNewDesc, newCurrency, setNewCurrency, newExchangeRate, setNewExchangeRate, newCat, setNewCat, newType, setNewType, newDate, setNewDate, newTime, setNewTime, showCategoryDrawer, setShowCategoryDrawer, newMethod, setNewMethod, editingTxId, setEditingTxId, activeAccount, setActiveAccount, showBudgetModal, setShowBudgetModal, showBudgetDropdown, setShowBudgetDropdown, activeReminders, setActiveReminders, showBreathing, setShowBreathing, activeTechnique, setActiveTechnique, showReflectionHistory, setShowReflectionHistory, dailyIntention, setDailyIntention, dailyMood, setDailyMood, eveningReflection, setEveningReflection, dailyGratitude, setDailyGratitude, meditationDuration, setMeditationDuration, meditationTimeLeft, setMeditationTimeLeft, isMeditating, setIsMeditating, darkMode, setDarkMode, baseCurrency, setBaseCurrency, query, setQuery, loading, setLoading, insight, setInsight, askInput, setAskInput, askAnswer, setAskAnswer, asking, setAsking, generating, setGenerating, generatedInsight, setGeneratedInsight, apiKey, setApiKey, direction, setDirection, showInsights, setShowInsights, expenseView, setExpenseView, walletCardIndex, setWalletCardIndex, showRuleModal, setShowRuleModal, showWipeConfirm, setShowWipeConfirm, customCategoryRules, setCustomCategoryRules, importReviews, setImportReviews, updateBankBalance, setUpdateBankBalance, editableBankName, setEditableBankName, isImporting, setIsImporting, importErrorMsg, setImportErrorMsg, duplicateWarning, setDuplicateWarning, showImportConsent, setShowImportConsent, pendingImportFiles, setPendingImportFiles, showImportCelebration, setShowImportCelebration, importedCount, setImportedCount, lastImportSnapshot, setLastImportSnapshot, importSnapshotLoading, touchData, isOpen, setIsOpen, open, setOpen, containerRef, viewDate, setViewDate,
    theme, fontDisplay, fontBody, NeoSurface, NeoInput, PrimaryButton, IconBtn, SectionLabel, NeoSelect, CollapsibleSection, ALL_EXPENSE_CATEGORIES, ALL_INCOME_CATEGORIES, getDailyAvgSpend, markDayActive, updateBalanceForMethod, BankBadge, CATEGORY_KEYWORD_MAP, TX_CATEGORY_ICONS, ICON_OPTIONS, BANK_ICONS, handleFileUpload, handleImportStatement, PRESET_BANKS, RENDER_CUSTOM_ICON,
    NeoDatePicker, TimePicker, playAlarm, stopAlarm, initAudioCtx, autoTimerName, resetTimer, extractYoutubeId, handlePlayPause,
    methodLabel, dailyAvgSpend, currentMonthTx, spentThisMonth, incomeThisMonth, netSavings, monthlyBurnRate, spentByCategory, pieData, categoryPieData, txByDay, dayFiltered, targetYearStr, targetMonthStr, monthLabel, daysInMonth, BUDGETS
  } = props;
  
  const { Play, Pause, Square, Music, Volume2, VolumeX, List, Check, X, Target, BarChart2, CheckCircle2, ChevronRight, Settings2, Clock, Upload, XCircle, LayoutDashboard, Settings, Edit, Bell, ListChecks, Flame, Plus, Trash2, Edit2, Search, ChevronDown, Download, Eye, Tag, RefreshCw, DollarSign, Filter, ShoppingCart, Smartphone, Landmark, Calendar, AlertTriangle, ArrowRight, ChevronLeft, Flower2, PiggyBank, Box, MonitorPlay, TimerIcon, Wallet, User, Notebook, Home, Building2, TrendingDown, TrendingUp, RotateCcw, StopCircle, PlayCircle, PauseCircle, Pencil, ChevronUp, Repeat, Split } = LucideIcons;


    const now = new Date();


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
      const rowRef = React.useRef(null);
      const THRESHOLD = 60;
      
      React.useEffect(() => {
        if (offset === 0) return;
        const handleClickOutside = (e) => {
          if (rowRef.current && !rowRef.current.contains(e.target)) {
            setOffset(0);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('touchstart', handleClickOutside);
        };
      }, [offset]);

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
        <div ref={rowRef} style={{ position: 'relative', ...style }}>
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
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORD_MAP)) {
        if (keywords.some(k => lower.includes(k))) {
          setNewCat(cat);
          break;
        }
      }
    };

    // Build a "cards" list for the wallet carousel
    const bankTotal = banks.reduce((s, b) => s + (parseFloat(b.balance) || 0), 0);

    // All cards: first is "All Accounts" summary, then individual banks
    const walletCards = [
      {
        id: "all",
        name: "All Accounts",
        balance: bankTotal,
        number: banks.length > 0
          ? banks.map(b => b.bankName.slice(0, 4).toUpperCase().padEnd(4, "·")).join(" ")
          : "·····  ·····  ·····  ·····",
        expiry: (() => { const d = new Date(); return `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getFullYear()).slice(-2)}`; })(),
        color: "#1c1c22",
        animationType: "orbitnodes",
        icon: "Landmark"
      },
      ...banks.map((b, i) => {
        const types = ["fluidmetaballs", "magneticattraction", "fractalexpansion", "fallingparticles", "orbitingdots", "gradientflow", "risingbubbles", "electric", "particles", "magicrings", "waves", "aurora", "orbitnodes"];
        return {
        id: b.id,
        name: b.bankName,
        icon: b.icon || "Building2",
        balance: parseFloat(b.balance) || 0,
        number: b.bankName.replace(/\s+/g,"").slice(0,4).toUpperCase().padEnd(4,"·") + " " +
                b.bankName.slice(-4).toUpperCase().padEnd(4,"·") + " " +
                String(b.id).slice(-4).padStart(4,"·") + " " +
                String(parseInt(b.balance||0) % 9000 + 1000),
        expiry: (() => { const n = new Date(); return `${String(n.getMonth()+1).padStart(2,"0")}/${String(n.getFullYear() + 2).slice(-2)}`; })(),
        color: ["#1a1f2e","#1a2420","#1e1a28","#211e1a"][i % 4],
        animationType: types[i % types.length]
      }})
    ];

    // fix expiry for bank cards
    const now2 = new Date();
    const fmtExpiry = (yr_offset = 2) => `${String(now2.getMonth()+1).padStart(2,"0")}/${String(now2.getFullYear()+yr_offset).slice(-2)}`;
    walletCards.forEach((c, i) => { if (i > 0) c.expiry = fmtExpiry(2); });

    const activeCard = walletCards[Math.min(walletCardIndex, walletCards.length - 1)] || walletCards[0];

    const WalletView = () => {
      const spentPct = incomeThisMonth > 0 ? Math.min(spentThisMonth / incomeThisMonth, 1) : 0;
      const cardDragRef = React.useRef({ startX: 0, startY: 0, dragging: false, cardEl: null });
      const ICONS = [Flower2, PiggyBank, Box, Tag, MonitorPlay];

      const handleTouchStart = (e) => {
        e.stopPropagation();
        cardDragRef.current.startX = e.touches[0].clientX;
        cardDragRef.current.startY = e.touches[0].clientY;
        cardDragRef.current.dragging = true;
        cardDragRef.current.cardEl = e.currentTarget;
        e.currentTarget.style.transition = "none";
      };
      const handleTouchMove = (e) => {
        if (!cardDragRef.current.dragging || !cardDragRef.current.cardEl) return;
        e.stopPropagation();
        const dx = e.touches[0].clientX - cardDragRef.current.startX;
        const dy = e.touches[0].clientY - cardDragRef.current.startY;
        const rotate = dx * 0.05;
        cardDragRef.current.cardEl.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`;
      };
      const handleTouchEnd = (e) => {
        if (!cardDragRef.current.dragging || !cardDragRef.current.cardEl) return;
        e.stopPropagation();
        const dx = e.changedTouches[0].clientX - cardDragRef.current.startX;
        cardDragRef.current.dragging = false;
        
        if (dx < -60) {
          setWalletCardIndex(i => (i + 1) % walletCards.length);
        } else if (dx > 60) {
          setWalletCardIndex(i => (i - 1 + walletCards.length) % walletCards.length);
        } else if (Math.abs(dx) < 10) {
          const activeCard = walletCards[Math.min(walletCardIndex, walletCards.length - 1)] || walletCards[0];
          if (activeCard.id !== "all") {
             const bank = banks.find(b => b.id === activeCard.id);
             if (bank) {
                try { Haptics.impact({ style: ImpactStyle.Light }); } catch(e) {}
                setExpenseView("dashboard");
               setEditingBankId(bank.id);
               setBankFormState(bank);
               setShowBankForm(true);
             }
          }
        }
        cardDragRef.current.cardEl.style.transform = ""; // Reset inline transform, let React state take over
      };

      const handleMouseDown = (e) => {
        e.stopPropagation();
        cardDragRef.current.startX = e.clientX;
        cardDragRef.current.startY = e.clientY;
        cardDragRef.current.dragging = true;
        cardDragRef.current.cardEl = e.currentTarget;
        e.currentTarget.style.transition = "none";
      };
      const handleMouseMove = (e) => {
        if (!cardDragRef.current.dragging || !cardDragRef.current.cardEl) return;
        e.stopPropagation();
        const dx = e.clientX - cardDragRef.current.startX;
        const dy = e.clientY - cardDragRef.current.startY;
        const rotate = dx * 0.05;
        cardDragRef.current.cardEl.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`;
      };
      const handleMouseUp = (e) => {
        if (!cardDragRef.current.dragging || !cardDragRef.current.cardEl) return;
        e.stopPropagation();
        const dx = e.clientX - cardDragRef.current.startX;
        cardDragRef.current.dragging = false;
        
        if (dx < -60) {
          setWalletCardIndex(i => (i + 1) % walletCards.length);
        } else if (dx > 60) {
          setWalletCardIndex(i => (i - 1 + walletCards.length) % walletCards.length);
        } else if (Math.abs(dx) < 10) {
          const activeCard = walletCards[Math.min(walletCardIndex, walletCards.length - 1)] || walletCards[0];
          if (activeCard.id !== "all") {
             const bank = banks.find(b => b.id === activeCard.id);
             if (bank) {
               setExpenseView("dashboard");
               setEditingBankId(bank.id);
               setBankFormState(bank);
               setShowBankForm(true);
             }
          }
        }
        cardDragRef.current.cardEl.style.transform = ""; // Reset inline transform, let React state take over
      };

      return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0px 20px 0", background: "transparent", userSelect: "none", position: "relative" }}>
          
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", marginTop: 20 }}>
            {/* Stacked Cards (Circular) */}
            <div style={{ position: "relative", width: 230, height: 340, marginBottom: 50 }}>
              {walletCards.map((card, i) => {
                const N = walletCards.length;
                let offset = i - walletCardIndex;
                if (N > 2) {
                  if (offset > N / 2) offset -= N;
                  else if (offset < -N / 2) offset += N;
                }
                
                if (Math.abs(offset) > 2) return null; // Show up to 2 cards before and after
                
                const isTop = offset === 0;
                const scale = 1 - (Math.abs(offset) * 0.08);
                const yOffset = offset * 24; // Cards before will be shifted up, cards after shifted down
                const opacity = 1 - (Math.abs(offset) * 0.25);
                const zIndex = 10 - Math.abs(offset); // Active card is always on top
                const IconName = card.icon;
                const Icon = IconName && LucideIcons[IconName] ? LucideIcons[IconName] : ICONS[i % ICONS.length];

                const darkAnimations = ["risingbubbles", "fallingparticles", "orbitingdots", "gradientflow", "fluidmetaballs", "magneticattraction", "fractalexpansion"];
                const isDarkAnimation = card.animationType && darkAnimations.includes(card.animationType);
                const cardTextColor = isDarkAnimation ? "#FFFFFF" : theme.textPrimary;
                const cardTextSecondary = isDarkAnimation ? "rgba(255, 255, 255, 0.7)" : theme.textSecondary;

                return (
                  <div
                    key={card.id}
                    style={{
                      position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
                      borderRadius: 36,
                      background: theme.bg,
                      boxShadow: isTop ? theme.shadowRaised : "4px 4px 16px rgba(0,0,0,0.2)",
                      border: `1px solid ${theme.accent}15`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      transform: `translate(0px, ${yOffset}px) scale(${scale})`,
                      opacity,
                      zIndex,
                      transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
                      cursor: isTop ? "grab" : "default",
                      touchAction: "none",
                      overflow: "hidden"
                    }}
                    onTouchStart={isTop ? handleTouchStart : undefined}
                    onTouchMove={isTop ? handleTouchMove : undefined}
                    onTouchEnd={isTop ? handleTouchEnd : undefined}
                    onMouseDown={isTop ? handleMouseDown : undefined}
                    onMouseMove={isTop ? handleMouseMove : undefined}
                    onMouseUp={isTop ? handleMouseUp : undefined}
                    onMouseLeave={isTop ? handleMouseUp : undefined}
                  >
                    {/* Background Animation */}
                    <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, zIndex: 0, borderRadius: 36, overflow: "hidden", pointerEvents: "none" }}>
                      {isTop ? (
                        <React.Suspense fallback={<div style={{ width: "100%", height: "100%", background: theme.bg }} />}>
                          <div style={{ opacity: 1, width: "100%", height: "100%" }}>
                            {card.animationType === "aurora" && <Aurora colorStops={["#3A29FF", "#FF94B4", "#FF3232"]} speed={0.5} />}
                            {card.animationType === "risingbubbles" && <RisingBubbles />}
                            {card.animationType === "particles" && <Particles particleColors={['#ffffff', '#ffffff']} particleCount={200} particleSpread={10} speed={0.1} particleBaseSize={100} moveParticlesOnHover={false} alphaParticles={true} disableRotation={false} />}
                            {card.animationType === "waves" && <Waves lineColor="#ffffff" />}
                            {card.animationType === "magicrings" && <MagicRings />}
                            {card.animationType === "electric" && <ElectricBorder style={{width: "100%", height: "100%", borderRadius: 36}} />}
                            {card.animationType === "orbitnodes" && <OrbitNodes />}
                            {card.animationType === "fallingparticles" && <FallingParticles />}
                            {card.animationType === "orbitingdots" && <OrbitingDots />}
                            {card.animationType === "gradientflow" && <GradientFlow />}
                            {card.animationType === "fluidmetaballs" && <FluidMetaballs />}
                            {card.animationType === "magneticattraction" && <MagneticAttraction />}
                            {card.animationType === "fractalexpansion" && <FractalExpansion />}
                          </div>
                        </React.Suspense>
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: theme.bg }} />
                      )}
                    </div>

                    <div style={{ position: "absolute", bottom: 40, left: 32, right: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", zIndex: 1 }}>
                      <div>
                        <div style={{ fontSize: 12, color: cardTextSecondary, fontWeight: 600, marginBottom: 4 }}>TOTAL BALANCE</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: cardTextColor, ...fontDisplay, letterSpacing: 0.5 }}>
                          {formatCurrency(card.balance, baseCurrency)}
                        </div>
                      </div>
                    </div>

                    <div style={{ position: "absolute", top: 32, left: 32, zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                      <Icon size={24} color={cardTextColor} strokeWidth={2} />
                      <div style={{ fontSize: 16, fontWeight: 700, color: cardTextColor, letterSpacing: 0.5 }}>{card.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Balance & Progress */}
            <div style={{ width: "100%", maxWidth: 320, textAlign: "center", position: "relative", zIndex: 20 }}>
              <div style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 600, marginBottom: 8 }}>Total Balance</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: theme.textPrimary, ...fontDisplay, marginBottom: 32 }}>
                {formatCurrency(activeCard?.balance ?? bankTotal, baseCurrency)}
              </div>

              {/* Progress Bar */}
              <div style={{
                height: 10, borderRadius: 10, background: theme.bg,
                boxShadow: theme.shadowInset, marginBottom: 12, overflow: "hidden"
              }}>
                <div style={{
                  height: "100%",
                  width: `${(spentPct * 100).toFixed(1)}%`,
                  borderRadius: 10,
                  background: spentPct > 0.85
                    ? `linear-gradient(90deg, ${theme.danger}cc, ${theme.danger})`
                    : `linear-gradient(90deg, ${theme.accent}cc, ${theme.accent})`,
                  transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: theme.textSecondary, fontWeight: 600 }}>Monthly Spent</div>
                <div style={{ fontSize: 13, color: theme.textSecondary, fontWeight: 600 }}>
                  {formatCurrency(spentThisMonth, baseCurrency)} / {formatCurrency(incomeThisMonth > 0 ? incomeThisMonth : bankTotal, baseCurrency)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: "flex", gap: 16, justifyContent: "center", width: "100%", maxWidth: 320, marginTop: 32, position: "relative", zIndex: 20
            }}>
              {[
                { id: "wallet", icon: <Home size={22} />, label: "Home" },
                { id: "add", icon: <Plus size={22} />, label: "Add" },
                { id: "dashboard", icon: <LayoutDashboard size={22} />, label: "Dashboard" },
                { id: "settings", icon: <Settings size={22} />, label: "Settings" },
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => {
                    if (btn.id === "add") { setShowForm(true); }
                    else if (btn.id === "settings") { setShowSettings(true); }
                    else { setExpenseView(btn.id); }
                  }}
                  style={{
                    flex: 1, height: 56, borderRadius: 16,
                    border: "none", cursor: "pointer",
                    background: theme.bg,
                    boxShadow: btn.id === "wallet" ? theme.shadowInset : theme.shadowRaised,
                    color: btn.id === "wallet" ? theme.accent : theme.textSecondary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s ease"
                  }}
                >
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div style={{ padding: showForm ? "18px 18px 100px" : "0" }}>
        {showForm ? (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>

            <NeoSurface style={{ padding: 12, width: "100%", maxWidth: 380, maxHeight: "95vh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: theme.textPrimary, ...fontDisplay }}>{editingTxId ? "Edit transaction" : "Add transaction"}</div>
                <button onClick={closeForm} style={{ border: "none", background: "none", color: theme.textSecondary }}><X size={20} /></button>
              </div>

              <div style={{ display: "flex", gap: 8, background: theme.bg, padding: 4, borderRadius: 12, boxShadow: theme.shadowInset }}>
                <div onClick={() => setNewType("expense")} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: newType === "expense" ? theme.danger : theme.textSecondary, background: newType === "expense" ? theme.bg : "transparent", boxShadow: newType === "expense" ? theme.shadowRaisedSm : "none", transition: "all .2s", cursor: "pointer" }}>Expense</div>
                <div onClick={() => setNewType("income")} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: newType === "income" ? theme.success : theme.textSecondary, background: newType === "income" ? theme.bg : "transparent", boxShadow: newType === "income" ? theme.shadowRaisedSm : "none", transition: "all .2s", cursor: "pointer" }}>Income</div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, height: 40 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: theme.textPrimary, ...fontDisplay }}>{getCurrencyByCode(newCurrency || baseCurrency).symbol}</span>
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
                    fontSize: 32,
                    fontWeight: 800,
                    color: theme.textPrimary,
                    width: `${Math.max(1.2, (newAmount || "").toString().length)}ch`,
                    textAlign: "center",
                    padding: 0,
                    ...fontDisplay
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: theme.accent, flexShrink: 0 }}>
                  <Calendar size={18} />
                </div>
                {/* ponytail: min change, flex row for side-by-side pickers */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}><NeoDatePicker value={newDate} onChange={setNewDate} /></div>
                  <div style={{ width: 1, height: 20, background: theme.border, opacity: 0.5 }} />
                  <div style={{ flex: 1 }}><TimePicker value={newTime} onChange={setNewTime} theme={theme} fontBody={fontBody} alignRight openDown /></div>
                </div>
              </div>
              
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginTop: 2 }}>PAYMENT METHOD</div>
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

              <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginTop: 2 }}>DESCRIPTION</div>
              <NeoInput placeholder="Description (e.g., Starbucks, Uber)" value={newDesc} onChange={e => handleDescChange(e.target.value)} />

              <div style={{ marginTop: 8, marginBottom: 8 }}>
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
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 8 }}>
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
                          padding: "8px 4px",
                          borderRadius: 10,
                          background: newCat === c ? theme.accent : theme.bg,
                          boxShadow: newCat === c ? theme.shadowInset : theme.shadowRaisedSm,
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ fontSize: 18, marginBottom: 0 }}>
                          {TX_CATEGORY_ICONS[c] || (customCategoryIcons[c] ? RENDER_CUSTOM_ICON(customCategoryIcons[c], 14) : <Box size={14} />)}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, ...fontBody, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", color: newCat === c ? "#fff" : theme.textSecondary }}>
                          {c}
                        </div>
                      </div>
                    ))}
                    
                    {(newType === "expense" || newType === "income") && (
                      <div
                        onClick={() => {
                          setNewCategoryType(newType);
                          setShowCategoryForm(true);
                        }}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                          cursor: "pointer", padding: "8px 4px", borderRadius: 10, background: theme.bg, boxShadow: theme.shadowRaisedSm, transition: "all 0.2s"
                        }}
                      >
                        <div style={{ fontSize: 18, marginBottom: 0, color: theme.textSecondary }}><Plus size={16} /></div>
                        <div style={{ fontSize: 9, fontWeight: 700, ...fontBody, textAlign: "center", color: theme.textSecondary }}>Add New</div>
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
                    setTransactions(t => {
                        const newArr = t.map(x => x.id === editingTxId ? updatedTx : x);
                        newArr.sort((a, b) => new Date(b.date) - new Date(a.date));
                        return newArr;
                    });
                  } else {
                    setTransactions(t => {
                        const newArr = [updatedTx, ...t];
                        newArr.sort((a, b) => new Date(b.date) - new Date(a.date));
                        return newArr;
                    });
                    markDayActive();
                  }
                  try { Haptics.impact({ style: ImpactStyle.Light }); } catch(e) {}
                  closeForm();
                }
              }} style={{ marginTop: 0, padding: "12px" }} />
            </NeoSurface>
          </div>
        ) : expenseView === "wallet" ? (
          <WalletView />
        ) : (
          <>
            {/* Back to Wallet button */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 18px 0", marginBottom: 8 }}>
              <button
                onClick={() => setExpenseView("wallet")}
                style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", color: theme.accent, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0 }}
              >
                <ChevronLeft size={18} /> Wallet
              </button>
            </div>

            <div style={{ padding: "0 18px 100px" }}>
            <div style={{ marginBottom: 24, marginTop: 8 }}>
            </div>

            {/* Row 1: Net Cashflow + Saved/Streak card */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <NeoSurface style={{ flex: 6, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
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

              {/* No-Spend Day Square Card */}
              {(() => {
                const noSpendCount = currentMonthTx.filter(t => t.category === "No Spend").length;
                const noSpendTxToday = transactions.find(t => t.category === "No Spend" && t.date === getLocalToday());
                const hasNoSpendToday = !!noSpendTxToday;
                
                const dailyAvg = getDailyAvgSpend(transactions, 30);
                const savedAmount = Math.round(dailyAvg * noSpendCount);
                
                return (
                  <NeoSurface 
                    onClick={async () => {
                      if (hasNoSpendToday) {
                        setTransactions(t => t.filter(x => x.id !== noSpendTxToday.id));
                        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
                      } else {
                        const noSpendTx = {
                          id: Date.now(),
                          type: 'expense',
                          amount: 0,
                          originalAmount: 0,
                          originalCurrency: baseCurrency,
                          exchangeRate: 1,
                          name: 'No-Spend Day 🎉',
                          desc: 'Claimed a No-Spend day!',
                          category: 'No Spend',
                          method: 'UPI',
                          date: getLocalToday(),
                          time: getLocalTime(),
                        };
                        setTransactions(t => {
                          const newArr = [noSpendTx, ...t];
                          newArr.sort((a, b) => new Date(b.date) - new Date(a.date));
                          return newArr;
                        });
                        markDayActive();
                        try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) {}
                      }
                    }}
                    pressed={hasNoSpendToday}
                    style={{
                      flex: 4, padding: "20px", cursor: "pointer", borderRadius: 20, position: "relative",
                      background: hasNoSpendToday ? theme.success + '15' : theme.bg,
                      border: hasNoSpendToday ? `1px solid ${theme.success}30` : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div
                        style={{
                          width: 44, height: 44, borderRadius: "50%", 
                          background: hasNoSpendToday ? theme.success : theme.bg,
                          boxShadow: hasNoSpendToday ? 'none' : theme.shadowRaisedSm, 
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: hasNoSpendToday ? '#fff' : theme.accent,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <PiggyBank size={18} strokeWidth={2.5} />
                      </div>
                      
                      <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                        {Array.from({ length: 7 }).map((_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - (6 - i));
                          const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                          const claimed = transactions.some(t => t.category === "No Spend" && t.date === ds);
                          const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
                          return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div style={{
                                width: 12, height: 16, borderRadius: 4,
                                background: claimed ? theme.success : theme.bg,
                                boxShadow: claimed ? theme.shadowRaisedSm : theme.shadowInset,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.3s ease'
                              }}>
                                {claimed && <Check size={8} color={theme.bg} strokeWidth={4} />}
                              </div>
                              <div style={{ fontSize: 9, color: claimed ? theme.textSecondary : theme.textSecondary + '70', fontWeight: 600 }}>
                                {dayLabel}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, ...fontBody }}>Saved</div>
                      <div style={{ color: hasNoSpendToday ? theme.success : theme.textPrimary, fontSize: 24, fontWeight: 700, ...fontDisplay, display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, marginRight: 2 }}>{getCurrencyByCode(baseCurrency).symbol}</span>
                        <SplitText
                          text={String(savedAmount)}
                          delay={50}
                          duration={0.8}
                          ease="back.out(1.7)"
                          from={{ opacity: 0, y: 15 }}
                          to={{ opacity: 1, y: 0 }}
                        />
                      </div>
                      <div style={{ color: theme.textSecondary, fontSize: 10, marginTop: 4, ...fontBody, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span>{noSpendCount} days claimed</span>
                      </div>
                    </div>
                  </NeoSurface>
                );
              })()}
            </div>

            {/* Row 2: Expenses by Category */}
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

            {/* Row 3: All Banks and Safe-to-Spend */}
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none", msOverflowStyle: "none", marginBottom: 24 }}>
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
                      <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, ...fontBody }}>{banks.length > 1 ? "All Banks" : "Bank"}</div>
                      <div style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 700, ...fontDisplay }}>{formatCurrency(bankTotal, baseCurrency)}</div>
                      {banks.length > 0 && <div style={{ color: theme.textSecondary, fontSize: 10, marginTop: 2, ...fontBody }}>{banks.length} account{banks.length !== 1 ? "s" : ""}</div>}
                    </div>
                  </NeoSurface>
                );
              })()}

              {/* Safe-to-Spend Card */}
              {(() => {
                const bankTotal = banks.reduce((s, b) => s + (parseFloat(b.balance) || 0), 0);
                const billsTotal = upcomingBills.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
                const reserve = 0; // Future savings goal integration
                const today = new Date();
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                const daysLeft = lastDay - today.getDate() + 1; // Including today
                const safeToSpendDaily = Math.max(0, (bankTotal - billsTotal - reserve) / daysLeft);
                
                return (
                  <NeoSurface style={{ minWidth: 145, flex: 1, padding: "20px", borderRadius: 20, position: "relative" }}>
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: "50%", background: theme.bg,
                        boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 16, color: theme.success
                      }}
                    >
                      <Target size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, ...fontBody }}>Safe to spend</div>
                      <div style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 700, ...fontDisplay, display: 'flex', alignItems: 'baseline' }}>
                        {formatCurrency(safeToSpendDaily, baseCurrency)}
                        <span style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 600, marginLeft: 2 }}>/d</span>
                      </div>
                      <div style={{ color: theme.textSecondary, fontSize: 10, marginTop: 4, ...fontBody }}>
                        Balance - Bills • {daysLeft} days left
                      </div>
                    </div>
                  </NeoSurface>
                );
              })()}
            </div>

            {/* Row 4: Spent this month + New button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
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
                {transactions.length === 0 ? (
                  <NeoSurface style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", borderRadius: 24, gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${theme.accent}15`, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ListChecks size={24} />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: theme.textPrimary, fontSize: 15, fontWeight: 700, ...fontDisplay, marginBottom: 4 }}>No recent transactions</div>
                      <div style={{ color: theme.textSecondary, fontSize: 13, ...fontBody }}>Add a new transaction to see it here.</div>
                    </div>
                  </NeoSurface>
                ) : (
                  transactions.slice(0, 4).map((t) => {
                    const isExp = t.type === "expense";
                    
                    if (t.category === "No Spend") {
                      const savings = Math.round(getDailyAvgSpend(transactions, 30));
                      return (
                        <SwipeRow key={t.id} onDelete={() => deleteTx(t.id)}>
                          <div onClick={() => openEdit(t)} style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, borderRadius: 20, cursor: "pointer", background: '#111713', border: `1px solid ${theme.success}10`, boxShadow: theme.shadowRaisedSm }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#18241d', display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Flame size={18} color={theme.success} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, ...fontBody, marginBottom: 2 }}>{t.name}</div>
                              <div style={{ color: theme.success, opacity: 0.7, fontSize: 11, ...fontBody }}>{t.desc} • {t.date}</div>
                            </div>
                            <div style={{ textAlign: "right", display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: theme.success, ...fontBody }}>+{getCurrencyByCode(baseCurrency).symbol}{savings}</div>
                              <div style={{ color: theme.success, opacity: 0.6, fontSize: 10, ...fontBody, marginTop: 2 }}>saved</div>
                            </div>
                          </div>
                        </SwipeRow>
                      );
                    }

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
                }))}
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
                          {/* ponytail: show category-specific icon if matches an expense category, otherwise bell */}
                          {TX_CATEGORY_ICONS[b.name] || (customCategoryIcons[b.name] ? RENDER_CUSTOM_ICON(customCategoryIcons[b.name], 16) : <Bell size={16} />)}
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
              
              {transactions.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <NeoSelect 
                    value={filterType} 
                    onChange={setFilterType} 
                    options={[
                      {value: "All", label: "All Types"},
                      {value: "Income", label: "Income"},
                      {value: "Expense", label: "Expense"}
                    ]} 
                    theme={theme} 
                    fontBody={fontBody} 
                  />
                  <NeoSelect 
                    value={filterBank} 
                    onChange={setFilterBank} 
                    options={[
                      {value: "All", label: "All Banks"},
                      {value: "UPI", label: "UPI"},
                      ...banks.map(b => ({value: b.id, label: b.bankName.substring(0, 10)}))
                    ]} 
                    theme={theme} 
                    fontBody={fontBody} 
                  />
                  <NeoSelect 
                    value={filterCategory} 
                    onChange={(val) => { setFilterCategory(val); setVisibleTxCount(20); }} 
                    options={[
                      {value: "All", label: "All Categories"},
                      ...[...new Set(transactions.map(t => t.category))].map(c => ({value: c, label: c}))
                    ]} 
                    theme={theme} 
                    fontBody={fontBody} 
                  />
                  <NeoDatePicker value={filterStartDate} onChange={setFilterStartDate} placeholder="From" style={{ height: 28, fontSize: 10, padding: "4px 8px", minWidth: 70 }} wrapperStyle={{ flex: "1 1 70px" }} />
                  <NeoDatePicker value={filterEndDate} onChange={setFilterEndDate} placeholder="To" style={{ height: 28, fontSize: 10, padding: "4px 8px", minWidth: 70 }} wrapperStyle={{ flex: "1 1 70px" }} />
                </div>
              )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(() => {
                  if (dayFiltered.length === 0) {
                    return (
                      <NeoSurface style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", borderRadius: 24, gap: 12, marginTop: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${theme.accent}15`, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Search size={24} />
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ color: theme.textPrimary, fontSize: 15, fontWeight: 700, ...fontDisplay, marginBottom: 4 }}>No transactions found</div>
                          <div style={{ color: theme.textSecondary, fontSize: 13, ...fontBody }}>{transactions.length === 0 ? "Add a new transaction to get started." : "Try adjusting your filters."}</div>
                        </div>
                      </NeoSurface>
                    );
                  }
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
                                {t.category === "No Spend" ? (
                                  <SwipeRow onDelete={() => deleteTx(t.id)}>
                                    <div onClick={() => openEdit(t)} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, borderRadius: 20, cursor: "pointer", background: '#111713', border: `1px solid ${theme.success}10`, boxShadow: theme.shadowRaisedSm }}>
                                      <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: '#18241d', display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Flame size={16} color={theme.success} />
                                      </div>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                          <span style={{ color: '#fff', fontWeight: 600, fontSize: 13.5, ...fontBody }}>{t.name}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.success, opacity: 0.7, fontSize: 11, ...fontBody }}>
                                          <span>{t.desc} • {t.date}</span>
                                        </div>
                                      </div>
                                      <div style={{ textAlign: "right", display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: theme.success, ...fontBody }}>
                                          +{getCurrencyByCode(baseCurrency).symbol}{Math.round(dailyAvgSpend)}
                                        </span>
                                        <span style={{ color: theme.success, opacity: 0.6, fontSize: 10, ...fontBody, marginTop: 2 }}>saved</span>
                                      </div>
                                    </div>
                                  </SwipeRow>
                                ) : (
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
                                )}
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
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            {(() => {
                              const IconComp = bank.icon && LucideIcons[bank.icon] ? LucideIcons[bank.icon] : Building2;
                              return (
                                <div style={{ width: 44, height: 44, borderRadius: 22, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textPrimary }}>
                                  <IconComp size={20} />
                                </div>
                              );
                            })()}
                            <div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>{bank.bankName}</div>
                              <div style={{ fontSize: 20, fontWeight: 800, color: theme.accent, marginTop: 2, ...fontDisplay }}>
                                {formatCurrency(parseFloat(bank.balance) || 0, baseCurrency)}
                              </div>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button onClick={() => setShowBankForm(false)} style={{ border: "none", background: "none", color: theme.textPrimary, cursor: "pointer" }}><ChevronLeft size={24} /></button>
                    <div style={{ fontSize: 20, fontWeight: 800, color: theme.textPrimary, ...fontDisplay }}>{editingBankId ? "Account Details" : "Add Bank"}</div>
                  </div>
                  {editingBankId && (
                    <button onClick={() => {
                      if (window.confirm("Are you sure you want to delete this bank?")) {
                        setBanks(prev => prev.filter(b => b.id !== editingBankId));
                        setShowBankForm(false);
                      }
                    }} style={{ border: "none", background: "none", color: theme.danger, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: -8, ...fontBody }}>Select Icon</div>
                  <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none", alignItems: "center" }}>
                    {BANK_ICONS.map(iconName => {
                      const IconComp = LucideIcons[iconName];
                      const isSelected = bankFormState.icon === iconName;
                      return (
                        <div 
                          key={iconName}
                          onClick={() => setBankFormState(prev => ({ ...prev, icon: iconName }))}
                          style={{
                            padding: 12, borderRadius: 16, cursor: "pointer",
                            background: isSelected ? theme.bg : "transparent",
                            boxShadow: isSelected ? theme.shadowRaisedSm : "none",
                            color: isSelected ? theme.accent : theme.textSecondary,
                            border: isSelected ? `1px solid ${theme.accent}30` : "1px solid transparent",
                            transition: "all .2s"
                          }}
                        >
                          <IconComp size={24} />
                        </div>
                      )
                    })}
                  </div>

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

                {/* --- Bank Insights & Transactions --- */}
                {editingBankId && (() => {
                  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  let bankTx = transactions.filter(t => t.account === bankFormState.bankName);
                  
                  // Chart data for last 30 days
                  const days = {};
                  for(let i=29; i>=0; i--) {
                    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    days[d] = { date: d.slice(5), income: 0, expense: 0 };
                  }
                  bankTx.forEach(t => {
                    if (t.date >= thirtyDaysAgo && days[t.date]) {
                      if (t.type === 'income') days[t.date].income += t.amount;
                      else days[t.date].expense += t.amount;
                    }
                  });
                  const chartData = Object.values(days);
                  
                  // Apply UI filters to transaction list
                  if (bankTxFilterType !== "All") bankTx = bankTx.filter(t => t.type === bankTxFilterType.toLowerCase());
                  if (bankTxFilterCategory !== "All") bankTx = bankTx.filter(t => t.category === bankTxFilterCategory);

                  return (
                    <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${theme.border}` }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, marginBottom: 16, ...fontDisplay }}>Bank Insights (30 Days)</div>
                      <NeoSurface style={{ padding: "16px 16px 16px 0", height: 200, marginBottom: 24 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.success} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={theme.success} stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.danger} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={theme.danger} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.border} />
                            <XAxis dataKey="date" tick={{fontSize: 10, fill: theme.textSecondary}} tickLine={false} axisLine={false} />
                            <YAxis tick={{fontSize: 10, fill: theme.textSecondary}} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, baseCurrency).replace(/\.\d+/, '')} width={40} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: theme.bg, borderRadius: 12, border: "none", boxShadow: theme.shadowRaised }}
                              labelStyle={{ color: theme.textSecondary, marginBottom: 4 }}
                              itemStyle={{ fontWeight: 600 }}
                            />
                            <Area type="monotone" dataKey="income" stroke={theme.success} fillOpacity={1} fill="url(#colorInc)" />
                            <Area type="monotone" dataKey="expense" stroke={theme.danger} fillOpacity={1} fill="url(#colorExp)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </NeoSurface>

                      <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, marginBottom: 16, ...fontDisplay }}>Transactions</div>
                      
                      {/* Bank Transaction Filters */}
                      {transactions.filter(t => t.account === bankFormState.bankName).length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", alignItems: "center", gap: 8, marginBottom: 16 }}>
                          <NeoSelect 
                            value={bankTxFilterType} 
                            onChange={setBankTxFilterType} 
                            options={[
                              {value: "All", label: "All Types"},
                              {value: "Income", label: "Income"},
                              {value: "Expense", label: "Expense"}
                            ]} 
                            theme={theme} 
                            fontBody={fontBody} 
                          />
                          <NeoSelect 
                            value={bankTxFilterCategory} 
                            onChange={setBankTxFilterCategory} 
                            options={[
                              {value: "All", label: "All Categories"},
                              ...[...new Set(transactions.filter(t => t.account === bankFormState.bankName).map(t => t.category))].map(c => ({value: c, label: c}))
                            ]} 
                            theme={theme} 
                            fontBody={fontBody} 
                          />
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
                        {bankTx.length === 0 && <div style={{ textAlign: "center", color: theme.textSecondary, fontSize: 13 }}>No transactions found.</div>}
                        {bankTx.map(tx => (
                          <SwipeRow key={tx.id} onSwipeRight={() => setTransactions(t => t.filter(x => x.id !== tx.id))}>
                            <NeoSurface 
                              onClick={() => {
                                setEditingTx(tx);
                                setExpenseFormState(tx);
                                setShowForm(true);
                              }}
                              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, cursor: "pointer" }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 20, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: tx.type === "income" ? theme.success : theme.danger }}>
                                  {tx.type === "income" ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, color: theme.textPrimary, fontSize: 15 }}>{tx.name}</div>
                                  <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{tx.category} • {tx.date}</div>
                                </div>
                              </div>
                              <div style={{ fontWeight: 700, color: tx.type === "income" ? theme.success : theme.textPrimary, fontSize: 16, ...fontDisplay }}>
                                {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, baseCurrency)}
                              </div>
                            </NeoSurface>
                          </SwipeRow>
                        ))}
                      </div>
                    </div>
                  );
                })()}

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

            </div> {/* end dashboard padding div */}

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
                <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, ...fontBody }}>Bill Category</div>
                {/* ponytail: replace free text with neomorphic NeoSelect category selector */}
                <NeoSelect
                  value={billFormState.name || ALL_EXPENSE_CATEGORIES[0]}
                  onChange={(val) => setBillFormState({ ...billFormState, name: val })}
                  options={ALL_EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))}
                  theme={theme}
                  fontBody={fontBody}
                />
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
                  const billName = name || ALL_EXPENSE_CATEGORIES[0];
                  if (!billName.trim() || isNaN(parseFloat(amount)) || isNaN(parseInt(daysLeft))) return;
                  if (editingBill) {
                    setUpcomingBills(bills => bills.map(x => x.id === editingBill.id ? { ...x, name: billName, amount: parseFloat(amount), daysLeft: parseInt(daysLeft) } : x));
                  } else {
                    setUpcomingBills(b => [...b, { id: Date.now(), name: billName, amount: parseFloat(amount), daysLeft: parseInt(daysLeft) }]);
                  }
                  setShowBillModal(false);
                }} style={{ flex: 1, padding: "12px 0", borderRadius: 12, fontSize: 14 }} />
              </div>
            </NeoSurface>
          </div>
        )}


          </>
        )}
      </div>
    );
  }

  