import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# 1. New Insights states to hoist
insights_states = """
  const [askInput, setAskInput] = useState("");
  const [askAnswer, setAskAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [generatedInsight, setGeneratedInsight] = useState("Click 'Generate another insight' to get AI-powered analysis of your real data.");
  const [generating, setGenerating] = useState(false);
"""

# Insert these at the top of NeoApp
content = content.replace('  const [insight, setInsight] = useState(null);', '  const [insight, setInsight] = useState(null);\n' + insights_states)

# 2. Remove them from renderInsightsTab
content = re.sub(r'\s*const \[askInput, setAskInput\] = useState\(""\);\n', '\n', content)
content = re.sub(r'\s*const \[askAnswer, setAskAnswer\] = useState\(null\);\n', '\n', content)
content = re.sub(r'\s*const \[asking, setAsking\] = useState\(false\);\n', '\n', content)
content = re.sub(r'\s*const \[generatedInsight, setGeneratedInsight\] = useState\("Click \'Generate another insight\' to get AI-powered analysis of your real data\."\);\n', '\n', content)
content = re.sub(r'\s*const \[generating, setGenerating\] = useState\(false\);\n', '\n', content)

with open("src/App.jsx", "w") as f:
    f.write(content)
print("Insights hooks fixed!")
