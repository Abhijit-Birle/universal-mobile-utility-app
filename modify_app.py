import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# 1. Add GoogleGenAI import
content = content.replace('import React, { useState, useEffect, useRef } from "react";', 'import React, { useState, useEffect, useRef } from "react";\nimport { GoogleGenAI } from "@google/genai";')

# 2. Hoist states to NeoApp
neoapp_start = content.find("export default function NeoApp() {\n")
neoapp_body_start = neoapp_start + len("export default function NeoApp() {\n")

hoisted_states = """
  // Hoisted state
  const [history, setHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [todos, setTodos] = useState([]);
"""
content = content[:neoapp_body_start] + hoisted_states + content[neoapp_body_start:]

# Remove old state declarations
content = re.sub(r'const \[history, setHistory\] = useState\(\[.*?\]\);\n', '', content, flags=re.DOTALL)
content = re.sub(r'const \[transactions, setTransactions\] = useState\(\[.*?\]\);\n', '', content, flags=re.DOTALL)
content = re.sub(r'const \[todos, setTodos\] = useState\(\[.*?\]\);\n', '', content, flags=re.DOTALL)

# 3. Rewrite InsightsTab
insights_start = content.find("function InsightsTab() {")
insights_end = content.find("/* ---------------------------------- GLOBAL SEARCH ---------------------------------- */")

insights_tab_code = content[insights_start:insights_end]
old_insights_tab_code = insights_tab_code

new_insights_tab_code = """function InsightsTab() {
    const [askInput, setAskInput] = useState("");
    const [askAnswer, setAskAnswer] = useState(null);
    const [asking, setAsking] = useState(false);
    const [generatedInsight, setGeneratedInsight] = useState("Click 'Generate another insight' to get AI-powered analysis of your real data.");
    const [generating, setGenerating] = useState(false);

    const askAI = async () => {
      if (!askInput.trim()) return;
      if (!apiKey) {
        setAskAnswer("Please set your Gemini API key in the top right menu.");
        return;
      }
      setAsking(true);
      try {
        const ai = new GoogleGenAI({ apiKey });
        const dataContext = { transactions, todos, history };
        const prompt = `Here is my data: ${JSON.stringify(dataContext)}\n\nQuestion: ${askInput}\n\nAnswer concisely based on the data.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
        setAskAnswer(response.text);
      } catch (err) {
        setAskAnswer("Error: " + err.message);
      } finally {
        setAsking(false);
      }
    };

    const generateInsight = async () => {
      if (!apiKey) {
        setGeneratedInsight("Please set your Gemini API key in the top right menu.");
        return;
      }
      setGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey });
        const dataContext = { transactions, todos, history };
        const prompt = `Here is my data: ${JSON.stringify(dataContext)}\n\nGenerate one short, helpful insight about my productivity or finances based ONLY on this data. Max 2 sentences. If there's no data, encourage the user to add some.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
        setGeneratedInsight(response.text);
      } catch (err) {
        setGeneratedInsight("Error: " + err.message);
      } finally {
        setGenerating(false);
      }
    };

    // Derived stats from real data
    const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const incomeTotal = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    
    // Category Data
    const catMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
    const categoryData = Object.entries(catMap).map(([name, value], i) => ({ name, value, color: ['#7c6ff0', '#3dd6c8', '#ffb648', '#ff6b6b'][i % 4] }));

    // Todo Stats
    const doneTodos = todos.filter(t => t.done).length;
    const pendingTodos = todos.filter(t => !t.done).length;
    const todoStats = [
      { name: "Done", value: doneTodos, color: "#3dd6c8" },
      { name: "Pending", value: pendingTodos, color: darkMode ? "#3a4051" : "#c9cfda" }
    ];

    // Weekly focus mins (mocking days from history for simplicity, assuming history has 'minutes' and 'date')
    // We will just aggregate all history minutes since we don't have full date parsing
    const totalFocus = history.reduce((a, b) => a + b.minutes, 0);
    const weekly = [{ day: "Total", mins: totalFocus }];
    
    // Monthly income vs expense
    const monthly = [{ m: "Total", income: incomeTotal, expense: expenseTotal }];

    return (
      <div style={{ padding: "18px 18px 100px" }}>
        <NeoSurface style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Sparkles size={16} color={theme.accent} />
            <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13.5, ...fontDisplay }}>AI insight</span>
            <span style={{ color: theme.textSecondary, fontSize: 10.5, marginLeft: "auto", ...fontBody }}>Gemini 2.0 Flash</span>
          </div>
          <div style={{ color: theme.textPrimary, fontSize: 13, lineHeight: 1.5, ...fontBody }}>
            {generating ? "Thinking..." : generatedInsight}
          </div>
          <button onClick={generateInsight} style={{
            marginTop: 12, border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm, color: theme.accent,
            borderRadius: 12, padding: "8px 14px", fontSize: 12, fontWeight: 600, ...fontBody, cursor: 'pointer'
          }}>Generate another insight</button>
        </NeoSurface>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Ask your data</SectionLabel>
          <NeoSurface style={{ padding: 14 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <NeoInput placeholder="How much did I spend on food?" value={askInput} onChange={(e) => setAskInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && askAI()} />
              </div>
              <button onClick={askAI} style={{
                width: 46, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${theme.accent}, #5a4fcf)`,
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: 'pointer'
              }}><Send size={16} /></button>
            </div>
            {(asking || askAnswer) && (
              <div style={{ marginTop: 12, background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 12, padding: 12, display: "flex", gap: 8 }}>
                <MessageSquare size={14} color={theme.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ color: theme.textPrimary, fontSize: 12.5, lineHeight: 1.5, ...fontBody }}>
                  {asking ? "Thinking..." : askAnswer}
                </div>
              </div>
            )}
          </NeoSurface>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <SectionLabel>Expense split</SectionLabel>
            <NeoSurface style={{ padding: 10 }}>
              <ResponsiveContainer width="100%" height={150}>
                {categoryData.length > 0 ? (
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={35} outerRadius={55} paddingAngle={3}>
                      {categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: theme.bg, border: "none", borderRadius: 10, fontSize: 11 }} />
                  </PieChart>
                ) : <div style={{ color: theme.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 50, ...fontBody }}>No expenses yet</div>}
              </ResponsiveContainer>
            </NeoSurface>
          </div>
          <div style={{ flex: 1 }}>
            <SectionLabel>Todo completion</SectionLabel>
            <NeoSurface style={{ padding: 10 }}>
              <ResponsiveContainer width="100%" height={150}>
                {todos.length > 0 ? (
                  <PieChart>
                    <Pie data={todoStats} dataKey="value" nameKey="name" innerRadius={35} outerRadius={55} paddingAngle={3}>
                      {todoStats.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: theme.bg, border: "none", borderRadius: 10, fontSize: 11 }} />
                  </PieChart>
                ) : <div style={{ color: theme.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 50, ...fontBody }}>No todos yet</div>}
              </ResponsiveContainer>
            </NeoSurface>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Income vs Expense (Total)</SectionLabel>
          <NeoSurface style={{ padding: "14px 8px" }}>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#323848" : "#c9cfda"} vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: theme.textSecondary }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: theme.bg, border: "none", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="income" fill={theme.accent2} radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill={theme.danger} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </NeoSurface>
        </div>
      </div>
    );
  }
  """

content = content.replace(old_insights_tab_code, new_insights_tab_code)

with open("src/App.jsx", "w") as f:
    f.write(content)

