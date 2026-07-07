import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# Remove export button
export_button_regex = r'<div style={{ display: "flex", gap: 10, marginTop: 16 }}>\s*<button.*?Download CSV.*?</button>\s*<button.*?Export PDF.*?</button>\s*</div>'
content = re.sub(export_button_regex, '', content, flags=re.DOTALL)

# Also there might be a different format for the export button, let's just search for Export PDF
if "Export PDF" in content:
    # Let's find the exact lines
    lines = content.split('\n')
    out_lines = []
    skip = False
    for i, line in enumerate(lines):
        if "Download CSV" in line or "Export PDF" in line:
            # We want to remove this button and its container if any
            pass
    # Actually, let's just use regex on "Download CSV"
    content = re.sub(r'<button[^>]*>.*?Download CSV.*?</button>', '', content, flags=re.DOTALL)
    content = re.sub(r'<button[^>]*>.*?Export PDF.*?</button>', '', content, flags=re.DOTALL)
    
# Fix add transaction modal height
# find: <NeoSurface style={{ padding: 20, width: "100%", maxWidth: 360 }}>
# replace with: <NeoSurface style={{ padding: 20, width: "100%", maxWidth: 360, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
# and wrap the form contents in an overflow div, OR just add overflowY: "auto" to NeoSurface
content = content.replace(
    '<NeoSurface style={{ padding: 20, width: "100%", maxWidth: 360 }}>',
    '<NeoSurface style={{ padding: 20, width: "100%", maxWidth: 360, maxHeight: "90vh", overflowY: "auto" }}>'
)

# REFACTOR: Move tabs out of NeoApp
# We'll use AST or smart regex. 
# It's better to pass a shared "appContext" prop to avoid prop drilling.
# Wait, parsing this with regex is hard. Let's do it by finding the function boundaries.

def extract_function(name, content):
    start_str = f"function {name}() {{"
    start_idx = content.find(start_str)
    if start_idx == -1: return "", content
    
    # find matching brace
    open_braces = 0
    end_idx = -1
    for i in range(start_idx + len(start_str) - 1, len(content)):
        if content[i] == '{':
            open_braces += 1
        elif content[i] == '}':
            open_braces -= 1
            if open_braces == 0:
                end_idx = i + 1
                break
    
    func_code = content[start_idx:end_idx]
    new_content = content[:start_idx] + content[end_idx:]
    return func_code, new_content

timer_tab, content = extract_function("TimerTab", content)
expense_tab, content = extract_function("ExpenseTab", content)
todo_tab, content = extract_function("TodoTab", content)
insights_tab, content = extract_function("InsightsTab", content)

# Now insert them before NeoApp
neoapp_start = content.find("export default function NeoApp() {")

# Change signatures
timer_tab = timer_tab.replace("function TimerTab() {", "function TimerTab({ theme, fontBody, fontDisplay, history, setHistory, darkMode }) {")
expense_tab = expense_tab.replace("function ExpenseTab() {", "function ExpenseTab({ theme, fontBody, fontDisplay, transactions, setTransactions, categoryBudgets, setCategoryBudgets }) {")
todo_tab = todo_tab.replace("function TodoTab() {", "function TodoTab({ theme, fontBody, fontDisplay, todos, setTodos, darkMode }) {")
insights_tab = insights_tab.replace("function InsightsTab() {", "function InsightsTab({ theme, fontBody, fontDisplay, transactions, todos, history, apiKey, darkMode }) {")

# Fix missing dependencies in the extracted components
# Some might use `activeTab` or other global things? 
# TimerTab uses: theme, fontBody, fontDisplay, history, setHistory, darkMode
# ExpenseTab uses: theme, fontBody, fontDisplay, transactions, setTransactions, categoryBudgets, setCategoryBudgets
# TodoTab uses: theme, fontBody, fontDisplay, todos, setTodos, darkMode
# InsightsTab uses: theme, fontBody, fontDisplay, transactions, todos, history, apiKey, darkMode
# Are there any shared helper functions they use?
# fmtClock, fmtDate, autoCategorizeTodo, PRIORITY_COLOR, etc.
# We need to make sure those are defined OUTSIDE NeoApp or passed as props.
