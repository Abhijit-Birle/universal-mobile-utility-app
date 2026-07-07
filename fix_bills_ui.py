import re

with open("src/App.jsx", "r") as f:
    content = f.read()

bills_ui = """        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionLabel>Upcoming bills</SectionLabel>
            <button onClick={() => {
              const name = window.prompt("Bill name:");
              if (!name) return;
              const amount = parseFloat(window.prompt("Amount:"));
              if (isNaN(amount)) return;
              const daysLeft = parseInt(window.prompt("Days left:"));
              if (isNaN(daysLeft)) return;
              setUpcomingBills(b => [...b, { id: Date.now(), name, amount, daysLeft }]);
            }} style={{ border: "none", background: "none", color: theme.accent, fontSize: 12, cursor: "pointer", ...fontBody }}>+ Add</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingBills.map((b) => (
              <NeoSurface key={b.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: b.daysLeft <= 3 ? theme.danger : theme.accent }}>
                  <Bell size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 13.5, ...fontBody }}>{b.name}</div>
                  <div style={{ color: theme.textSecondary, fontSize: 11, ...fontBody }}>Due in {b.daysLeft} day{b.daysLeft !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 13.5, marginRight: 8, ...fontDisplay }}>₹{b.amount.toLocaleString()}</div>
                <button onClick={() => {
                  const name = window.prompt("Edit bill name:", b.name);
                  if (name === null) return;
                  const amount = parseFloat(window.prompt("Edit amount:", b.amount));
                  if (isNaN(amount)) return;
                  const daysLeft = parseInt(window.prompt("Edit days left:", b.daysLeft));
                  if (isNaN(daysLeft)) return;
                  setUpcomingBills(bills => bills.map(x => x.id === b.id ? { ...x, name, amount, daysLeft } : x));
                }} style={{ border: "none", background: "none", color: theme.textSecondary, cursor: "pointer" }}><Pencil size={14} /></button>
                <button onClick={() => setUpcomingBills(bills => bills.filter(x => x.id !== b.id))} style={{ border: "none", background: "none", color: theme.danger, cursor: "pointer" }}><Trash2 size={14} /></button>
              </NeoSurface>
            ))}
          </div>
        </div>"""

pattern = r'        <div style={{ marginTop: 20 }}>\n          <SectionLabel>Upcoming bills</SectionLabel>.*?          </div>\n        </div>'
content = re.sub(pattern, bills_ui, content, flags=re.DOTALL)

with open("src/App.jsx", "w") as f:
    f.write(content)
