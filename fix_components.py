import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# 1. Wrap theme in useMemo
theme_code = """  const theme = useMemo(() => ({
    pageBg: darkMode ? "#15171c" : "#dfe4ee",
    bg: darkMode ? "#262b36" : "#e4e9f2",
    shadowRaised: darkMode
      ? "8px 8px 16px #1b1e25, -8px -8px 16px #313747"
      : "8px 8px 16px #b7bdc8, -8px -8px 16px #ffffff",
    shadowRaisedSm: darkMode
      ? "4px 4px 8px #1b1e25, -4px -4px 8px #313747"
      : "4px 4px 8px #b7bdc8, -4px -4px 8px #ffffff",
    shadowPressed: darkMode
      ? "inset 8px 8px 16px #1b1e25, inset -8px -8px 16px #313747"
      : "inset 8px 8px 16px #b7bdc8, inset -8px -8px 16px #ffffff",
    textPrimary: darkMode ? "#e2e6f0" : "#2d3446",
    textSecondary: darkMode ? "#8991a3" : "#7c8494",
    accent: "#7c6ff0",
    accent2: "#3dd6c8",
    danger: "#ff6b6b",
    border: darkMode ? "#323848" : "#ffffff",
  }), [darkMode]);"""

content = re.sub(r'  const theme = \{.*?\n  \};\n', theme_code + '\n', content, flags=re.DOTALL)

# 2. Wrap components in useCallback
def wrap_in_usecallback(comp_name, content_text):
    # Regex to find: const CompName = ({...}) => ( ... ); OR const CompName = (props) => ( ... );
    # It might also have { ... } instead of ( ... )
    # Since these are relatively simple, we can do it by text replacement.
    pattern = r'(const ' + comp_name + r' = \([^)]*\) => [\s\S]*?(?=\n\n  const [A-Z]|\n\n  const font|\n\n  /\*|\n  const render))'
    match = re.search(pattern, content_text)
    if match:
        orig = match.group(1)
        # Handle cases where the component definition ends with a semicolon
        if orig.endswith(';'):
            orig_no_semi = orig[:-1]
            replaced = orig_no_semi.replace(f'const {comp_name} = ', f'const {comp_name} = useCallback(') + ', [theme]);'
        else:
            replaced = orig.replace(f'const {comp_name} = ', f'const {comp_name} = useCallback(') + ', [theme]);'
        return content_text.replace(orig, replaced)
    return content_text

for comp in ["NeoSurface", "IconBtn", "Chip", "PrimaryButton", "NeoInput", "SectionLabel", "WheelPicker"]:
    content = wrap_in_usecallback(comp, content)

with open("src/App.jsx", "w") as f:
    f.write(content)
