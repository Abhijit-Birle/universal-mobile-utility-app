with open("src/App.jsx", "r") as f:
    content = f.read()

old_block = """            {/* Media Controls & Equalizer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handlePlayPause} style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: theme.accent, color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: theme.shadowRaisedSm }}>
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
                <button onClick={handleStop} style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: theme.bg, color: theme.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: theme.shadowRaisedSm }}>
                  <Square size={16} fill="currentColor" />
                </button>
                <button onClick={handleReset} style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: theme.bg, color: theme.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: theme.shadowRaisedSm }}>
                  <RotateCcw size={16} />
                </button>
              </div>

              {isPlaying && (
                <div style={{ width: 120, height: 40, position: "relative", overflow: "hidden" }}>
                  <Strands
                    colors={[theme.accent, theme.accent2, "#06B6D4"]}
                    count={3}
                    speed={1.5}
                    amplitude={1.2}
                    waviness={1.5}
                    thickness={0.7}
                    glow={2}
                    taper={3}
                    spread={1}
                    intensity={0.6}
                    saturation={1.5}
                    opacity={1}
                    scale={1.5}
                  />
                </div>
              )}
            </div>"""

new_block = """            {/* Animated Strands */}
            {isPlaying && (
              <div style={{ width: "100%", height: 60, position: "relative", overflow: "hidden", marginTop: 16, borderRadius: 12, background: "rgba(0,0,0,0.1)", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}>
                <Strands
                  colors={[theme.accent, theme.accent2, "#06B6D4"]}
                  count={3}
                  speed={1.5}
                  amplitude={1.2}
                  waviness={1.5}
                  thickness={0.7}
                  glow={2}
                  taper={3}
                  spread={1}
                  intensity={0.6}
                  saturation={1.5}
                  opacity={1}
                  scale={1.5}
                />
              </div>
            )}

            {/* Media Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handlePlayPause} style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: theme.accent, color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: theme.shadowRaisedSm }}>
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
                <button onClick={handleStop} style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: theme.bg, color: theme.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: theme.shadowRaisedSm }}>
                  <Square size={16} fill="currentColor" />
                </button>
                <button onClick={handleReset} style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: theme.bg, color: theme.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: theme.shadowRaisedSm }}>
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("src/App.jsx", "w") as f:
        f.write(content)
    print("replaced correctly")
else:
    print("could not find old_block")
