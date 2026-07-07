with open("src/App.jsx", "r") as f:
    content = f.read()

settings_modal = """
  /* ---------------------------------- SETTINGS MODAL ---------------------------------- */

  function SettingsModal() {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 60 }}>
        <NeoSurface style={{ width: "100%", maxWidth: 390, padding: 24, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Settings</div>
            <button onClick={() => setShowSettings(false)} style={{ border: "none", background: "none", color: theme.textSecondary }}><X size={18} /></button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Cloud Sync */}
            <div 
              onClick={() => { setSyncState("syncing"); setTimeout(() => setSyncState("synced"), 1200); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm, cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Cloud size={18} color={theme.textPrimary} />
                <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Cloud Sync</span>
              </div>
              {syncState === "syncing" ? (
                <span style={{ fontSize: 13, color: theme.textSecondary, ...fontBody }}>Syncing...</span>
              ) : (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.accent2 }} />
              )}
            </div>

            {/* Widget Preview */}
            <div 
              onClick={() => { setShowSettings(false); setShowWidget(true); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm, cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Layers size={18} color={theme.textPrimary} />
                <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Widget Preview</span>
              </div>
              <ChevronDown size={16} color={theme.textSecondary} style={{ transform: "rotate(-90deg)" }} />
            </div>
          </div>
        </NeoSurface>
      </div>
    );
  }
"""

if "SettingsModal()" not in content:
    # Insert it before SearchOverlay
    content = content.replace("/* ---------------------------------- GLOBAL SEARCH ---------------------------------- */", settings_modal + "\n  /* ---------------------------------- GLOBAL SEARCH ---------------------------------- */")

if "{showSettings && <SettingsModal />}" not in content:
    content = content.replace("{showKeyModal && <ApiKeyModal />}", "{showKeyModal && <ApiKeyModal />}\n      {showSettings && <SettingsModal />}")

with open("src/App.jsx", "w") as f:
    f.write(content)
print("done")
