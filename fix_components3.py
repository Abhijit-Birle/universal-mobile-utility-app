import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# Fix NeoSurface
content = content.replace("    </div>\n  );\n, [theme], [theme]);", "    </div>\n  ), [theme]);")
# Fix others
content = content.replace("), [theme], [theme]);", "), [theme]);")

# Fix WheelPicker
pattern = r'(const WheelPicker = useCallback\([^)]*\) => \{[\s\S]*?(?=\n\n  const render))'
match = re.search(pattern, content)
if match:
    orig = match.group(1)
    if not orig.endswith("), [theme]);"):
        # We need to find the ending bracket of WheelPicker. It's right before `const render...`
        # Let's just add it manually.
        pass

with open("src/App.jsx", "w") as f:
    f.write(content)
