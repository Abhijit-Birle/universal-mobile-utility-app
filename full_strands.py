with open("src/App.jsx", "r") as f:
    content = f.read()

import re

# We will just replace the exact Ambience block
old_block = """          <NeoSurface style={{ padding: "16px 20px" }}>
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

            {/* Animated Strands */}
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
            </div>
            
            <audio ref={audioRef} style={{ display: 'none' }} />
            <div id="yt-audio-player" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", visibility: "hidden" }}></div>
          </NeoSurface>"""

new_block = """          <NeoSurface style={{ padding: "16px 20px", position: "relative", overflow: "hidden" }}>
            {/* Animated Strands Background */}
            {isPlaying && (
              <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.25, pointerEvents: "none" }}>
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
            
            <div style={{ position: "relative", zIndex: 1 }}>
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
              </div>
              
              <audio ref={audioRef} style={{ display: 'none' }} />
              <div id="yt-audio-player" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", visibility: "hidden" }}></div>
            </div>
          </NeoSurface>"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("src/App.jsx", "w") as f:
        f.write(content)
    print("replaced correctly")
else:
    print("could not find old_block")
