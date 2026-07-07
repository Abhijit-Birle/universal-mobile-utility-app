import re

with open("src/App.jsx", "r") as f:
    app = f.read()

# 1. Find renderTimerTab boundaries
start_idx = app.find("  const renderTimerTab = () => {")
end_idx = app.find("  // Bill reminders")
if start_idx == -1 or end_idx == -1:
    print("Could not find renderTimerTab boundaries!")
    exit(1)

timer_tab_code = app[start_idx:end_idx]

# 2. Extract useEffect blocks and utility functions from timer_tab_code
lines = timer_tab_code.split('\n')
clean_lines = []
hoist_lines = []
in_hoist_block = False
brace_depth = 0

for line in lines:
    if line.strip().startswith("useEffect(() => {") or line.strip().startswith("const resetTimer = () => {") or line.strip().startswith("const handlePomoEnd = () => {"):
        in_hoist_block = True
        hoist_lines.append(line)
        brace_depth = line.count('{') - line.count('}')
        continue
    
    if in_hoist_block:
        hoist_lines.append(line)
        brace_depth += line.count('{') - line.count('}')
        if brace_depth <= 0:
            in_hoist_block = False
        continue
    
    clean_lines.append(line)

# Also hoist autoTimerName, if it's there
# Actually, autoTimerName was already defined outside maybe? Let's check.

timer_tab_code = '\n'.join(clean_lines)

# 3. Inject hoisted blocks into NeoApp
# Let's put them right before renderTimerTab
app = app[:start_idx] + "\n".join(hoist_lines) + "\n\n" + timer_tab_code + app[end_idx:]

with open("src/App.jsx", "w") as f:
    f.write(app)
print("Timer effects hoisted!")
