import re

with open("src/App.jsx", "r") as f:
    content = f.read()

hook_code = """
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
    } catch (error) {}
  }, [key, state]);
  return [state, setState];
};

export default function NeoApp() {"""

content = content.replace("export default function NeoApp() {", hook_code)

content = content.replace('const [history, setHistory] = useState([]);', 'const [history, setHistory] = useLocalStorage("neo_history", []);')
content = content.replace('const [transactions, setTransactions] = useState([]);', 'const [transactions, setTransactions] = useLocalStorage("neo_transactions", []);')
content = content.replace('const [todos, setTodos] = useState([]);', 'const [todos, setTodos] = useLocalStorage("neo_todos", []);')
content = content.replace('const [categoryBudgets, setCategoryBudgets] = useState({});', 'const [categoryBudgets, setCategoryBudgets] = useLocalStorage("neo_categoryBudgets", {});')
content = content.replace('const [darkMode, setDarkMode] = useState(false);', 'const [darkMode, setDarkMode] = useLocalStorage("neo_darkMode", false);')
content = content.replace('const [streak, setStreak] = useState(3);', 'const [streak, setStreak] = useLocalStorage("neo_streak", 3);')

# Add balances and upcomingBills states below categoryBudgets
new_states = """  const [categoryBudgets, setCategoryBudgets] = useLocalStorage("neo_categoryBudgets", {});
  const [balances, setBalances] = useLocalStorage("neo_balances", { bank: 14250.00, cash: 340.50 });
  const [upcomingBills, setUpcomingBills] = useLocalStorage("neo_upcomingBills", [
    { id: 1, name: "Netflix", amount: 649, daysLeft: 2 },
    { id: 2, name: "Electricity Bill", amount: 1450, daysLeft: 5 },
    { id: 3, name: "Rent", amount: 14000, daysLeft: 9 },
  ]);"""
content = content.replace('const [categoryBudgets, setCategoryBudgets] = useLocalStorage("neo_categoryBudgets", {});', new_states)

with open("src/App.jsx", "w") as f:
    f.write(content)
