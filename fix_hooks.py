import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# 1. Hoist TodoTab state
todo_states = """  // Todo States
  const [todoInput, setTodoInput] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [newPriority, setNewPriority] = useState("Medium");
  const [showReminder, setShowReminder] = useState(false);
  const [showTaskOptions, setShowTaskOptions] = useState(false);
  const [newRecurringDays, setNewRecurringDays] = useState([]);
"""
# 2. Hoist InsightsTab state
insights_states = """  // Insights States
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
"""

# Insert these at the top of NeoApp, e.g., after activeTab
content = content.replace('  const [activeTab, setActiveTab] = useState("timer");', '  const [activeTab, setActiveTab] = useState("timer");\n' + todo_states + insights_states)

# 3. Rename components to render functions
content = content.replace('const TodoTab = () => {', 'const renderTodoTab = () => {')
content = content.replace('const InsightsTab = () => {', 'const renderInsightsTab = () => {')

# 4. Remove the original state declarations in TodoTab
content = re.sub(r'\s*const \[input, setInput\] = useState\(""\);\n', '\n', content)
content = re.sub(r'\s*const \[expandedId, setExpandedId\] = useState\(null\);\n', '\n', content)
content = re.sub(r'\s*const \[newPriority, setNewPriority\] = useState\("Medium"\);\n', '\n', content)
content = re.sub(r'\s*const \[showReminder, setShowReminder\] = useState\(false\);\n', '\n', content)
content = re.sub(r'\s*const \[showTaskOptions, setShowTaskOptions\] = useState\(false\);\n', '\n', content)
content = re.sub(r'\s*const \[newRecurringDays, setNewRecurringDays\] = useState\(\[\]\);\n', '\n', content)

# Replace 'input' with 'todoInput' in TodoTab logic
# (Only doing this for TodoTab logic)
# To avoid replacing 'input' where it means something else (like <input>), we will do specific replaces
content = content.replace('!input.trim()', '!todoInput.trim()')
content = content.replace('text: input.trim()', 'text: todoInput.trim()')
content = content.replace('value={input}', 'value={todoInput}')
content = content.replace('onChange={(e) => setInput(e.target.value)}', 'onChange={(e) => setTodoInput(e.target.value)}')
content = content.replace('setInput("");', 'setTodoInput("");')

# 5. Remove original state declarations in InsightsTab
content = re.sub(r'\s*const \[query, setQuery\] = useState\(""\);\n', '\n', content)
content = re.sub(r'\s*const \[loading, setLoading\] = useState\(false\);\n', '\n', content)
content = re.sub(r'\s*const \[insight, setInsight\] = useState\(null\);\n', '\n', content)

# 6. Update JSX calls
content = content.replace('{activeTab === "todo" && <TodoTab />}', '{activeTab === "todo" && renderTodoTab()}')
content = content.replace('{activeTab === "insights" && <InsightsTab />}', '{activeTab === "insights" && renderInsightsTab()}')

with open("src/App.jsx", "w") as f:
    f.write(content)
print("Hooks hoisted!")
