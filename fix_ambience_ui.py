with open("src/App.jsx", "r") as f:
    lines = f.readlines()

new_ui = """          <SectionLabel>Ambience / music</SectionLabel>
          <NeoSurface style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {MUSIC_OPTIONS.map((m) => (
                <Chip key={m.id} label={m.label} active={activeSource === m.id} onClick={() => { 
                  if (audioRef.current) audioRef.current.pause();
                  if (ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
                  setActiveSource(m.id); 
                }} />
              ))}
              <input type="file" accept="audio/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
              <Chip label={
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Upload size={14} /> Upload audio
                  </div>
                } 
                active={activeSource === "upload"} 
                onClick={() => fileInputRef.current.click()} 
              />
              <Chip label={
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MonitorPlay size={14} /> YouTube link
                  </div>
                } 
                active={activeSource === "youtube"} 
                onClick={() => setActiveSource(activeSource === "youtube" ? "piano" : "youtube")} 
              />
            </div>
            {activeSource === "youtube" && (
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <input 
                  placeholder="Paste YouTube link…" 
                  value={ytLink} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setYtLink(val);
                    const id = extractYoutubeId(val);
                    if (id) {
                      setYoutubeId(id);
                      if (audioRef.current) audioRef.current.pause();
                      setIsPlaying(true);
                    }
                  }} 
                  style={{
                    width: "100%", boxSizing: "border-box", background: theme.bg,
                    boxShadow: theme.shadowPressed, border: "none", borderRadius: 14,
                    padding: "12px 14px", color: theme.textPrimary, fontSize: 14,
                    outline: "none", ...fontBody
                  }}
                />
              </div>
            )}

            {/* Media Controls & Equalizer */}
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
                <div style={{ display: "flex", gap: 4, height: 20, alignItems: "flex-end" }}>
                  <div className="equalizer-bar" style={{ backgroundColor: theme.accent }}></div>
                  <div className="equalizer-bar" style={{ backgroundColor: theme.accent }}></div>
                  <div className="equalizer-bar" style={{ backgroundColor: theme.accent }}></div>
                  <div className="equalizer-bar" style={{ backgroundColor: theme.accent }}></div>
                </div>
              )}
            </div>
            
            <audio ref={audioRef} style={{ display: 'none' }} />
            <div id="yt-audio-player" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", visibility: "hidden" }}></div>
          </NeoSurface>
"""

# Find the start and end of the block
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "<SectionLabel>Ambience / music</SectionLabel>" in line:
        start_idx = i
    if start_idx != -1 and "          </NeoSurface>" in line and i > start_idx + 5:
        # We also have to be careful not to match a different NeoSurface close tag.
        # But looking at the file, the next </NeoSurface> after Ambience is line 896.
        # We can just check if we are in the 800-900 range.
        if 800 <= i <= 900:
            end_idx = i
            break

if start_idx != -1 and end_idx != -1:
    lines = lines[:start_idx] + [new_ui] + lines[end_idx+1:]
    with open("src/App.jsx", "w") as f:
        f.writelines(lines)
    print("Replaced successfully")
else:
    print(f"Failed to find block: {start_idx}, {end_idx}")

