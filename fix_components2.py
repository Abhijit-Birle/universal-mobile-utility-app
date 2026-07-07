import re

with open("src/App.jsx", "r") as f:
    content = f.read()

def fix_usecallback(comp_name, content_text):
    pattern = r'(const ' + comp_name + r' = useCallback\([^)]*\) => [\s\S]*?(?=\n\n  const [A-Z]|\n\n  const font|\n\n  /\*|\n  const render))'
    match = re.search(pattern, content_text)
    if match:
        orig = match.group(1)
        if orig.endswith(';'):
            replaced = orig[:-2] + ', [theme]);'
        else:
            replaced = orig + ', [theme]);'
        return content_text.replace(orig, replaced)
    return content_text

for comp in ["NeoSurface", "IconBtn", "Chip", "PrimaryButton", "NeoInput", "SectionLabel", "WheelPicker"]:
    content = fix_usecallback(comp, content)

with open("src/App.jsx", "w") as f:
    f.write(content)
