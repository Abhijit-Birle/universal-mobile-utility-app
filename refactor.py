import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# Remove export button
content = re.sub(r'<div style={{ display: "flex", gap: 10, marginTop: 16 }}>\s*<button[^>]*>.*?Download CSV.*?</button>\s*<button[^>]*>.*?Export PDF.*?</button>\s*</div>', '', content, flags=re.DOTALL)
# Also remove any standalone export buttons if the above regex fails
content = re.sub(r'<button[^>]*>.*?Download CSV.*?</button>', '', content, flags=re.DOTALL)
content = re.sub(r'<button[^>]*>.*?Export PDF.*?</button>', '', content, flags=re.DOTALL)

# Add overflow to Add transaction modal
content = content.replace(
    '<NeoSurface style={{ padding: 20, width: "100%", maxWidth: 360 }}>',
    '<NeoSurface style={{ padding: 20, width: "100%", maxWidth: 360, maxHeight: "90vh", overflowY: "auto" }}>'
)
content = content.replace(
    '<NeoSurface style={{ padding: 20, width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 14 }}>',
    '<NeoSurface style={{ padding: 20, width: "100%", maxWidth: 360, maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>'
)

# Move states
timer_states = """
  // Timer States
  const [mode, setMode] = useState("standard");
  const [pomoPhase, setPomoPhase] = useState("Focus");
  const [pomoCount, setPomoCount] = useState(0);
  const [duration, setDuration] = useState("01:00");
  const totalMinutes = parseInt(duration.split(":")[0]) * 60 + parseInt(duration.split(":")[1]);
  const [remaining, setRemaining] = useState(totalMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [name, setName] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [sessionNote, setSessionNote] = useState("");

  useEffect(() => {
    if (!isRunning) setRemaining(totalMinutes * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalMinutes]);

  useEffect(() => {
    let interval;
    if (isRunning && remaining > 0) {
      interval = setInterval(() => setRemaining((r) => r - 1), 1000);
    } else if (remaining <= 0 && isRunning) {
      setIsRunning(false);
      if (mode === "pomodoro") {
        if (pomoPhase === "Focus") {
          setHistory((h) => [
            { id: Date.now(), name: name || autoTimerName(totalMinutes), totalMinutes, date: "Just now" },
            ...h,
          ]);
          if (pomoCount % 4 === 3) {
            setPomoPhase("Long Break");
            setRemaining(15 * 60);
          } else {
            setPomoPhase("Short Break");
            setRemaining(5 * 60);
          }
        } else {
          setPomoPhase("Focus");
          setPomoCount((c) => c + 1);
          setRemaining(totalMinutes * 60);
        }
      } else {
        setHistory((h) => [
          { id: Date.now(), name: name || autoTimerName(totalMinutes), totalMinutes, date: "Just now" },
          ...h,
        ]);
        setShowNoteModal(true);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, remaining, mode, pomoPhase, pomoCount, name, totalMinutes, setHistory]);
"""

expense_states = """
  // Expense States
  const [showForm, setShowForm] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState("Food");
  const [newType, setNewType] = useState("expense");
  const [newDate, setNewDate] = useState("");
  const [activeAccount, setActiveAccount] = useState("bank");
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editCategory, setEditCategory] = useState("Food");
  const [editBudgetVal, setEditBudgetVal] = useState("");
"""

todo_states = """
  // Todo States
  const [showTaskOptions, setShowTaskOptions] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newRecurringDays, setNewRecurringDays] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
"""

insights_states = """
  // Insights States
  const [aiQuery, setAiQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
"""

# Insert all states at the top of NeoApp, after setCategoryBudgets
insert_point = content.find('const [categoryBudgets, setCategoryBudgets] = useState({});')
if insert_point != -1:
    insert_point = content.find('\n', insert_point) + 1
    content = content[:insert_point] + timer_states + expense_states + todo_states + insights_states + content[insert_point:]

# Now, we need to REMOVE the local state definitions from the tab functions,
# and change them to `const renderTabName = () => {`

def strip_states(func_name, content, patterns_to_remove):
    # Find start of function
    start_str = f"function {func_name}() {{"
    start_idx = content.find(start_str)
    if start_idx == -1:
        return content
    
    # Replace function declaration
    content = content[:start_idx] + f"const {func_name} = () => {{" + content[start_idx+len(start_str):]
    
    # Now we need to remove the matching patterns inside the function body
    # We will just do global replacements for these specific lines, since they are unique enough
    for p in patterns_to_remove:
        content = re.sub(p, '', content, flags=re.DOTALL)
        
    return content

content = strip_states("TimerTab", content, [
    r'\s*const \[mode, setMode\] = useState\("standard"\);',
    r'\s*const \[pomoPhase, setPomoPhase\] = useState\("Focus"\);[^\n]*',
    r'\s*const \[pomoCount, setPomoCount\] = useState\(0\);',
    r'\s*const \[duration, setDuration\] = useState\("01:00"\);',
    r'\s*const totalMinutes = parseInt\(duration\.split\(":"\)\[0\]\) \* 60 \+ parseInt\(duration\.split\(":"\)\[1\]\);',
    r'\s*const \[remaining, setRemaining\] = useState\(totalMinutes \* 60\);',
    r'\s*const \[isRunning, setIsRunning\] = useState\(false\);',
    r'\s*const \[name, setName\] = useState\(""\);',
    r'\s*const \[showNoteModal, setShowNoteModal\] = useState\(false\);',
    r'\s*const \[sessionNote, setSessionNote\] = useState\(""\);',
    r'\s*useEffect\(\(\) => \{.*?\}, \[totalMinutes\]\);',
    r'\s*useEffect\(\(\) => \{.*?clearInterval\(interval\);\s*\}, \[.*?\]\);'
])

content = strip_states("ExpenseTab", content, [
    r'\s*const \[showForm, setShowForm\] = useState\(false\);',
    r'\s*const \[newAmount, setNewAmount\] = useState\(""\);',
    r'\s*const \[newDesc, setNewDesc\] = useState\(""\);',
    r'\s*const \[newCat, setNewCat\] = useState\("Food"\);',
    r'\s*const \[newType, setNewType\] = useState\("expense"\);',
    r'\s*const \[newDate, setNewDate\] = useState\(""\);',
    r'\s*const \[activeAccount, setActiveAccount\] = useState\("bank"\);',
    r'\s*const \[showBudgetModal, setShowBudgetModal\] = useState\(false\);',
    r'\s*const \[editCategory, setEditCategory\] = useState\("Food"\);',
    r'\s*const \[editBudgetVal, setEditBudgetVal\] = useState\(""\);',
])

content = strip_states("TodoTab", content, [
    r'\s*const \[showTaskOptions, setShowTaskOptions\] = useState\(false\);',
    r'\s*const \[newTask, setNewTask\] = useState\(""\);',
    r'\s*const \[newPriority, setNewPriority\] = useState\("Medium"\);',
    r'\s*const \[newRecurringDays, setNewRecurringDays\] = useState\(\[\]\);',
    r'\s*const \[searchQuery, setSearchQuery\] = useState\(""\);'
])

content = strip_states("InsightsTab", content, [
    r'\s*const \[aiQuery, setAiQuery\] = useState\(""\);',
    r'\s*const \[isAiLoading, setIsAiLoading\] = useState\(false\);',
    r'\s*const \[aiResponse, setAiResponse\] = useState\(""\);'
])

# Finally, replace `<TimerTab />` with `{TimerTab()}`
content = content.replace('<TimerTab />', '{TimerTab()}')
content = content.replace('<ExpenseTab />', '{ExpenseTab()}')
content = content.replace('<TodoTab />', '{TodoTab()}')
content = content.replace('<InsightsTab />', '{InsightsTab()}')

with open("src/App.jsx", "w") as f:
    f.write(content)
