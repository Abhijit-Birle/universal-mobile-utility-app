import { useMemo } from 'react';
import Icon from '../components/ui/Icon.jsx';
import '../styles/insights.css';

export default function InsightsTab({
  routine,
  getDateStr,
  expenses = [],
  timerState = {},
}) {
  const { history = [] } = timerState;

  // Calculate Avg Daily Spend (this month)
  const avgDailySpend = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let totalSpend = 0;
    expenses.forEach(e => {
      const d = new Date(e.createdAt);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        totalSpend += (e.amount || 0);
      }
    });

    return Math.round(totalSpend / Math.max(1, now.getDate())); // Avg over days passed so far
  }, [expenses]);

  // Calculate Total Study Hours (from history)
  const totalStudyHours = useMemo(() => {
    const totalSecs = history.reduce((sum, session) => sum + (session.durationSeconds || 0), 0);
    return Math.round(totalSecs / 3600);
  }, [history]);

  // Longest streak for habits
  const longestStreak = useMemo(() => {
    if (!routine || !routine.habits || routine.habits.length === 0) return 0;
    
    let globalMax = 0;
    routine.habits.forEach(habit => {
      let max = 0;
      let current = 0;
      // Simple streak calc based on sorted logs
      if (habit.logs) {
        const sortedDates = Object.keys(habit.logs).sort();
        if (sortedDates.length > 0) {
          let prevDate = new Date(sortedDates[0]);
          if (habit.logs[sortedDates[0]]) {
            current = 1;
            max = 1;
          }
          for (let i = 1; i < sortedDates.length; i++) {
            const curDate = new Date(sortedDates[i]);
            const diff = Math.round((curDate - prevDate) / (1000 * 60 * 60 * 24));
            if (habit.logs[sortedDates[i]]) {
              if (diff === 1) {
                current++;
              } else if (diff > 1) {
                current = 1;
              }
              max = Math.max(max, current);
            }
            prevDate = curDate;
          }
        }
      }
      globalMax = Math.max(globalMax, max);
    });
    return globalMax;
  }, [routine]);

  // Current streak for habits (max across all habits)
  const currentStreak = useMemo(() => {
    if (!routine || !routine.habits || routine.habits.length === 0) return 0;
    
    let maxStreak = 0;
    const today = new Date();
    const todayStr = getDateStr(today);
    
    routine.habits.forEach(habit => {
      let streak = 0;
      let d = new Date();
      while (true) {
        const ds = getDateStr(d);
        if (habit.logs && habit.logs[ds]) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else {
          // Allow missing today, but not yesterday
          if (ds === todayStr) {
            d.setDate(d.getDate() - 1);
          } else {
            break;
          }
        }
      }
      maxStreak = Math.max(maxStreak, streak);
    });
    return maxStreak;
  }, [routine, getDateStr]);

  // Past 7 Days Data
  const last7Days = useMemo(() => {
    return Array.from({length: 7}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: getDateStr(d),
        label: d.toLocaleDateString('en-US', { weekday: 'narrow' }) // 'M', 'T', etc.
      };
    });
  }, [getDateStr]);

  // Spend Trend Data (Last 7 Days)
  const spendTrend = useMemo(() => {
    return last7Days.map(({ dateStr }) => {
      const spend = expenses
        .filter(e => getDateStr(new Date(e.createdAt)) === dateStr)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      return spend;
    });
  }, [expenses, last7Days, getDateStr]);

  // Study Time Trend Data (Last 7 Days)
  const studyTrend = useMemo(() => {
    return last7Days.map(({ dateStr }) => {
      const secs = history
        .filter(h => h.date === dateStr)
        .reduce((sum, h) => sum + (h.durationSeconds || 0), 0);
      return Math.round(secs / 60); // In minutes
    });
  }, [history, last7Days]);

  // Generate SVG polyline points
  const getPolylinePoints = (data) => {
    if (!data || data.length === 0) return "";
    const maxVal = Math.max(...data, 1); // Avoid division by zero
    return data.map((val, i) => {
      const x = (i / (data.length - 1)) * 300;
      // y is inverted because 0 is at the top of the SVG
      const y = 100 - (val / maxVal) * 80; // 20px padding at top
      return `${x},${y}`;
    }).join(' ');
  };

  const spendPoints = getPolylinePoints(spendTrend);
  const studyPoints = getPolylinePoints(studyTrend);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="scroll-content" style={{ paddingBottom: 100 }}>
        
        {/* Summary Cards */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div className="neu-card" style={{ flex: '1 1 calc(50% - 6px)', padding: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Avg Daily Spend</span>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>₹{avgDailySpend.toLocaleString('en-IN')}</div>
          </div>
          <div className="neu-card" style={{ flex: '1 1 calc(50% - 6px)', padding: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Focus Hours</span>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent-primary)', marginTop: 4 }}>{totalStudyHours}h</div>
          </div>
          <div className="neu-card" style={{ flex: '1 1 calc(50% - 6px)', padding: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Max Current Streak</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent-secondary)' }}>{currentStreak}</span>
              <Icon name="flame" size={16} color="var(--accent-secondary)" />
            </div>
          </div>
          <div className="neu-card" style={{ flex: '1 1 calc(50% - 6px)', padding: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Longest Streak</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{longestStreak}</span>
              <Icon name="flame" size={16} color="var(--text-primary)" />
            </div>
          </div>
        </div>

        {/* Study Time Trend */}
        <div className="neu-card" style={{ marginBottom: 24, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Focus Time Trend</h3>
          </div>
          <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative' }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} preserveAspectRatio="none" viewBox="0 0 300 120">
              <polyline 
                points={studyPoints} 
                fill="none" 
                stroke="var(--accent-primary)" 
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(139, 124, 246, 0.4))' }}
              />
            </svg>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', position: 'absolute', bottom: -20, left: 0 }}>
              {last7Days.map(({ label }, i) => (
                <span key={i} style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 24 }} />
        </div>

        {/* Spend Trend */}
        <div className="neu-card" style={{ marginBottom: 24, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Spend Trend</h3>
          </div>
          <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative' }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} preserveAspectRatio="none" viewBox="0 0 300 120">
              <polyline 
                points={spendPoints}
                fill="none" 
                stroke="var(--accent-secondary)" 
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(224, 138, 92, 0.4))' }}
              />
            </svg>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', position: 'absolute', bottom: -20, left: 0 }}>
              {last7Days.map(({ label }, i) => (
                <span key={i} style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 24 }} />
        </div>

        {/* Habit Heatmaps */}
        {routine && routine.habits && routine.habits.length > 0 && (
          <div className="neu-card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>Habit Consistency (28 Days)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {routine.habits.map(habit => {
                const past28Days = Array.from({length: 28}).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (27 - i));
                  const ds = getDateStr(d);
                  return habit.logs && habit.logs[ds];
                });

                return (
                  <div key={habit.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{habit.title}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                      {past28Days.map((isDone, idx) => (
                        <div 
                          key={idx}
                          style={{
                            aspectRatio: '1',
                            borderRadius: 4,
                            background: isDone ? habit.color : 'var(--bg-app)',
                            boxShadow: isDone ? 'var(--shadow-raised-sm)' : 'var(--shadow-inset)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
