"use client";
import { useState } from "react";

interface ChatMessage { role: "user" | "assistant"; content: string; sources?: { chunkIndex: number; text: string; similarity: number }[] }

export default function StoryChat({ storyId }: { storyId: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch(`/api/story/${storyId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((p) => [...p, { role: "assistant", content: data.answer, sources: data.sources }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setMessages((p) => [...p, { role: "assistant", content: `Error: ${msg}` }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ marginTop: 32 }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        background: "#0A0A12", border: "1px solid #14141F", borderRadius: 12,
        padding: "14px 18px", cursor: "pointer", color: "#8A8690", fontSize: 13, fontWeight: 500,
      }}>
        <span style={{ fontSize: 16 }}>💬</span>
        Ask about this story
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#3A3644" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          background: "#0A0A12", border: "1px solid #14141F", borderTop: "none",
          borderRadius: "0 0 12px 12px", padding: 16, maxHeight: 400, display: "flex", flexDirection: "column",
        }}>
          <div style={{ flex: 1, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ fontSize: 12, color: "#2A2A3A", textAlign: "center", padding: 20, fontStyle: "italic" }}>
                Ask anything about your story — characters, plot details, relationships...
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  background: m.role === "user" ? "#7C3AED20" : "#14141F",
                  border: m.role === "user" ? "1px solid #7C3AED30" : "1px solid #1A1A28",
                  borderRadius: 10, padding: "10px 14px", maxWidth: "85%",
                  fontSize: 13, lineHeight: 1.6, color: "#C8C4BF", fontWeight: 300,
                }}>{m.content}</div>
                {m.sources && m.sources.length > 0 && (
                  <div style={{ fontSize: 10, color: "#2A2A3A", marginTop: 4, maxWidth: "85%" }}>
                    Sources: {m.sources.map((s) => `[chunk ${s.chunkIndex}]`).join(", ")}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4B4556" }}>
                <div style={{ width: 12, height: 12, border: "2px solid #7C3AED25", borderTop: "2px solid #7C3AED", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Searching story...
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") ask(); }}
              placeholder="Who is the main character?"
              style={{
                flex: 1, background: "#06060A", border: "1px solid #1A1A28", borderRadius: 8,
                padding: "10px 14px", color: "#E8E4DF", fontSize: 13, outline: "none",
                fontFamily: "'Libre Franklin', sans-serif",
              }}
            />
            <button onClick={ask} disabled={loading || !input.trim()} style={{
              background: "#7C3AED", border: "none", borderRadius: 8, padding: "10px 18px",
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            }}>Ask</button>
          </div>
        </div>
      )}
    </div>
  );
}