import re

# 1. Read NeoApp 2.tsx
with open("NeoApp 2.tsx", "r") as f:
    orig = f.read()

# Extract TimerTab
start_idx = orig.find("  function TimerTab() {")
end_idx = orig.find("  function ExpenseTab() {")
if start_idx == -1 or end_idx == -1:
    print("Could not find TimerTab boundaries in orig!")
    exit(1)

timer_tab_code = orig[start_idx:end_idx]

# Remove the function definition and closing brace
timer_tab_code = timer_tab_code.replace("  function TimerTab() {", "  const renderTimerTab = () => {")

# Extract and remove all hooks
hooks_to_hoist = []
lines = timer_tab_code.split('\n')
new_lines = []
in_history = False
for line in lines:
    if "const [history, setHistory] = useState" in line:
        in_history = True
        continue
    if in_history:
        if "]);" in line:
            in_history = False
        continue
    
    if "useState(" in line or "useRef(" in line:
        if "const [history" not in line:
            hooks_to_hoist.append(line)
        continue
    
    new_lines.append(line)

timer_tab_code = '\n'.join(new_lines)


# 2. Read src/App.jsx
with open("src/App.jsx", "r") as f:
    app = f.read()

# Remove old hooks if they exist in App.jsx to avoid duplicates
old_hooks_to_remove = [
    "const [mode, setMode]",
    "const [pomoPhase, setPomoPhase]",
    "const [pomoCount, setPomoCount]",
    "const [duration, setDuration]",
    "const [remaining, setRemaining]",
    "const [isRunning, setIsRunning]",
    "const [name, setName]",
    "const [showNoteModal, setShowNoteModal]",
    "const [sessionNote, setSessionNote]",
]
app_lines = app.split('\n')
clean_app_lines = []
for line in app_lines:
    if any(h in line for h in old_hooks_to_remove):
        continue
    if "const totalMinutes =" in line:
        continue
    clean_app_lines.append(line)

app = '\n'.join(clean_app_lines)

# Inject hooks
hooks_str = "\n".join(hooks_to_hoist) + "\n  const [showNoteModal, setShowNoteModal] = useState(false);\n  const [sessionNote, setSessionNote] = useState(\"\");\n"
app = app.replace('  const [history, setHistory] = useState([]);', '  const [history, setHistory] = useState([]);\n' + hooks_str)


# Replace renderTimerTab
start_idx_app = app.find("  const renderTimerTab = () => {")
end_idx_app = app.find("  // Bill reminders")
if start_idx_app == -1 or end_idx_app == -1:
    print("Could not find renderTimerTab boundaries in app!")
    exit(1)

app = app[:start_idx_app] + timer_tab_code + "\n" + app[end_idx_app:]

with open("src/App.jsx", "w") as f:
    f.write(app)
print("TimerTab restored successfully!")
