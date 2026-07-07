import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# First, let's find the WheelPicker section inside renderTimerTab
# It looks like:
#           {!isRunning && remaining === (hours * 3600 + minutes * 60) ? (
#             <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: svgSize, gap: 16 }}>
# ...
#           )}

# Let's replace the whole NeoSurface that contains the timer visual
neo_surface_pattern = r'<NeoSurface style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>\s*\{\!isRunning.*?</svg>\s*\)\}\s*</NeoSurface>'

new_surface = """<NeoSurface style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: svgSize, gap: 16 }}>
            <WheelPicker 
              items={Array.from({length: 24}, (_, i) => i)} 
              value={isRunning ? Math.floor(remaining / 3600) : hours} 
              onChange={setHours} 
              label="hours" 
              disabled={isRunning}
            />
            <WheelPicker 
              items={Array.from({length: 60}, (_, i) => i)} 
              value={isRunning ? Math.floor((remaining % 3600) / 60) : minutes} 
              onChange={setMinutes} 
              label="min" 
              disabled={isRunning}
            />
            <WheelPicker 
              items={Array.from({length: 60}, (_, i) => i)} 
              value={isRunning ? remaining % 60 : 0} 
              onChange={() => {}} 
              label="sec" 
              disabled={isRunning}
            />
          </div>
        </NeoSurface>"""

content = re.sub(neo_surface_pattern, new_surface, content, flags=re.DOTALL)

with open("src/App.jsx", "w") as f:
    f.write(content)

