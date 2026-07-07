import { useState } from 'react';
import Icon from '../components/ui/Icon.jsx';
import '../styles/insights.css';

export default function RoutineTab({
  routine,
  getDateStr,
  toggleHabit,
  addHabit,
  deleteHabit,
  getHabitStreak,
  selectedDate,
}) {
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [habitsList, setHabitsList] = useState(routine?.habits || []);
  const [selectedHabit, setSelectedHabit] = useState(null);

  // Update local state when routine props change
  // In a real app we'd dispatch a reorder event to parent, 
  // but for now we manage local reorder state
  
  const handleDragStart = (e, idx) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    
    const newList = [...habitsList];
    const draggedItem = newList[draggedIdx];
    newList.splice(draggedIdx, 1);
    newList.splice(idx, 0, draggedItem);
    
    setDraggedIdx(idx);
    setHabitsList(newList);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    // onReorder(habitsList)
  };

  if (selectedHabit) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingTop: 16 }}>
          <button 
            className="neu-btn-circle" 
            onClick={() => setSelectedHabit(null)}
          >
            <Icon name="arrowLeft" size={20} />
          </button>
          <h2 style={{ fontSize: 20, margin: 0, color: 'var(--text-primary)' }}>{selectedHabit.title}</h2>
        </div>
        
        <div className="neu-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Current Streak</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--accent-secondary)' }}>{getHabitStreak(selectedHabit.id)}</span>
                <Icon name="flame" size={20} color="var(--accent-secondary)" />
              </div>
            </div>
          </div>
          
          <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>History</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {Array.from({length: 28}).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (27 - i));
              const ds = getDateStr(d);
              const isDone = selectedHabit.logs && selectedHabit.logs[ds];
              return (
                <div 
                  key={i}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 6,
                    background: isDone ? selectedHabit.color : 'var(--bg-app)',
                    boxShadow: isDone ? 'var(--shadow-raised-sm)' : 'var(--shadow-inset)'
                  }}
                />
              );
            })}
          </div>
        </div>
        
        <button 
          onClick={() => {
            deleteHabit(selectedHabit.id);
            setSelectedHabit(null);
            setHabitsList(habitsList.filter(h => h.id !== selectedHabit.id));
          }}
          className="neu-card"
          style={{ padding: 16, color: 'var(--priority-high)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 'none', background: 'var(--bg-app)', cursor: 'pointer' }}
        >
          <Icon name="trash" size={18} />
          <span style={{ fontSize: 15, fontWeight: 500 }}>Delete Habit</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="scroll-content" style={{ paddingBottom: 100 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {habitsList.map((habit, idx) => {
            const dateStr = getDateStr(selectedDate);
            const done = habit.logs && habit.logs[dateStr];
            const streak = getHabitStreak(habit.id);
            
            const past7Days = Array.from({length: 7}).map((_, i) => {
              const d = new Date(selectedDate || new Date());
              d.setDate(d.getDate() - (6 - i));
              const ds = getDateStr(d);
              return habit.logs && habit.logs[ds];
            });

            return (
              <div 
                key={habit.id} 
                className="neu-card" 
                style={{ padding: 16, cursor: 'pointer', opacity: draggedIdx === idx ? 0.5 : 1 }}
                onClick={() => setSelectedHabit(habit)}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ cursor: 'grab', color: 'var(--text-muted)' }}>
                    <Icon name="dots" size={20} />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>{habit.title}</span>
                  {streak > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-secondary)' }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{streak}</span>
                      <Icon name="flame" size={16} />
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  {past7Days.map((isDone, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (i === 6) {
                          toggleHabit(habit.id, selectedDate);
                          // Sync local state visually (mock)
                          const updated = [...habitsList];
                          if(!updated[idx].logs) updated[idx].logs = {};
                          updated[idx].logs[dateStr] = !done;
                          setHabitsList(updated);
                        }
                      }}
                      style={{
                        flex: 1,
                        height: 28,
                        borderRadius: 6,
                        border: 'none',
                        background: isDone ? habit.color : 'var(--bg-app)',
                        boxShadow: isDone ? 'var(--shadow-raised-sm)' : 'var(--shadow-inset)',
                        cursor: i === 6 ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                      }}
                      aria-label={`Mark ${habit.title} done for day ${i}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
