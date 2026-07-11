import { generateId as generateExpenseId } from '../hooks/useExpenses.js';
import { generateId as generateTodoId } from '../hooks/useTodos.js';

// --- Utility: Parse CSV ---
function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/["\r]/g, '').trim().toLowerCase());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].replace(/\r/g, '');
    if (!rawLine.trim()) continue;
    
    // Naive CSV parser that handles quotes
    const cols = [];
    let cur = '';
    let inQuote = false;
    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        cols.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    cols.push(cur.trim());
    
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] || '';
    });
    rows.push(row);
  }
  return { headers, rows };
}

// --- Parsers ---

export function detectApp(text, filename) {
  const name = filename.toLowerCase();
  if (name.includes('ynab') || text.includes('Category Group/Category')) return 'YNAB';
  if (name.includes('mint') || text.includes('Original Description')) return 'Mint';
  if (name.includes('todoist') || text.includes('"items"') || text.includes('"projects"')) return 'Todoist';
  return 'Unknown';
}

function formatDateToISO(dateStr) {
  if (!dateStr) return null;
  // Handle MM/DD/YYYY or YYYY-MM-DD
  const m = dateStr.match(/(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})/);
  if (!m) return null;
  
  let y, mo, d;
  if (m[1].length === 4) { y = m[1]; mo = m[2]; d = m[3]; } // YYYY-MM-DD
  else { y = m[3]; mo = m[1]; d = m[2]; } // MM/DD/YYYY
  
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

export function parseYNAB(text) {
  const { rows } = parseCSV(text);
  const expenses = [];
  
  rows.forEach(r => {
    // YNAB: Date, Payee, Category Group/Category, Memo, Outflow, Inflow
    const date = formatDateToISO(r.date);
    if (!date) return;
    
    const outflow = parseFloat((r.outflow || '0').replace(/[^\d.-]/g, ''));
    const inflow = parseFloat((r.inflow || '0').replace(/[^\d.-]/g, ''));
    
    if (outflow === 0 && inflow === 0) return; // Ignore zero transactions
    
    // In our app, we only support expense mapping easily, but let's record negative amounts for income if needed, or skip.
    // For simplicity, we import all as expenses (amount > 0) or income (amount < 0)
    let amount = outflow > 0 ? outflow : -inflow; 
    if (amount <= 0) return; // Skip income for now, or map it properly later. Let's stick to positive expenses.
    
    const catRaw = r['category group/category'] || 'other';
    // Mappings can be added here
    const category = 'other'; // default
    
    expenses.push({
      id: generateExpenseId(),
      amount: amount,
      currency: 'USD', // YNAB often USD, user can change later
      category: category,
      originalCategory: catRaw,
      note: `${r.payee || ''} ${r.memo ? `(${r.memo})` : ''}`.trim(),
      date: date,
      recurring: false,
      createdAt: new Date().toISOString()
    });
  });
  
  return { type: 'expenses', data: expenses, rawCount: rows.length };
}

export function parseMint(text) {
  const { rows } = parseCSV(text);
  const expenses = [];
  
  rows.forEach(r => {
    // Mint: Date, Description, Original Description, Amount, Transaction Type, Category, Account Name
    const date = formatDateToISO(r.date);
    if (!date) return;
    
    let amount = parseFloat((r.amount || '0').replace(/[^\d.-]/g, ''));
    if (isNaN(amount)) return;
    
    // If it's a credit, it's income. Skip for now.
    if (r['transaction type']?.toLowerCase() === 'credit') return;
    
    const catRaw = r.category || 'other';
    
    expenses.push({
      id: generateExpenseId(),
      amount: amount,
      currency: 'USD',
      category: 'other', 
      originalCategory: catRaw,
      note: r.description || r['original description'] || '',
      date: date,
      recurring: false,
      createdAt: new Date().toISOString()
    });
  });
  
  return { type: 'expenses', data: expenses, rawCount: rows.length };
}

export function parseTodoist(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { error: 'Invalid JSON' };
  }
  
  const tasks = data.items || [];
  const todos = [];
  
  // Map priorities (Todoist: 4=urgent, 1=normal) -> (Ours: 1=urgent, 4=normal)
  const mapPriority = (p) => {
    if (p === 4) return 1;
    if (p === 3) return 2;
    if (p === 2) return 3;
    return 4;
  };
  
  tasks.forEach(t => {
    if (!t.content) return;
    // Skip if it's a section or archived usually
    if (t.is_deleted || t.is_archived) return;
    
    let dueStr = null;
    let dueTime = null;
    if (t.due && t.due.date) {
      dueStr = t.due.date.substring(0, 10);
      if (t.due.date.includes('T')) {
        dueTime = t.due.date.substring(11, 16);
      }
    }
    
    todos.push({
      id: generateTodoId(),
      text: t.content,
      done: !!t.is_completed,
      important: t.priority === 4,
      priority: mapPriority(t.priority),
      myDayDate: null,
      due: dueStr,
      dueTime: dueTime,
      reminder: null,
      note: t.description || '',
      listId: 'default', // Might map projects to lists later
      subtasks: [], 
      _parentId: t.parent_id || null, // Temporary for tree building
      _id: t.id // temporary map
    });
  });
  
  // Reconstruct subtasks (1 level deep for simplicity)
  const rootTodos = todos.filter(t => !t._parentId);
  const subTodos = todos.filter(t => t._parentId);
  
  subTodos.forEach(st => {
    const parent = rootTodos.find(rt => rt._id === st._parentId);
    if (parent) {
      parent.subtasks.push({
        id: generateTodoId(),
        text: st.text,
        done: st.done,
        subtasks: []
      });
    }
  });
  
  // Cleanup temp fields
  rootTodos.forEach(t => {
    delete t._parentId;
    delete t._id;
  });
  
  return { type: 'todos', data: rootTodos, rawCount: tasks.length };
}
