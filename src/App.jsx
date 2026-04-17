import { useState, useEffect, useRef } from "react";

const DROPBOX_TOKEN = "sl.u.AGZkxHGiJN1GfOzW_GdtLq36hRFYT_NV0ELUqu2Oz623opNkVhM5nlN_rrCvR5hKDsSzzhCgJGv3OWnwkJZn8JmNntAD7CL890TP1Wt9EQaWl9K2YWEQxTnA1YQDOYmDpKGIbIbaQSewdsBLcQKWG1zN6oZCbgZHnDpZ9Zb0kSFwVaWqUufrRSB86FlrLkbkKMGe4XOjvGeIDv2L1Oya3I8RIYXPBHdmnylZX6bcc7Rtg_nen6NGx7ynP_sqvTr5_GXtOJKK0nOs9BzyVDfy2HOs-TBd3Kn3d0PrXbUV9_7KOyukiCgKyEZ7-2o0ELOGM8SNBULiTjLvmhYG6pvD3zzh3WXWKW3TYe2_nBpUHjOQLW1wnn23iqFaq1nYIzblw8jIBrWUwlfeTATtIwHKmTsmipSBuzm2-cKkjYdyqU7SGcsddYKxtC084hfR39Zdjwsyda5ILae2WFa_rNy2pzXjWZZ73RqGT66z1jughm-cv2oga0IsN8alHF_dQYq0W_Aj0_IpvseWmZWAT5A2sUosAfj50N6KbtpP2BRnYGiNKHmEI1mt_pzCsVs99suUO3oS7P1IMV-8Pbj0hFXG2SZY2JQ4SyPq2YCLnuXwb8QuHw1aZmnHClcQgBOhRktkJ73QWCfwuNIo504auYH6Xy4gyCm-K6YleFQ9sM9rEaI64gH3IZ4FSeeyezqcln6DTGANDIg8WAfLTdDx52WpTWHp455T12YsJ1FMm1W68UaH0q6sTkaEkCPlsowxyMhVPJKf-b_hWvc-aumkHCdabylrXU1J0tVaD5AsYy6wfsbhqnkmKs4WSiG5oYSc9erKjFTt5YcprzZvYI6NWatjPyQ42vyYcf67CHA_RwDJvDi_caxKlOz7a5KGVzc2GZCCCg9JZ3IbWje4W8gD3GTEsH4l_I01HDfvkW4wpF4uBbPPXa-QU9UxuUvWuJQy7HRVug_gdSZsnb-c9x51nwORowd0vsbdyKlU5eIZpGzDi1ANygqbES6J-Ip11H8GJoc6KFEQtz_bQQLX9n6cxjMzmPoRPBvzrzp5tFI-dzEVRGYZTDR8D_yP0yCDVnB9CLqqipI6Om6Tf_Og5STYb4ok7w9p7Fg3fc5cP9jJQjQ-R3uBGKhy8e4yTV4rLuJIjt-dws7ccMR9ztW3e9DgTUc2HRE6MTZoxb1dZEv5ThlyIHPMU0AChDyz8lrUGHZC-CkHhUfZtlJzz59Dw6hEJ6JEqis-17TOb1Gm22OfI5KR49gRP8TBwAcW74SBYa10QbmMNBE";

const ROOT_FOLDER = "/MNVRS_Idea Pipeline";

const FOLDERS = [
  { id: "incoming", label: "Incoming", path: `${ROOT_FOLDER}/Incoming`, color: "#06b6d4", icon: "⬇", desc: "New ideas awaiting review" },
  { id: "selected", label: "Selected to Develop", path: `${ROOT_FOLDER}/Selected to Develop`, color: "#f59e0b", icon: "✦", desc: "Approved for development" },
  { id: "inprogress", label: "In Progress", path: `${ROOT_FOLDER}/In Progress`, color: "#10b981", icon: "▶", desc: "Actively being worked on" },
];

const C = {
  bg: "#080810", surface: "#0f0f1a", card: "#14141f", elevated: "#1a1a28",
  border: "#ffffff0f", accent: "#6d28d9", accentBright: "#8b5cf6",
  text: "#f1f0ff", muted: "#6b6b8a", subtle: "#1e1e30",
};

function Avatar({ name, size = 32 }) {
  const colors = ["#6d28d9", "#0891b2", "#059669", "#d97706", "#dc2626"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
      {name[0].toUpperCase()}
    </div>
  );
}

function Spinner() {
  return <div style={{ width: 18, height: 18, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.accentBright}`, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />;
}

function WaveformViz({ color, active }) {
  const heights = [6,10,16,22,18,26,20,14,24,18,12,20,16,10,8,12,18,22,16,10,14,20,24,18,12,8,14,18,22,16,10,6];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 32, padding: "0 4px" }}>
      {heights.map((h, i) => (
        <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: active ? color : C.border, animation: active ? `wavebar 0.${8 + (i % 5)}s ease-in-out ${i * 0.03}s infinite alternate` : "none" }} />
      ))}
    </div>
  );
}

function FileCard({ file, folderColor, onMove, onPlay, isPlaying }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [moving, setMoving] = useState(false);
  const name = file.name.replace(/\.wav$/i, "").replace(/_/g, " ");
  const size = file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "—";
  const otherFolders = FOLDERS.filter(f => f.id !== file.folderId);

  const handleMove = async (targetFolder) => {
    setMoving(true);
    await onMove(file, targetFolder);
    setMoving(false);
  };

  const addNote = () => {
    if (!note.trim()) return;
    setNotes(prev => [...prev, { text: note.trim(), time: "just now" }]);
    setNote("");
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${expanded ? folderColor + "44" : C.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.2s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <button onClick={(e) => { e.stopPropagation(); onPlay(file); }} style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: isPlaying ? folderColor : C.elevated, border: `1px solid ${isPlaying ? folderColor : C.border}`, color: isPlaying ? "#fff" : C.muted, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
          {isPlaying ? "■" : "▶"}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textTransform: "capitalize" }}>{name}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{size} · WAV</div>
        </div>
        {isPlaying && <WaveformViz color={folderColor} active />}
        {notes.length > 0 && <span style={{ background: C.accentBright + "22", color: C.accentBright, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 600 }}>{notes.length} note{notes.length > 1 ? "s" : ""}</span>}
        <span style={{ color: C.muted, fontSize: 12, display: "inline-block", transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>▾</span>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 16px", background: C.elevated }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>MOVE TO</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {otherFolders.map(f => (
                <button key={f.id} onClick={() => handleMove(f)} disabled={moving} style={{ background: C.card, border: `1px solid ${f.color}44`, borderRadius: 8, padding: "6px 12px", cursor: moving ? "wait" : "pointer", color: f.color, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, opacity: moving ? 0.6 : 1 }}>
                  {moving ? <Spinner /> : f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>NOTES</div>
            {notes.map((n, i) => (
              <div key={i} style={{ background: C.card, borderRadius: 8, padding: "8px 10px", marginBottom: 6, fontSize: 12, color: C.text, lineHeight: 1.5, border: `1px solid ${C.border}` }}>
                <span style={{ color: C.accentBright, fontWeight: 600 }}>You</span>
                <span style={{ color: C.muted }}> · {n.time}</span>
                <div style={{ marginTop: 3 }}>{n.text}</div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input value={note} onChange={e => setNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder="Add a note… (Enter to save)" style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", color: C.text, fontSize: 12, outline: "none" }} />
              <button onClick={addNote} style={{ background: C.accentBright, border: "none", borderRadius: 8, color: "#fff", padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}function FolderPanel({ folder, files, loading, onMove, onPlay, playingFile }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 300 }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, background: `linear-gradient(135deg, ${folder.color}11, transparent)`, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${folder.color}88, transparent)` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: folder.color + "22", border: `1px solid ${folder.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{folder.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{folder.label}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{folder.desc}</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ background: folder.color + "22", color: folder.color, border: `1px solid ${folder.color}44`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
              {loading ? "…" : files.length}
            </span>
          </div>
        </div>
      </div>
      <div style={{ padding: 14, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, gap: 10, color: C.muted, fontSize: 13 }}>
            <Spinner /> Loading from Dropbox…
          </div>
        ) : files.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 20px", color: C.muted, fontSize: 13, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
            No WAV files in this folder
          </div>
        ) : (
          files.map(file => (
            <FileCard key={file.id} file={file} folderColor={folder.color} onMove={onMove} onPlay={onPlay} isPlaying={playingFile && playingFile.id === file.id} />
          ))
        )}
      </div>
    </div>
  );
}

export default function StemFlow() {
  const [filesByFolder, setFilesByFolder] = useState({ incoming: [], selected: [], inprogress: [] });
  const [loading, setLoading] = useState({ incoming: true, selected: true, inprogress: true });
  const [error, setError] = useState(null);
  const [playingFile, setPlayingFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [connected, setConnected] = useState(false);
  const audioRef = useRef(null);

  const fetchFolder = async (folder) => {
    try {
      const res = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
        method: "POST",
        headers: { "Authorization": `Bearer ${DROPBOX_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ path: folder.path, recursive: false }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error_summary || "Dropbox error"); }
      const data = await res.json();
      const wavFiles = data.entries.filter(f => f[".tag"] === "file" && f.name.toLowerCase().endsWith(".wav")).map(f => ({ ...f, folderId: folder.id, folderPath: folder.path }));
      setFilesByFolder(prev => ({ ...prev, [folder.id]: wavFiles }));
      setConnected(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, [folder.id]: false }));
    }
  };

  useEffect(() => { FOLDERS.forEach(fetchFolder); }, []);

  const handleMove = async (file, targetFolder) => {
    try {
      const res = await fetch("https://api.dropboxapi.com/2/files/move_v2", {
        method: "POST",
        headers: { "Authorization": `Bearer ${DROPBOX_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from_path: file.path_lower, to_path: `${targetFolder.path.toLowerCase()}/${file.name}`, autorename: true }),
      });
      if (!res.ok) throw new Error("Move failed");
      setFilesByFolder(prev => {
        const updated = { ...prev };
        updated[file.folderId] = updated[file.folderId].filter(f => f.id !== file.id);
        updated[targetFolder.id] = [{ ...file, folderId: targetFolder.id }, ...updated[targetFolder.id]];
        return updated;
      });
    } catch (err) { alert("Could not move file: " + err.message); }
  };

  const handlePlay = async (file) => {
    if (playingFile && playingFile.id === file.id) {
      audioRef.current.pause();
      setPlayingFile(null);
      setAudioUrl(null);
      return;
    }
    try {
      const res = await fetch("https://api.dropboxapi.com/2/files/get_temporary_link", {
        method: "POST",
        headers: { "Authorization": `Bearer ${DROPBOX_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ path: file.path_lower }),
      });
      if (!res.ok) throw new Error("Could not get playback link");
      const data = await res.json();
      setAudioUrl(data.link);
      setPlayingFile(file);
    } catch (err) { alert("Playback error: " + err.message); }
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(() => {});
    }
  }, [audioUrl]);

  const totalFiles = Object.values(filesByFolder).flat().length;return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ffffff0f; border-radius: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes wavebar { from { transform: scaleY(0.5); opacity: 0.4; } to { transform: scaleY(1.3); opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { from { opacity: 0.6; } to { opacity: 1; } }
        input { outline: none; }
        input::placeholder { color: #6b6b8a; }
      `}</style>

      <audio ref={audioRef} onEnded={() => { setPlayingFile(null); setAudioUrl(null); }} />

      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
        <div style={{ padding: "16px 28px", borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.accent}, #0891b2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎛</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5, color: C.text }}>STEMFLOW</div>
              <div style={{ color: C.muted, fontSize: 10 }}>MNVRS_Idea Pipeline</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {error ? (
              <div style={{ background: "#ef444422", border: "1px solid #ef444444", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#ef4444" }}>⚠ {error}</div>
            ) : connected ? (
              <div style={{ background: "#05966922", border: "1px solid #05966944", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#10b981", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", animation: "pulse 2s infinite" }} />
                Dropbox Live
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.muted, fontSize: 12 }}>
                <Spinner /> Connecting…
              </div>
            )}
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, color: C.muted }}>
              {totalFiles} WAV{totalFiles !== 1 ? "s" : ""}
            </div>
            <Avatar name="M" size={36} />
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>Idea Pipeline</div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Live Dropbox sync · Play, review, and move tracks between stages</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {FOLDERS.map((folder, i) => (
              <div key={folder.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
                <FolderPanel folder={folder} files={filesByFolder[folder.id]} loading={loading[folder.id]} onMove={handleMove} onPlay={handlePlay} playingFile={playingFile} />
              </div>
            ))}
          </div>
        </div>

        {playingFile && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.elevated, border: `1px solid ${C.accentBright}44`, borderRadius: 16, padding: "12px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: `0 8px 40px ${C.accent}44`, animation: "fadeUp 0.3s ease", zIndex: 200, minWidth: 320 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accentBright, boxShadow: `0 0 8px ${C.accentBright}`, animation: "pulse 1s ease infinite alternate" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{playingFile.name.replace(/\.wav$/i, "").replace(/_/g, " ")}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>Now Playing</div>
            </div>
            <WaveformViz color={C.accentBright} active />
            <button onClick={() => { audioRef.current.pause(); setPlayingFile(null); setAudioUrl(null); }} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, width: 30, height: 30, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>■</button>
          </div>
        )}
      </div>
    </>
  );
}
