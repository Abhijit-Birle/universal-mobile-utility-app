import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# Remove react-player import
content = re.sub(r"import ReactPlayer from 'react-player';\n", "", content)

# Replace state
old_state = '''    const [music, setMusic] = useState("piano");
    const [showYoutube, setShowYoutube] = useState(false);

    const [ytLink, setYtLink] = useState("");
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const playerRef = useRef(null);

    const [fileName, setFileName] = useState("");
    const [fileUrl, setFileUrl] = useState("");'''

new_state = '''    const [activeSource, setActiveSource] = useState('piano');
    const [audioUrl, setAudioUrl] = useState(null);
    const [youtubeId, setYoutubeId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const fileInputRef = useRef(null);
    const audioRef = useRef(null);
    const ytPlayerRef = useRef(null);
    const [ytLink, setYtLink] = useState("");
    
    useEffect(() => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }, []);

    useEffect(() => {
      if (activeSource === 'youtube' && youtubeId && window.YT && window.YT.Player) {
        if (!ytPlayerRef.current) {
          ytPlayerRef.current = new window.YT.Player('yt-audio-player', {
            videoId: youtubeId,
            height: '0',
            width: '0',
            events: { 
              onReady: (e) => { if (isPlaying) e.target.playVideo(); },
              onStateChange: (e) => { if (e.data === window.YT.PlayerState.ENDED) setIsPlaying(false); }
            },
          });
        } else {
          ytPlayerRef.current.loadVideoById(youtubeId);
          if (isPlaying) ytPlayerRef.current.playVideo();
        }
      }
    }, [youtubeId, activeSource]);

    useEffect(() => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: activeSource, artist: 'NeoApp' });
        navigator.mediaSession.setActionHandler('play', () => {
          setIsPlaying(true);
          if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.playVideo) ytPlayerRef.current.playVideo();
          else if (audioRef.current) audioRef.current.play();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          setIsPlaying(false);
          if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
          else if (audioRef.current) audioRef.current.pause();
        });
      }
    }, [activeSource]);

    useEffect(() => {
      if (['piano', 'rain', 'ocean', 'white'].includes(activeSource) && audioRef.current) {
        audioRef.current.src = `/audio/${activeSource}.mp3`;
        audioRef.current.loop = true;
        if (isPlaying) audioRef.current.play();
      } else if (activeSource === 'upload' && audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.loop = true;
        if (isPlaying) audioRef.current.play();
      }
    }, [activeSource, audioUrl]);

    const handlePlayPause = () => {
      const newIsPlaying = !isPlaying;
      setIsPlaying(newIsPlaying);
      if (newIsPlaying) {
        if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.playVideo) ytPlayerRef.current.playVideo();
        else if (audioRef.current) audioRef.current.play();
      } else {
        if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
        else if (audioRef.current) audioRef.current.pause();
      }
    };

    const handleStop = () => {
      setIsPlaying(false);
      if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
      else if (audioRef.current) audioRef.current.pause();
    };

    const handleReset = () => {
      setIsPlaying(false);
      if (activeSource === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.seekTo) {
        ytPlayerRef.current.pauseVideo();
        ytPlayerRef.current.seekTo(0);
      } else if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
    
    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (audioRef.current) audioRef.current.pause();
        if (ytPlayerRef.current && ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
        setAudioUrl(URL.createObjectURL(file));
        setActiveSource('upload');
      }
    };

    const extractYoutubeId = (url) => {
      const match = url.match(/(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? match[1] : null;
    };
'''

content = content.replace(old_state, new_state)

# Replace the UI part
old_ui = r'<SectionLabel style={{ marginTop: 24 }}>Ambience / music</SectionLabel>.*?</NeoSurface>'
new_ui = '''<SectionLabel style={{ marginTop: 24 }}>Ambience / music</SectionLabel>
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
                    <Video size={14} /> YouTube link
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
          </NeoSurface>'''

content = re.sub(r'<SectionLabel style={{ marginTop: 24 }}>Ambience / music</SectionLabel>.*?</NeoSurface>', new_ui, content, flags=re.DOTALL)

with open("src/App.jsx", "w") as f:
    f.write(content)
