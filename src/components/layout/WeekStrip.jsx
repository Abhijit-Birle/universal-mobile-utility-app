import React, { useEffect, useRef } from 'react';
import './WeekStrip.css';

export default function WeekStrip({ selectedDate, onSelectDate }) {
  const containerRef = useRef(null);

  // Generate a window of days around the selected date (-14 to +14 days)
  const days = [];
  const baseDate = new Date(); // anchor window on today
  baseDate.setHours(0, 0, 0, 0);

  for (let i = -14; i <= 14; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    days.push(d);
  }

  // Scroll active day into view on mount or when selectedDate changes
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector('.week-strip-day.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  return (
    <div className="week-strip-container" ref={containerRef}>
      {days.map((d) => {
        const isSelected = d.toDateString() === selectedDate.toDateString();
        const isToday = d.toDateString() === new Date().toDateString();
        
        return (
          <button
            key={d.toISOString()}
            className={`week-strip-day ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''}`}
            onClick={() => onSelectDate(d)}
          >
            <span className="day-name">
              {d.toLocaleDateString(undefined, { weekday: 'short' })}
            </span>
            <span className="day-number">
              {d.getDate()}
            </span>
            {isToday && <div className="today-dot" />}
          </button>
        );
      })}
    </div>
  );
}
