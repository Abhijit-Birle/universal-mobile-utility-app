            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={handleBalanceWeek} style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${theme.accent}, #5a4fcf)`, color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, ...fontDisplay, cursor: "pointer" }}>
                <Sparkles size={16} /> Balance Week
              </button>
              <button onClick={handleMonthlySummary} style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: theme.bg, boxShadow: theme.shadowRaisedSm, color: theme.accent, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, ...fontDisplay, cursor: "pointer" }}>
                <FileText size={16} /> Monthly Summary
              </button>
            </div>
            {monthlySummary && (
              <NeoSurface style={{ padding: 16, marginTop: 16, borderRadius: 12 }}>
                <div style={{ color: theme.textPrimary, fontSize: 13, lineHeight: 1.5, ...fontBody }}>{monthlySummary}</div>
              </NeoSurface>
            )}
