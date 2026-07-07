import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# 1. Add hours state
if "const [hours, setHours] = useState(0);" not in content:
    content = content.replace("const [minutes, setMinutes] = useState(25);", "const [hours, setHours] = useState(0);\n    const [minutes, setMinutes] = useState(25);")
    content = content.replace("const [remaining, setRemaining] = useState(25 * 60);", "const [remaining, setRemaining] = useState(25 * 60);")

# 2. Update toggleStart and mode switching to use hours
# For Pomodoro mode, we reset hours to 0
content = content.replace("setPomoPhase(\"Focus\"); setMinutes(25); }", "setPomoPhase(\"Focus\"); setHours(0); setMinutes(25); }")
content = content.replace("minutes === 25", "(hours === 0 && minutes === 25)")
content = content.replace("minutes === 50", "(hours === 0 && minutes === 50)")
content = content.replace("setMinutes(25)", "setHours(0); setMinutes(25)")
content = content.replace("setMinutes(50)", "setHours(0); setMinutes(50)")
content = content.replace("if (!isRunning) setRemaining(minutes * 60);", "if (!isRunning) setRemaining(hours * 3600 + minutes * 60);")
# Add the dependency on hours
content = content.replace("}, [minutes]);\n    useEffect(() => {\n      if (!isRunning) return;", "}, [hours, minutes]);\n    useEffect(() => {\n      if (!isRunning) return;")

# Also modify the custom prompt to handle hours (we'll just remove the chips for now, iPhone timer doesn't have chips)
# Wait, let's keep chips for convenience but hide them if we have an awesome iOS picker! 
# iPhone timer does NOT have "Set focus duration" chips. We should remove the chips.
chips_pattern = r'<SectionLabel>Set focus duration</SectionLabel>.*?</div>'
content = re.sub(chips_pattern, '', content, flags=re.DOTALL)

# Let's replace the <svg> element.
# I will find the <svg>...</svg>
svg_pattern = r'<svg\s+ref={svgRef}.*?</svg>'

# Calculate dashOffset based on the new max remaining
# Wait, total time is hours * 3600 + minutes * 60
# When running, progress = remaining / totalTime
# we need totalTime.
new_svg_logic = """
          {!isRunning && remaining === (hours * 3600 + minutes * 60) ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: svgSize, gap: 16 }}>
              <WheelPicker 
                items={Array.from({length: 24}, (_, i) => i)} 
                value={hours} 
                onChange={setHours} 
                label="hours" 
              />
              <WheelPicker 
                items={Array.from({length: 60}, (_, i) => i)} 
                value={minutes} 
                onChange={setMinutes} 
                label="min" 
              />
            </div>
          ) : (
            <svg
              ref={svgRef}
              width={svgSize}
              height={svgSize}
              style={{ overflow: "visible", margin: "20px 0" }}
            >
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff9f43" />
                  <stop offset="100%" stopColor="#ff4d4d" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background ticks */}
              {ticks.map((t, i) => (
                  <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={darkMode ? "#3a4051" : "#c9cfda"} strokeWidth="2.5" strokeLinecap="round" />
              ))}

              {/* Soft inner track ring */}
              <circle cx={center} cy={center} r={r} fill={darkMode ? "#1b1e25" : "#f4f6fa"} stroke={darkMode ? "#13161c" : "#e9edf5"} strokeWidth="16" />

              {/* Progress Rings */}
              {(() => {
                const totalTime = (hours * 3600 + minutes * 60) || 1;
                const prog = Math.max(0, Math.min(1, remaining / totalTime));
                const dOff = circumference * (1 - prog);
                return (
                  <>
                    <circle cx={center} cy={center} r={r} fill="none" stroke="url(#grad)" strokeWidth="14" strokeLinecap="round"
                      strokeDasharray={circumference} strokeDashoffset={dOff}
                      transform={`rotate(-90 ${center} ${center})`}
                      filter="url(#glow)" opacity="0.5"
                    />
                    <circle cx={center} cy={center} r={r} fill="none" stroke="url(#grad)" strokeWidth="14" strokeLinecap="round"
                      strokeDasharray={circumference} strokeDashoffset={dOff}
                      transform={`rotate(-90 ${center} ${center})`}
                    />
                  </>
                );
              })()}

              {/* Large Digital Countdown */}
              <text x={center} y={center + 16} textAnchor="middle" fontSize="64" fontWeight="300" fill={theme.textPrimary} style={{ fontFamily: "ui-monospace, monospace", fontVariantNumeric: "tabular-nums" }}>
                {fmtClock(remaining)}
              </text>
            </svg>
          )}
"""
content = re.sub(svg_pattern, new_svg_logic.strip(), content, flags=re.DOTALL)

with open("src/App.jsx", "w") as f:
    f.write(content)

