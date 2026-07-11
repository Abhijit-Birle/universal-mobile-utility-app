/**
 * Natural Language Task Parser
 * Extracts due date, time, and priority from free-form text.
 * Returns { text, due, dueTime, priority } — all parsed fields stripped from text.
 *
 * Examples:
 *   "submit report tomorrow at 3pm #p1"  → { text: "submit report", due: "2026-07-13", dueTime: "15:00", priority: 1 }
 *   "buy milk today"                      → { text: "buy milk", due: "2026-07-12", priority: 4 }
 *   "call dentist next monday !2"         → { text: "call dentist", due: "2026-07-14", priority: 2 }
 */

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_FULL = ['january','february','march','april','may','june','july','august','september','october','november','december'];

function pad(n) { return String(n).padStart(2, '0'); }
function toDateStr(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

function nextWeekday(targetDay, fromDate = new Date()) {
  const d = new Date(fromDate);
  const diff = (targetDay - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function parseTime(str) {
  // "3pm" | "3:30pm" | "15:00" | "noon" | "midnight"
  if (str === 'noon') return '12:00';
  if (str === 'midnight') return '00:00';
  const m12 = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (m12) {
    let h = parseInt(m12[1]);
    const min = m12[2] || '00';
    if (m12[3].toLowerCase() === 'pm' && h !== 12) h += 12;
    if (m12[3].toLowerCase() === 'am' && h === 12) h = 0;
    return `${pad(h)}:${min}`;
  }
  const m24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = parseInt(m24[1]);
    if (h >= 0 && h <= 23) return `${pad(h)}:${m24[2]}`;
  }
  return null;
}

/**
 * Main export: parse a raw task string.
 * @param {string} raw - The raw user input
 * @returns {{ text: string, due: string|null, dueTime: string|null, priority: number }}
 */
export function parseTask(raw) {
  let s = raw.trim();
  const today = new Date();
  let due = null;
  let dueTime = null;
  let priority = 4; // default = no priority

  // --- Priority ---
  // Matches: #p1 #p2 #p3 #p4 | !1 !2 !3 | !! !!! | p1 p2 p3
  s = s.replace(/(?:#p|!|p)([1-4])\b/gi, (_, n) => { priority = parseInt(n); return ''; });
  s = s.replace(/!!!\s*/g, () => { priority = 1; return ''; });
  s = s.replace(/!!\s*/g, () => { priority = 2; return ''; });

  // --- Time: "at 3pm" | "at 14:00" | "at noon" ---
  s = s.replace(/\bat\s+(noon|midnight|\d{1,2}(?::\d{2})?\s*(?:am|pm)|\d{1,2}:\d{2})\b/gi, (_, t) => {
    const parsed = parseTime(t.toLowerCase().replace(/\s/g, ''));
    if (parsed) dueTime = parsed;
    return '';
  });

  // --- Relative dates ---
  if (/\btoday\b/i.test(s)) {
    due = toDateStr(today);
    s = s.replace(/\btoday\b/gi, '');
  } else if (/\btomorrow\b/i.test(s)) {
    const d = new Date(today); d.setDate(d.getDate() + 1);
    due = toDateStr(d);
    s = s.replace(/\btomorrow\b/gi, '');
  } else if (/\bovernight\b/i.test(s)) {
    const d = new Date(today); d.setDate(d.getDate() + 1);
    due = toDateStr(d);
    s = s.replace(/\bovernight\b/gi, '');
  }

  // "next monday" / "next week"
  if (!due) {
    s = s.replace(/\bnext\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, (match, word) => {
      if (word.toLowerCase() === 'week') {
        const d = new Date(today); d.setDate(d.getDate() + 7);
        due = toDateStr(d);
      } else {
        const dayIdx = DAYS.indexOf(word.toLowerCase());
        if (dayIdx !== -1) due = toDateStr(nextWeekday(dayIdx));
      }
      return '';
    });
  }

  // "this monday" / "monday"
  if (!due) {
    s = s.replace(/\b(?:this\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, (match, word) => {
      const dayIdx = DAYS.indexOf(word.toLowerCase());
      if (dayIdx !== -1) {
        const d = new Date(today);
        const diff = (dayIdx - d.getDay() + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
        due = toDateStr(d);
      }
      return '';
    });
  }

  // "in N days/weeks"
  if (!due) {
    s = s.replace(/\bin\s+(\d+)\s+(day|days|week|weeks)\b/gi, (match, n, unit) => {
      const d = new Date(today);
      const num = parseInt(n);
      d.setDate(d.getDate() + (unit.startsWith('week') ? num * 7 : num));
      due = toDateStr(d);
      return '';
    });
  }

  // "jan 15" / "15 jan" / "january 15" / "15th"
  if (!due) {
    // "jan 15" or "january 15"
    s = s.replace(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\b/gi, (match, mon, day) => {
      const mIdx = MONTHS.indexOf(mon.slice(0, 3).toLowerCase());
      if (mIdx !== -1) {
        const d = new Date(today.getFullYear(), mIdx, parseInt(day));
        if (d < today) d.setFullYear(today.getFullYear() + 1);
        due = toDateStr(d);
      }
      return '';
    });

    // "15 jan"
    if (!due) {
      s = s.replace(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/gi, (match, day, mon) => {
        const mIdx = MONTHS.indexOf(mon.slice(0, 3).toLowerCase());
        if (mIdx !== -1) {
          const d = new Date(today.getFullYear(), mIdx, parseInt(day));
          if (d < today) d.setFullYear(today.getFullYear() + 1);
          due = toDateStr(d);
        }
        return '';
      });
    }
  }

  // Clean up extra spaces
  const text = s.replace(/\s{2,}/g, ' ').trim();

  return { text: text || raw.trim(), due, dueTime, priority };
}

/** Priority metadata */
export const PRIORITY_CONFIG = {
  1: { label: 'P1', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', name: 'Urgent' },
  2: { label: 'P2', color: '#f97316', bg: 'rgba(249,115,22,0.15)', name: 'High' },
  3: { label: 'P3', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', name: 'Medium' },
  4: { label: 'P4', color: null, bg: null, name: 'None' },
};
