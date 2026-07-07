import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# 1. Add fileUrl state
content = content.replace(
    'const [fileName, setFileName] = useState("");',
    'const [fileName, setFileName] = useState("");\n    const [fileUrl, setFileUrl] = useState("");'
)

# 2. Update MUSIC_OPTIONS onClick to clear fileUrl
content = content.replace(
    'onClick={() => { setMusic(m.id); setShowYoutube(false); }}',
    'onClick={() => { setMusic(m.id); setShowYoutube(false); setFileUrl(""); }}'
)

# 3. Update the file input onChange to set fileUrl and clear youtube
new_on_change = '''onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFileName(file.name);
                    setFileUrl(URL.createObjectURL(file));
                    setShowYoutube(false);
                    setIsPlayingAudio(true);
                  }
                }}'''
content = re.sub(
    r'onChange=\{\(e\) => setFileName\(e\.target\.files\?\.\[0\]\?\.name \|\| ""\)\}',
    new_on_change,
    content
)

# 4. Update the ReactPlayer wrapper logic
old_player = r'            \{\/\* Hidden ReactPlayer \*\/\}.*?<\/div>\n            \)\}'
new_player = '''            {/* Hidden ReactPlayer */}
            {(ytLink && showYoutube) || fileUrl ? (
              <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", visibility: "hidden" }}>
                <ReactPlayer 
                  ref={playerRef}
                  url={showYoutube ? (ytLink.startsWith('http') ? ytLink : `https://${ytLink}`) : fileUrl} 
                  playing={isPlayingAudio} 
                  controls={false}
                  width="0" 
                  height="0"
                  onEnded={() => setIsPlayingAudio(false)}
                />
              </div>
            ) : null}'''

content = re.sub(old_player, new_player, content, flags=re.DOTALL)

with open("src/App.jsx", "w") as f:
    f.write(content)
