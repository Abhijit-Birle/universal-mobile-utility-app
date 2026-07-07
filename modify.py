import re

with open("NeoApp 2.tsx", "r") as f:
    content = f.read()

# 1. Add WheelPicker Component before TimerTab
wheel_picker_code = """
function WheelPicker({ values, selected, onChange, label, disabled, theme, fontBody, fontDisplay, style }) {
  const rowHeight = 40;
  const containerRef = React.useRef(null);
  
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = values.indexOf(selected);
    if (idx !== -1) {
      el.scrollTo({ top: idx * rowHeight, behavior: 'smooth' });
    }
  }, [selected, values]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let tid;
    const onScroll = () => {
      clearTimeout(tid);
      tid = setTimeout(() => {
        const idx = Math.round(el.scrollTop / rowHeight);
        if (values[idx] !== undefined && values[idx] !== selected) {
          onChange(values[idx]);
        }
      }, 100);
    };
    el.addEventListener('scroll', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      clearTimeout(tid);
    };
  }, [values, selected, onChange]);

  return (
    <div style={{ position: 'relative', height: rowHeight * 5, overflow: 'hidden', flex: 1, ...style }}>
      <div style={{
        position: 'absolute', top: rowHeight * 2, left: 0, right: 0, height: rowHeight,
        background: theme.bg, boxShadow: theme.shadowPressed, borderRadius: 8, pointerEvents: 'none'
      }} />
      <div
        ref={containerRef}
        style={{
          height: '100%', overflowY: disabled ? 'hidden' : 'scroll', scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div style={{ height: rowHeight * 2 }} />
        {values.map((v, i) => {
          const isSelected = v === selected;
          const dist = Math.abs(values.indexOf(selected) - i);
          const opacity = dist === 0 ? 1 : Math.max(0.2, 1 - dist * 0.3);
          const scale = dist === 0 ? 1 : Math.max(0.8, 1 - dist * 0.1);
          return (
            <div
              key={v}
              style={{
                height: rowHeight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                scrollSnapAlign: 'center', color: theme.textPrimary, fontSize: 18, fontWeight: isSelected ? 700 : 500,
                opacity, transform: `scale(${scale})`, transition: 'all 0.2s', ...fontDisplay, pointerEvents: disabled ? 'none' : 'auto'
              }}
            >
              {v.toString().padStart(2, '0')}
            </div>
          );
        })}
        <div style={{ height: rowHeight * 2 }} />
      </div>
      <div style={{
        position: 'absolute', top: rowHeight * 2, right: 10, height: rowHeight, display: 'flex', alignItems: 'center',
        color: theme.textSecondary, fontSize: 12, fontWeight: 600, pointerEvents: 'none', ...fontBody
      }}>
        {label}
      </div>
      <style>{`
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

"""

content = content.replace("  /* ---------------------------------- TIMER TAB ---------------------------------- */", wheel_picker_code + "  /* ---------------------------------- TIMER TAB ---------------------------------- */")

# 2. Rename `minutes` to `totalMinutes` in TimerTab
timer_tab_code = content[content.find("function TimerTab() {"):content.find("/* ---------------------------------- EXPENSE TAB ---------------------------------- */")]
old_timer_tab_code = timer_tab_code

timer_tab_code = timer_tab_code.replace("const [minutes, setMinutes] = useState(25);", "const [totalMinutes, setTotalMinutes] = useState(25);")
timer_tab_code = timer_tab_code.replace("minutes:", "totalMinutes:")
timer_tab_code = timer_tab_code.replace("minutes,", "totalMinutes,")
timer_tab_code = timer_tab_code.replace("autoTimerName(minutes)", "autoTimerName(totalMinutes)")
timer_tab_code = timer_tab_code.replace("setMinutes(", "setTotalMinutes(")
timer_tab_code = timer_tab_code.replace("minutes * 60", "totalMinutes * 60")
timer_tab_code = timer_tab_code.replace("[minutes]", "[totalMinutes]")

# Replace chips
timer_tab_code = timer_tab_code.replace('active={minutes === 25}', 'active={totalMinutes === 25}')
timer_tab_code = timer_tab_code.replace('active={minutes === 50}', 'active={totalMinutes === 50}')
timer_tab_code = timer_tab_code.replace('active={minutes !== 25 && minutes !== 50}', 'active={totalMinutes !== 25 && totalMinutes !== 50}')

# Replace dial with wheel picker
svg_start = timer_tab_code.find("<svg")
svg_end = timer_tab_code.find("</svg>") + 6

wheel_ui = """
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: theme.textPrimary, textAlign: 'center', ...fontDisplay }}>
              {isRunning || remaining !== totalMinutes * 60 ? fmtClock(remaining) : `${Math.floor(totalMinutes / 60)}:${(totalMinutes % 60).toString().padStart(2, '0')}:00`}
            </div>
          </div>

          <div style={{ display: 'flex', width: '100%', maxWidth: 240, gap: 10, opacity: isRunning ? 0.5 : 1 }}>
            <WheelPicker
              values={Array.from({length: 24}, (_, i) => i)}
              selected={Math.floor(totalMinutes / 60)}
              onChange={(h) => setTotalMinutes(Math.max(1, h * 60 + (totalMinutes % 60)))}
              label="hr"
              disabled={isRunning}
              theme={theme} fontBody={fontBody} fontDisplay={fontDisplay}
            />
            <WheelPicker
              values={Array.from({length: 60}, (_, i) => i)}
              selected={totalMinutes % 60}
              onChange={(m) => setTotalMinutes(Math.max(1, Math.floor(totalMinutes / 60) * 60 + m))}
              label="min"
              disabled={isRunning}
              theme={theme} fontBody={fontBody} fontDisplay={fontDisplay}
            />
          </div>
          <div style={{ marginTop: 12, color: theme.textSecondary, fontSize: 11, ...fontBody }}>
            {isRunning ? "running" : "scroll to set duration"}
          </div>
"""

timer_tab_code = timer_tab_code[:svg_start] + wheel_ui + timer_tab_code[svg_end:]

# Clean up SVG related things like `setFromPointer`, `const r = 88;`
# We'll just remove them
to_remove = [
    "    const setFromPointer = (clientX, clientY) => {",
    "    const r = 88;"
]

# We will just do a regex sub to remove `setFromPointer` and its `useEffect`
timer_tab_code = re.sub(r'const setFromPointer =.*?};\n', '', timer_tab_code, flags=re.DOTALL)
timer_tab_code = re.sub(r'useEffect\(\(\) => {\n\s*if \(!dragging\).*?}, \[dragging\]\);\n', '', timer_tab_code, flags=re.DOTALL)
timer_tab_code = re.sub(r'const r = 88;.*?const knobY = 100 \+ r \* Math.sin\(angleRad\);\n', '', timer_tab_code, flags=re.DOTALL)

# Delete unneeded refs and states
timer_tab_code = timer_tab_code.replace("const svgRef = useRef(null);\n", "")
timer_tab_code = timer_tab_code.replace("const [dragging, setDragging] = useState(false);\n", "")

content = content.replace(old_timer_tab_code, timer_tab_code)

with open("src/App.jsx", "w") as f:
    f.write(content)
