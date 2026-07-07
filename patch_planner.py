import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# 1. TAB_ORDER
content = content.replace('const TAB_ORDER = ["timer", "expense", "planner", "todo", "insights"];', 'const TAB_ORDER = ["timer", "expense", "todo", "insights"];')

# 2. State variables
content = re.sub(r'^\s*const \[plannerView.*?$.*?^\s*const \[plannerSelectedDate.*?\n', '', content, flags=re.MULTILINE)

# 3. renderPlannerTab
content = re.sub(r'^\s*const renderPlannerTab = \(\) => \{.*?(?=^\s*const renderTodoTab = \(\) => \{)', '', content, flags=re.MULTILINE | re.DOTALL)

# 4. addTodo finalDate
content = content.replace('let finalDate = (activeTab === "planner" && plannerSelectedDate) ? plannerSelectedDate : new Date().toISOString().split(\'T\')[0];', 'let finalDate = new Date().toISOString().split(\'T\')[0];')

# 5. activeTab === "planner" inside addTodo
content = re.sub(r'^\s*// Natural language add in planner\n\s*if \(activeTab === "planner"\) \{.*?^\s*\}\n', '', content, flags=re.MULTILINE | re.DOTALL)

# 6. activeTodos
content = content.replace('const activeTodos = activeTab === "planner" && plannerSelectedDate ? todos.filter(t => t.date === plannerSelectedDate) : todos.filter(t => t.date === todayStr);', 'const activeTodos = todos.filter(t => t.date === todayStr);')

# 7. draggable in NeoSurface
content = content.replace('{...(activeTab === "planner" ? { draggable: true, onDragStart: (e) => e.dataTransfer.setData("todoId", String(t.id)) } : {})}', '')

# 8. bottom: 18 -> bottom: 0
content = content.replace('bottom: 18, zIndex: 10', 'bottom: 0, zIndex: 10')

# 9. Tabs array
content = re.sub(r'^\s*\{\s*id:\s*"planner",\s*label:\s*"Planner",\s*icon:\s*Calendar\s*\},?\n', '', content, flags=re.MULTILINE)

# 10. render switch
content = re.sub(r'^\s*\{\s*activeTab\s*===\s*"planner"\s*&&\s*renderPlannerTab\(\)\s*\}\n', '', content, flags=re.MULTILINE)

with open('src/App.jsx', 'w') as f:
    f.write(content)
