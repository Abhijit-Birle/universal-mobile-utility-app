import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# 1. SEARCH_INDEX
# Remove const SEARCH_INDEX = [...];
content = re.sub(r'const SEARCH_INDEX = \[\n(.*?)\n\];\n', '', content, flags=re.DOTALL)
# And we must inject it inside NeoApp so it can access states.
neoapp_body_start = content.find("const [todos, setTodos] = useState([]);\n") + len("const [todos, setTodos] = useState([]);\n")

dynamic_search_index = """
  const searchIndex = [
    ...transactions.map(t => ({ type: "expense", icon: t.type === 'expense' ? ShoppingCart : Landmark, label: t.name, meta: `₹${t.amount.toLocaleString()} · ${t.date}`, item: t })),
    ...todos.map(t => ({ type: "todo", icon: FileText, label: t.text, meta: `${t.priority} priority`, item: t })),
    ...history.map(h => ({ type: "session", icon: TimerIcon, label: h.note || h.type, meta: `${h.minutes}m · ${h.date}`, item: h }))
  ];
"""
content = content[:neoapp_body_start] + dynamic_search_index + content[neoapp_body_start:]
# Replace SEARCH_INDEX with searchIndex
content = content.replace("SEARCH_INDEX.filter", "searchIndex.filter")

# 2. AI_INSIGHTS - remove it entirely
content = re.sub(r'const AI_INSIGHTS = \[\n(.*?)\n\];\n', '', content, flags=re.DOTALL)

# 3. LINKABLE_TODOS in TimerTab
# Replace const LINKABLE_TODOS = [...]; with dynamic
content = re.sub(r'const LINKABLE_TODOS = \[\n?(.*?)\n?\];', 'const LINKABLE_TODOS = todos.filter(t => !t.done).map(t => t.text);', content, flags=re.DOTALL)

# 4. ACCOUNTS in ExpenseTab
# It was: const ACCOUNTS = [ { id: "bank", label: "Bank", icon: Landmark, balance: 84200 }, ... ]
# We will dynamically calculate balance.
accounts_replacement = """
    // Multiple accounts/wallets dynamically calculated
    const bankBalance = transactions.filter(t => (t.method?.type === 'card' || t.method?.type === 'upi')).reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
    const cashBalance = transactions.filter(t => t.method?.type === 'cash').reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
    const ACCOUNTS = [
      { id: "bank", label: "Bank", icon: Landmark, balance: bankBalance },
      { id: "cash", label: "Cash", icon: Wallet, balance: cashBalance },
    ];
"""
content = re.sub(r'    // Multiple accounts/wallets\n    const ACCOUNTS = \[\n.*?\n    \];\n', accounts_replacement, content, flags=re.DOTALL)

# 5. BUDGETS in ExpenseTab
# It was: const BUDGETS = [ { category: "Food", budget: 6000, spent: 4120, color: "#7c6ff0" }, ... ]
budgets_replacement = """
    // Budgets dynamically calculated based on current month's transactions
    const calcSpent = (cat) => transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((sum, t) => sum + t.amount, 0);
    const BUDGETS = [
      { category: "Food", budget: 6000, spent: calcSpent("Food"), color: "#7c6ff0" },
      { category: "Transport", budget: 3000, spent: calcSpent("Transport"), color: "#3dd6c8" },
      { category: "Entertainment", budget: 2000, spent: calcSpent("Entertainment"), color: "#ffb648" },
    ];
"""
content = re.sub(r'    const BUDGETS = \[\n.*?\n    \];\n', budgets_replacement, content, flags=re.DOTALL)

# 6. UPCOMING_BILLS in ExpenseTab
# It was: const UPCOMING_BILLS = [ ... ]
upcoming_bills_replacement = """
    // Upcoming bills calculated from recurring transactions
    const UPCOMING_BILLS = transactions.filter(t => t.recurring && t.type === 'expense').map(t => ({
      name: t.name, amount: t.amount, daysLeft: 5 // Mock daysLeft for now as full date math is complex
    }));
"""
content = re.sub(r'    const UPCOMING_BILLS = \[\n.*?\n    \];\n', upcoming_bills_replacement, content, flags=re.DOTALL)

with open("src/App.jsx", "w") as f:
    f.write(content)
