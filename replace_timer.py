import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# We need to replace the variable declarations for the math
old_math = """    const r = 88;
    const circumference = 2 * Math.PI * r;
    const progress = Math.min(minutes, 60) / 60;
    const dashOffset = circumference * (1 - progress);
    const angleRad = (progress * 360 - 90) * (Math.PI / 180);
    const knobX = 100 + r * Math.cos(angleRad);
    const knobY = 100 + r * Math.sin(angleRad);"""

new_math = """    const svgSize = 280;
    const center = svgSize / 2;
    const r = 90;
    const circumference = 2 * Math.PI * r;
    const progress = Math.min(minutes, 60) / 60;
    const dashOffset = circumference * (1 - progress);
    const angleRad = (progress * 360 - 90) * (Math.PI / 180);
    const knobX = center + r * Math.cos(angleRad);
    const knobY = center + r * Math.sin(angleRad);
    const ticks = Array.from({length: 40}).map((_, i) => {
        const a = (i / 40) * 360 * (Math.PI / 180);
        return {
            x1: center + 115 * Math.cos(a),
            y1: center + 115 * Math.sin(a),
            x2: center + 125 * Math.cos(a),
            y2: center + 125 * Math.sin(a)
        };
    });"""

if old_math in content:
    content = content.replace(old_math, new_math)
    print("Replaced math.")
else:
    print("Could not find math block.")

old_svg_pattern = r"""<svg[\s\S]*?ref=\{svgRef\}[\s\S]*?width=\{200\}[\s\S]*?height=\{200\}[\s\S]*?<\/svg>"""

new_svg = """<svg
            ref={svgRef}
            width={svgSize}
            height={svgSize}
            style={{ touchAction: "none", cursor: "pointer", overflow: "visible", margin: "20px 0" }}
            onMouseDown={(e) => { e.stopPropagation(); setDragging(true); setFromPointer(e.clientX, e.clientY); }}
            onTouchStart={(e) => { e.stopPropagation(); setDragging(true); const t = e.touches[0]; setFromPointer(t.clientX, t.clientY); }}
          >
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c6ff0" />
                <stop offset="100%" stopColor="#3dd6c8" />
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

            {/* Outer blur layer for glow */}
            <circle cx={center} cy={center} r={r} fill="none" stroke="url(#grad)" strokeWidth="14" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${center} ${center})`}
              filter="url(#glow)"
              opacity="0.5"
            />
            {/* Crisp inner layer */}
            <circle cx={center} cy={center} r={r} fill="none" stroke="url(#grad)" strokeWidth="14" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${center} ${center})`}
            />

            {/* The Knob (Pill) */}
            <g transform={`translate(${knobX}, ${knobY})`} style={{ pointerEvents: "none" }}>
              <circle cx="0" cy="0" r="15" fill="#7c6ff0" stroke={theme.bg} strokeWidth="3" />
              <text x="0" y="4.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" style={fontDisplay}>
                {minutes}
              </text>
            </g>

            {/* Center Content */}
            <g transform={`translate(${center}, ${center - 24})`}>
              <foreignObject x="-20" y="-20" width="40" height="40">
                 <div style={{ color: theme.accent2, display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
                   {isRunning ? <Hourglass size={24} /> : <AlarmClock size={24} />}
                 </div>
              </foreignObject>
            </g>

            <text x={center} y={center + 24} textAnchor="middle" fontSize="42" fontWeight="700" fill={theme.textPrimary} style={fontDisplay}>
              {isRunning || remaining !== minutes * 60 ? fmtClock(remaining) : `${minutes}:00`}
            </text>
          </svg>"""

if re.search(old_svg_pattern, content):
    content = re.sub(old_svg_pattern, new_svg, content)
    print("Replaced SVG.")
else:
    print("Could not find SVG block.")

with open("src/App.jsx", "w") as f:
    f.write(content)
