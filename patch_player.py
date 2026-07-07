import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# 1. Import ReactPlayer
if "import ReactPlayer" not in content:
    content = content.replace("import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';", "import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';\nimport ReactPlayer from 'react-player';")

# 2. Add lucide icons
icons_to_add = ["Play", "Pause", "Square", "RotateCcw"]
for icon in icons_to_add:
    if icon not in content:
        content = content.replace("import { ", f"import {{ {icon}, ")

# 3. Add states
state_code = """
    const [ytLink, setYtLink] = useState("");
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const playerRef = useRef(null);
"""
content = re.sub(r'    const \[ytLink, setYtLink\] = useState\(""\);', state_code, content)

# 4. Replace Ambience UI
ambience_ui = """        <div style={{ marginTop: 22 }}>
          <SectionLabel>Ambience / music</SectionLabel>
          <NeoSurface style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {MUSIC_OPTIONS.map((m) => (
                <Chip key={m.id} label={m.label} active={music === m.id} onClick={() => { setMusic(m.id); setShowYoutube(false); }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={() => setShowYoutube((v) => !v)} style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px 0", borderRadius: 14, border: "none", background: theme.bg,
                boxShadow: showYoutube ? theme.shadowPressed : theme.shadowRaisedSm, color: theme.textSecondary, fontSize: 12.5, fontWeight: 600, cursor: "pointer", ...fontBody,
              }}>
                <MonitorPlay size={15} /> YouTube link
              </button>
              <label style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px 0", borderRadius: 14, background: theme.bg,
                boxShadow: theme.shadowRaisedSm, color: theme.textSecondary, fontSize: 12.5, fontWeight: 600, cursor: "pointer", ...fontBody,
              }}>
                <Upload size={15} /> {fileName ? fileName.slice(0, 10) + "\u2026" : "Upload audio"}
                <input type="file" accept="audio/*" style={{ display: "none" }} onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
              </label>
            </div>
            {showYoutube && (
              <div style={{ marginTop: 10 }}>
                <NeoInput placeholder="Paste YouTube link\u2026" value={ytLink} onChange={(e) => setYtLink(e.target.value)} />
              </div>
            )}

            {/* Media Controls & Equalizer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setIsPlayingAudio(!isPlayingAudio)} style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: theme.accent, color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: theme.shadowRaisedSm }}>
                  {isPlayingAudio ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
                <button onClick={() => { setIsPlayingAudio(false); playerRef.current?.seekTo(0); }} style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: theme.bg, color: theme.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: theme.shadowRaisedSm }}>
                  <Square size={16} fill="currentColor" />
                </button>
                <button onClick={() => { setIsPlayingAudio(true); playerRef.current?.seekTo(0); }} style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: theme.bg, color: theme.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: theme.shadowRaisedSm }}>
                  <RotateCcw size={16} />
                </button>
              </div>

              {isPlayingAudio && (
                <div style={{ display: "flex", gap: 4, height: 20, alignItems: "flex-end" }}>
                  <div className="equalizer-bar" style={{ backgroundColor: theme.accent }}></div>
                  <div className="equalizer-bar" style={{ backgroundColor: theme.accent }}></div>
                  <div className="equalizer-bar" style={{ backgroundColor: theme.accent }}></div>
                  <div className="equalizer-bar" style={{ backgroundColor: theme.accent }}></div>
                </div>
              )}
            </div>

            {/* Hidden ReactPlayer */}
            {ytLink && showYoutube && (
              <div style={{ display: "none" }}>
                <ReactPlayer 
                  ref={playerRef}
                  url={ytLink} 
                  playing={isPlayingAudio} 
                  controls={false}
                  width="0" 
                  height="0"
                  onEnded={() => setIsPlayingAudio(false)}
                />
              </div>
            )}
          </NeoSurface>
        </div>"""

pattern = r'        <div style={{ marginTop: 22 }}>\n          <SectionLabel>Ambience \/ music.*?          </NeoSurface>\n        </div>'
content = re.sub(pattern, ambience_ui, content, flags=re.DOTALL)

with open("src/App.jsx", "w") as f:
    f.write(content)
