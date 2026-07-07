import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# 1. Add state to NeoApp
neoapp_state_injection = "  const [categoryBudgets, setCategoryBudgets] = useState({});\n"
content = content.replace("  const [todos, setTodos] = useState([]);\n", "  const [todos, setTodos] = useState([]);\n" + neoapp_state_injection)

# 2. Add showBudgetModal state to ExpenseTab
expense_tab_start = content.find("  function ExpenseTab() {")
content = content[:expense_tab_start] + content[expense_tab_start:].replace("  function ExpenseTab() {\n", "  function ExpenseTab() {\n    const [showBudgetModal, setShowBudgetModal] = useState(false);\n", 1)

# 3. Replace BUDGETS array calculation
old_budgets = """    // Budgets dynamically calculated based on current month's transactions
    const calcSpent = (cat) => transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((sum, t) => sum + t.amount, 0);
    const BUDGETS = [
      { category: "Food", budget: 6000, spent: calcSpent("Food"), color: "#7c6ff0" },
      { category: "Transport", budget: 3000, spent: calcSpent("Transport"), color: "#3dd6c8" },
      { category: "Entertainment", budget: 2000, spent: calcSpent("Entertainment"), color: "#ffb648" },
    ];"""

new_budgets = """    // Budgets dynamically calculated based on current month's transactions
    const calcSpent = (cat) => transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((sum, t) => sum + t.amount, 0);
    
    const BUDGETS = EXPENSE_CATEGORIES
      .filter(cat => categoryBudgets[cat] > 0 || calcSpent(cat) > 0)
      .map((cat, i) => {
        const colorOptions = ["#7c6ff0", "#3dd6c8", "#ffb648", "#ff6b6b", "#a66cff"];
        return {
          category: cat,
          budget: categoryBudgets[cat] || 0,
          spent: calcSpent(cat),
          color: colorOptions[i % colorOptions.length]
        };
      });"""

content = content.replace(old_budgets, new_budgets)

# 4. Modify Category budget header to add Edit button
old_header = "<SectionLabel>Category budget</SectionLabel>"
new_header = """<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <SectionLabel style={{ margin: 0 }}>Category budget</SectionLabel>
            <button onClick={() => setShowBudgetModal(true)} style={{ border: "none", background: "none", color: theme.accent, fontSize: 12, cursor: "pointer", ...fontBody }}>Edit</button>
          </div>"""
content = content.replace(old_header, new_header)

# 5. Modify budget rendering (pct and over logic)
old_budget_render = """                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: theme.textPrimary, fontSize: 12.5, fontWeight: 600, ...fontBody }}>{b.category}</span>
                    <span style={{ color: over ? theme.danger : theme.textSecondary, fontSize: 11.5, fontWeight: 600, ...fontBody }}>
                      ₹{spent.toLocaleString()} / ₹{b.budget.toLocaleString()} {over && "⚠ over"}
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: theme.bg, boxShadow: theme.shadowPressed, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: over ? theme.danger : b.color, transition: "width .3s" }} />
                  </div>"""

new_budget_render = """                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: theme.textPrimary, fontSize: 12.5, fontWeight: 600, ...fontBody }}>{b.category}</span>
                    <span style={{ color: over ? theme.danger : theme.textSecondary, fontSize: 11.5, fontWeight: 600, ...fontBody }}>
                      ₹{spent.toLocaleString()} {b.budget > 0 ? `/ ₹${b.budget.toLocaleString()} ` : ''} {over && "⚠ over"}
                    </span>
                  </div>
                  {b.budget > 0 && (
                    <div style={{ height: 8, borderRadius: 4, background: theme.bg, boxShadow: theme.shadowPressed, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: over ? theme.danger : b.color, transition: "width .3s" }} />
                    </div>
                  )}"""

# Also fix the pct and over calculations
old_calcs = """              const spent = b.spent;
              const pct = Math.min(100, (spent / b.budget) * 100);
              const over = spent > b.budget;"""

new_calcs = """              const spent = b.spent;
              const pct = b.budget > 0 ? Math.min(100, (spent / b.budget) * 100) : 0;
              const over = b.budget > 0 && spent > b.budget;"""

content = content.replace(old_calcs, new_calcs)
content = content.replace(old_budget_render, new_budget_render)

# 6. Inject the Budget Modal UI just before the closing </div> of ExpenseTab
budget_modal = """
        {showBudgetModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <NeoSurface style={{ padding: 20, width: "100%", maxWidth: 320 }}>
              <div style={{ color: theme.textPrimary, fontSize: 16, fontWeight: 700, marginBottom: 16, ...fontDisplay }}>Set Budgets</div>
              <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
                {EXPENSE_CATEGORIES.map(cat => (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, ...fontBody }}>{cat}</div>
                    <NeoInput type="number" placeholder="No limit" value={categoryBudgets[cat] || ""} onChange={(e) => setCategoryBudgets(prev => ({...prev, [cat]: Number(e.target.value) || 0}))} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={() => setShowBudgetModal(false)} style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", ...fontBody }}>Done</button>
              </div>
            </NeoSurface>
          </div>
        )}
"""
expense_tab_end = content.find("  /* ---------------------------------- TODO TAB ---------------------------------- */")
expense_tab_closing_div = content.rfind("</div>\n    );\n  }", 0, expense_tab_end)
content = content[:expense_tab_closing_div] + budget_modal + content[expense_tab_closing_div:]

with open("src/App.jsx", "w") as f:
    f.write(content)

