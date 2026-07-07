import re

with open("src/App.jsx", "r") as f:
    content = f.read()

content = content.replace("const [dragging, setDragging] = useState(false);", "")

# Remove mousemove and mouseup listeners
use_effect_pattern = r'useEffect\(\(\) => \{\n\s+const onMove = \(e\) => \{.*?\n\s+if \(!dragging\) return;.*?\};\n.*?window\.removeEventListener\("mouseup", onUp\);\n\s+\};\n\s+\}, \[dragging\]\);'
content = re.sub(use_effect_pattern, '', content, flags=re.DOTALL)

# Remove setFromPointer
set_from_pointer_pattern = r'const setFromPointer = \(clientX, clientY\) => \{.*?setMinutes\(m\);\n\s+\};'
content = re.sub(set_from_pointer_pattern, '', content, flags=re.DOTALL)

with open("src/App.jsx", "w") as f:
    f.write(content)
