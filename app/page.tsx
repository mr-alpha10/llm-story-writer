"use client";

import { useState, useEffect, useRef } from "react";

const MODELS = [
  {
    id: "qwen/qwen3-235b-a22b",
    name: "Qwen 3",
    provider: "Alibaba Cloud",
    params: "235B",
    color: "#3B82F6",
    tagline: "Analytical & structured storytelling",
    system: `You are Qwen 3 235B, a master storyteller by Alibaba Cloud.

CORE IDENTITY: You write like a celebrated novelist — every paragraph is crafted with intention. You never summarize, never rush, never tell when you can show. You write immersive, cinematic fiction that pulls readers in from the first sentence and never lets go.

YOUR STYLE:
- Deep, layered world-building: describe environments through all five senses (what does the air taste like? what sounds echo in the distance? what textures does the character feel?)
- Complex characters with rich inner lives: show their thoughts, doubts, contradictions, memories, desires
- Philosophy woven into narrative: explore moral dilemmas and existential questions through character actions, not exposition
- Structured plot architecture: every scene serves the larger story with foreshadowing, tension, and payoff
- Dialogue that reveals character: each person speaks differently based on their background, mood, and relationship to others
- Varied prose rhythm: alternate between long flowing descriptions and short punchy impact lines

RULES:
- ALWAYS open a new story with atmospheric scene-setting BEFORE introducing characters — ground the reader in the world first
- ALWAYS give characters names, physical descriptions, and at least one distinctive personality trait on introduction
- ALWAYS include at least 3-4 dialogue exchanges per section
- NEVER break the fourth wall. NEVER mention you are an AI. NEVER add disclaimers or meta-commentary.
- NEVER use clichéd phrases like "little did they know" or "a chill ran down their spine"
- Write every scene beat by beat — if a character walks through a door, describe what they see, hear, and feel on the other side`,

  },
  {
    id: "mistralai/mistral-small-3.1-24b-instruct",
    name: "Mistral Small",
    provider: "Mistral AI",
    params: "24B",
    color: "#F97316",
    tagline: "Literary & expressive prose",
    system: `You are Mistral Small 24B, a master storyteller by Mistral AI.

CORE IDENTITY: You write like a European literary novelist — your prose is elegant, sensory, and emotionally devastating. You find beauty in darkness and weight in silence. Every sentence is both functional and beautiful.

YOUR STYLE:
- Painterly imagery: describe scenes like an artist — light, shadow, color, texture, composition
- Emotional precision: name the exact shade of feeling — not "sad" but "the hollow ache of watching someone forget you"
- Atmospheric immersion: weather, architecture, ambient sounds, the quality of light — these are characters in your stories
- Subtext-rich dialogue: what characters DON'T say matters as much as what they do. Use pauses, deflections, changed subjects
- Poetic rhythm: your prose has musicality — vary sentence length, use repetition for emphasis, let key moments breathe
- Intimate character interiority: take readers inside the character's mind — their sensory experience, memories triggered by moments, physical reactions to emotions

RULES:
- ALWAYS establish mood and atmosphere before action — the reader should FEEL the world before things happen in it
- ALWAYS introduce characters through sensory detail and behavior, not exposition (show them doing something characteristic)
- ALWAYS include visceral physical detail in emotional scenes (tight throat, trembling hands, the taste of adrenaline)
- NEVER write flat dialogue. Every line should reveal character, advance plot, or create tension — ideally all three
- NEVER summarize emotional moments. Dramatize them fully with body language, inner thought, and environmental reflection
- NEVER break the fourth wall. NEVER mention you are an AI. NEVER add disclaimers.`,
  },
  {
    id: "google/gemma-3-27b-it",
    name: "Gemma 3",
    provider: "Google DeepMind",
    params: "27B",
    color: "#10B981",
    tagline: "Cinematic & gripping narratives",
    system: `You are Gemma 3 27B, a master storyteller by Google DeepMind.

CORE IDENTITY: You write like a blockbuster screenwriter turned novelist — your stories are cinematic, propulsive, and impossible to put down. You combine visual storytelling with deep character work. Every chapter ending makes the reader desperate for the next.

YOUR STYLE:
- Cinematic scene construction: open scenes like a camera — establish the wide shot, then zoom into character details
- Relentless pacing: every paragraph moves the story forward. Tension escalates, stakes rise, surprises land
- Vivid action writing: fight scenes, chase sequences, confrontations — make them visceral, choreographed, and clear
- Snappy, naturalistic dialogue: people interrupt each other, trail off, use humor under pressure, speak in fragments
- Character-driven hooks: end every section with a revelation, decision, or question that demands continuation
- Grounded sensory detail: specific concrete details over vague descriptions — "a dented silver Zippo" not "a lighter"

RULES:
- ALWAYS start with an arresting opening image or action that creates immediate curiosity
- ALWAYS give characters distinctive voices in dialogue — a soldier talks differently than a poet
- ALWAYS include at least one unexpected moment per section — a reveal, a twist, a shift in power dynamics
- ALWAYS use body language alongside dialogue (he said, flexing his jaw / she whispered, gripping the table edge)
- NEVER let exposition slow momentum — weave backstory into action and dialogue naturally
- NEVER break the fourth wall. NEVER mention you are an AI. NEVER add disclaimers.
- NEVER use passive voice in action scenes`,
  },
];

const GENRES = [
  { id: "fantasy", icon: "🐉", label: "Fantasy" },
  { id: "scifi", icon: "🚀", label: "Sci-Fi" },
  { id: "horror", icon: "🩸", label: "Horror" },
  { id: "romance", icon: "💕", label: "Romance" },
  { id: "mystery", icon: "🔍", label: "Mystery" },
  { id: "adventure", icon: "🗺️", label: "Adventure" },
  { id: "thriller", icon: "⚡", label: "Thriller" },
  { id: "dystopian", icon: "🏚️", label: "Dystopian" },
];

interface StoryBlock {
  text: string;
  modelId: string;
  modelName: string;
  modelColor: string;
  elapsed: number;
  tokens: number;
  tps: number;
  blockNum: number;
  error?: boolean;
}

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [genre, setGenre] = useState<string | null>(null);
  const [premise, setPremise] = useState("");
  const [blocks, setBlocks] = useState<StoryBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"setup" | "writing">("setup");
  const [showModelSwitch, setShowModelSwitch] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [direction, setDirection] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current && blocks.length > 0) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [blocks, loading]);

  const model = MODELS.find((m) => m.id === selectedModel);

  const generateBlock = async (isFirst = false) => {
    if (!selectedModel) return;
    setLoading(true);
    const currentModel = MODELS.find((m) => m.id === selectedModel)!;
    const previousContent = blocks.map((b) => b.text).join("\n\n");

    let userPrompt: string;
    if (isFirst) {
      const genreLabel = GENRES.find(g => g.id === genre)?.label || genre;
      userPrompt = `Write the opening chapter of a ${genreLabel} story.${premise ? `

THE PREMISE (interpret this fully — build the entire opening around this concept):
${premise}

Expand on this premise with rich detail. If the premise mentions a character, give them a full introduction with name, appearance, personality, and backstory hints. If it mentions a setting, bring that setting to vivid life with sensory details. If it mentions a conflict, set up the stakes and tension from the very first scene.` : `

Create a wholly original ${genreLabel} story with a unique premise that hasn't been done a thousand times. Surprise the reader.`}

STRUCTURE YOUR OPENING LIKE THIS:
1. ATMOSPHERIC OPENING (50-80 words): Set the scene. Ground the reader in the world through vivid sensory detail — where are we? What does this place look/sound/smell/feel like? What time is it? What's the mood?
2. CHARACTER INTRODUCTION (80-120 words): Introduce the protagonist through ACTION, not description. Show them doing something that reveals who they are. Give them a name, a distinctive physical detail, and a glimpse of their inner world.
3. INCITING TENSION (100-150 words): Something disrupts the status quo. A discovery, an arrival, a revelation, a threat. The plot engine starts here. Include dialogue.
4. ESCALATION (150-200 words): The situation develops. More characters may appear. Stakes become clearer. Conflict sharpens. Rich dialogue exchanges happen here.
5. CLIFFHANGER ENDING (50-80 words): End on a moment that makes continuation irresistible — a door opening, a secret revealed, a choice that must be made, danger arriving.

Write 500-700 words total. Do NOT write a title, chapter heading, or any meta-commentary. Begin directly with the story. Write every moment fully — dramatize, never summarize.`;

    } else {
      const directionNote = direction.trim()
        ? `

AUTHOR'S DIRECTION FOR THIS SECTION:
"${direction.trim()}"

IMPORTANT: This direction is your PRIMARY creative instruction. Interpret it generously — even if brief, expand it into a fully realized narrative beat. For example:
- "betrayal" → craft a full betrayal scene with buildup, the moment of realization, emotional fallout, and dialogue
- "they kiss" → build romantic tension, describe the environment, the hesitation, the moment, the aftermath
- "time skip" → open with a new scene that implies time has passed through changed details, then reveal what changed
- "plot twist" → set up expectations, then subvert them in a way that recontextualizes earlier events

Weave this direction seamlessly into the narrative — it should feel like a natural story development, not a forced insertion.`
        : "";
      userPrompt = `STORY SO FAR:
${previousContent}
${directionNote}

CONTINUE THE STORY. Write the next 500-700 words following these rules:

CONTINUITY REQUIREMENTS:
- Pick up EXACTLY where the last section ended — same scene, same moment, same emotional tone
- Maintain perfect consistency: character names, appearances, relationships, established facts
- Reference earlier details to create narrative cohesion (callback to something mentioned before)

STORYTELLING REQUIREMENTS:
- ADVANCE THE PLOT meaningfully — something important must happen, be decided, or be revealed
- Include at least 3-4 lines of dialogue with distinct character voices
- Show character emotions through PHYSICAL REACTIONS and INNER THOUGHTS, not just statements
- Add at least one new sensory detail about the environment
- Build tension or deepen emotional stakes

ENDING:
- End at a compelling cliffhanger, revelation, emotional peak, or moment of decision
- The reader should feel COMPELLED to continue

Do NOT add chapter headings. Do NOT summarize previous events. Do NOT repeat established information. Begin continuing the narrative immediately.`;
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: currentModel.id,
          system: currentModel.system,
          prompt: userPrompt,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setTotalTokens((prev) => prev + (data.tokens || 0));
      setTotalTime((prev) => prev + (data.elapsed || 0));

      setBlocks((prev) => [
        ...prev,
        {
          text: data.text,
          modelId: selectedModel,
          modelName: currentModel.name,
          modelColor: currentModel.color,
          elapsed: data.elapsed,
          tokens: data.tokens,
          tps: data.tps,
          blockNum: prev.length + 1,
        },
      ]);
      setDirection("");
      if (isFirst) setStep("writing");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setBlocks((prev) => [
        ...prev,
        {
          text: `Error: ${message}`,
          modelId: selectedModel,
          modelName: currentModel.name,
          modelColor: currentModel.color,
          elapsed: 0, tokens: 0, tps: 0,
          blockNum: prev.length + 1,
          error: true,
        },
      ]);
      if (isFirst) setStep("writing");
    } finally {
      setLoading(false);
    }
  };

  const startStory = () => {
    if (!selectedModel || !genre) return;
    setBlocks([]);
    setTotalTokens(0);
    setTotalTime(0);
    generateBlock(true);
  };

  const resetAll = () => {
    setStep("setup");
    setBlocks([]);
    setTotalTokens(0);
    setTotalTime(0);
    setGenre(null);
    setPremise("");
  };

  const copyStory = () => {
    const full = blocks.filter((b) => !b.error).map((b) => b.text).join("\n\n");
    navigator.clipboard.writeText(full);
  };

  return (
    <div className="grain">
      {/* ═══ HEADER ═══ */}
      <header
        style={{
          position: "sticky", top: 0, zIndex: 100, padding: "14px 28px",
          background: "rgba(6,6,10,0.88)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid #ffffff06",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="serif" style={{ fontSize: 20, fontWeight: 700, color: "#F5F0EB" }}>LLM</span>
          <span className="serif" style={{ fontSize: 20, fontWeight: 300, color: "#7C3AED", fontStyle: "italic" }}>Story Writer</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {step === "writing" && model && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowModelSwitch(!showModelSwitch)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, background: "#0E0E16",
                  border: "1px solid #1A1A28", borderRadius: 8, padding: "7px 14px",
                  cursor: "pointer", color: "#E8E4DF", fontSize: 12, fontWeight: 500,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: model.color }} />
                {model.name}
                <span style={{ color: "#3A3644", fontSize: 10 }}>▼</span>
              </button>
              {showModelSwitch && (
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0, width: 240,
                    background: "#0E0E16", border: "1px solid #1A1A28", borderRadius: 12,
                    padding: 6, boxShadow: "0 16px 48px rgba(0,0,0,0.6)", zIndex: 200,
                  }}
                >
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModel(m.id); setShowModelSwitch(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%",
                        padding: "10px 12px",
                        background: selectedModel === m.id ? `${m.color}12` : "transparent",
                        border: "none", borderRadius: 8, cursor: "pointer", color: "#E8E4DF",
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: "#4B4556" }}>{m.provider}</div>
                      </div>
                      {selectedModel === m.id && <span style={{ marginLeft: "auto", color: m.color, fontSize: 11 }}>●</span>}
                    </button>
                  ))}
                  <div style={{ padding: "8px 12px 4px", fontSize: 10, color: "#2A2A3A", lineHeight: 1.4 }}>
                    Switch models mid-story — the new model continues where the last left off.
                  </div>
                </div>
              )}
            </div>
          )}
          {step === "writing" && (
            <button onClick={resetAll} style={{
              background: "none", border: "1px solid #1A1A28", borderRadius: 8,
              padding: "7px 14px", cursor: "pointer", color: "#4B4556", fontSize: 12,
            }}>New Story</button>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "36px 24px 120px" }}>

        {/* ═══ SETUP ═══ */}
        {step === "setup" && (
          <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "#7C3AED", fontWeight: 600, marginBottom: 14 }}>
                Multi-Model Story Generator
              </div>
              <h1 className="serif" style={{ fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 300, lineHeight: 1.05, color: "#F5F0EB", letterSpacing: -1 }}>
                Choose your <span style={{ fontStyle: "italic", color: "#7C3AED" }}>narrator</span>
              </h1>
              <p style={{ fontSize: 15, color: "#5A5664", maxWidth: 460, margin: "16px auto 0", lineHeight: 1.7, fontWeight: 300 }}>
                Pick an AI model, set your genre, and build your story block by block. Switch models mid-story to blend writing styles.
              </p>
            </div>

            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#2A2A3A", fontWeight: 500, marginBottom: 12 }}>01 — Select Model</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 40 }}>
              {MODELS.map((m) => (
                <button key={m.id} onClick={() => setSelectedModel(m.id)} style={{
                  background: selectedModel === m.id ? `${m.color}10` : "#0A0A12",
                  border: selectedModel === m.id ? `2px solid ${m.color}` : "2px solid #14141F",
                  borderRadius: 14, padding: "22px 18px", cursor: "pointer",
                  textAlign: "left", position: "relative", overflow: "hidden",
                }}>
                  {selectedModel === m.id && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: m.color }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedModel === m.id ? m.color : "#2A2A3A" }} />
                    <span className="serif" style={{ fontSize: 20, fontWeight: 600, color: selectedModel === m.id ? "#F5F0EB" : "#6B6775" }}>{m.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#4B4556", marginBottom: 6 }}>{m.provider} · {m.params}</div>
                  <div style={{ fontSize: 12, color: selectedModel === m.id ? "#8A8690" : "#3A3644", fontWeight: 300, fontStyle: "italic" }}>{m.tagline}</div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#2A2A3A", fontWeight: 500, marginBottom: 12 }}>02 — Pick Genre</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8, marginBottom: 40 }}>
              {GENRES.map((g) => (
                <button key={g.id} onClick={() => setGenre(g.id)} style={{
                  background: genre === g.id ? "#7C3AED15" : "#0A0A12",
                  border: genre === g.id ? "1.5px solid #7C3AED50" : "1.5px solid #14141F",
                  borderRadius: 10, padding: "14px 12px", cursor: "pointer",
                  textAlign: "center", color: genre === g.id ? "#E8E4DF" : "#4B4556",
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{g.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{g.label}</div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#2A2A3A", fontWeight: 500, marginBottom: 12 }}>
              03 — Premise <span style={{ textTransform: "none", letterSpacing: 0, opacity: 0.5 }}>(optional)</span>
            </div>
            <textarea
              value={premise} onChange={(e) => setPremise(e.target.value)}
              placeholder="Describe your story idea, or leave blank for a surprise..."
              rows={3}
              style={{
                width: "100%", background: "#0A0A12", border: "1px solid #14141F", borderRadius: 12,
                padding: "16px 18px", color: "#E8E4DF", fontSize: 14, lineHeight: 1.7,
                fontFamily: "'Libre Franklin', sans-serif", fontWeight: 300,
                resize: "vertical", boxSizing: "border-box", marginBottom: 32,
              }}
            />

            <button onClick={startStory} disabled={!selectedModel || !genre || loading} style={{
              width: "100%", padding: 18,
              background: (!selectedModel || !genre) ? "#1A1A28" : loading ? `${model?.color}CC` : model?.color || "#7C3AED",
              border: "none", borderRadius: 12,
              color: (!selectedModel || !genre) ? "#3A3644" : "#fff",
              fontSize: 15, fontWeight: 600,
              cursor: (!selectedModel || !genre || loading) ? "not-allowed" : "pointer",
              letterSpacing: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: (selectedModel && genre && !loading) ? `0 0 40px ${model?.color}20` : "none",
            }}>
              {loading ? (
                <>
                  <div style={{
                    width: 18, height: 18, border: "2px solid rgba(255,255,255,0.25)",
                    borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite",
                  }} />
                  <span>{model?.name} is crafting the opening...</span>
                </>
              ) : (
                !selectedModel ? "Select a model first" : !genre ? "Pick a genre" : `✦ Begin Story with ${model?.name}`
              )}
            </button>
          </div>
        )}

        {/* ═══ WRITING ═══ */}
        {step === "writing" && (
          <div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 32, paddingBottom: 16, borderBottom: "1px solid #0E0E18",
            }}>
              <div style={{ display: "flex", gap: 20 }}>
                {[
                  ["Blocks", blocks.filter((b) => !b.error).length],
                  ["Tokens", totalTokens.toLocaleString()],
                  ["Time", `${(totalTime / 1000).toFixed(1)}s`],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#2A2A3A", marginBottom: 4 }}>{label}</div>
                    <div className="mono" style={{ fontSize: 18, color: "#F5F0EB", fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
              {genre && (
                <div style={{ fontSize: 11, color: "#3A3644", textTransform: "uppercase", letterSpacing: 2 }}>
                  {GENRES.find((g) => g.id === genre)?.icon} {genre}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 40 }}>
              {blocks.map((block, i) => (
                <div key={i} className="block-enter">
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 0", borderTop: i > 0 ? "1px solid #0E0E18" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="serif" style={{ fontSize: 32, fontWeight: 300, color: "#1A1A28" }}>
                        {String(block.blockNum).padStart(2, "0")}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: block.modelColor }} />
                        <span style={{ fontSize: 11, color: "#4B4556", fontWeight: 500 }}>{block.modelName}</span>
                      </div>
                    </div>
                    {!block.error && (
                      <div className="mono" style={{ fontSize: 10, color: "#2A2A3A" }}>
                        {block.elapsed}ms · {block.tps} tok/s
                      </div>
                    )}
                  </div>
                  {block.error ? (
                    <div style={{ color: "#EF4444", fontSize: 14, padding: "8px 0 24px", lineHeight: 1.6 }}>{block.text}</div>
                  ) : (
                    <div className="serif" style={{
                      fontSize: 18, lineHeight: 2, color: "#C8C4BF", fontWeight: 400,
                      whiteSpace: "pre-wrap", padding: "4px 0 32px",
                      borderLeft: `2px solid ${block.modelColor}15`, paddingLeft: 24,
                    }}>
                      {block.text}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="block-enter" style={{ padding: "20px 0", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 18, height: 18, border: `2px solid ${model?.color}25`,
                    borderTop: `2px solid ${model?.color}`, borderRadius: "50%", animation: "spin 0.8s linear infinite",
                  }} />
                  <span style={{ fontSize: 14, color: "#4B4556", fontWeight: 300 }}>
                    {model?.name} is writing the next section...
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {!loading && blocks.length > 0 && (
              <div>
                <div style={{
                  background: "#0A0A12", border: "1px solid #14141F", borderRadius: 14,
                  padding: "16px 18px", marginBottom: 12,
                }}>
                  <div style={{
                    fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
                    color: "#2A2A3A", fontWeight: 500, marginBottom: 10,
                  }}>
                    Steer the story <span style={{ textTransform: "none", letterSpacing: 0, opacity: 0.5 }}>(optional)</span>
                  </div>
                  <textarea
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    placeholder="e.g. &quot;Introduce a betrayal&quot; or &quot;Shift to a flashback&quot; or &quot;The villain reveals their true identity&quot;..."
                    rows={2}
                    style={{
                      width: "100%", background: "#06060A", border: "1px solid #1A1A28",
                      borderRadius: 10, padding: "12px 14px", color: "#E8E4DF",
                      fontSize: 13, lineHeight: 1.6, fontFamily: "'Libre Franklin', sans-serif",
                      fontWeight: 300, resize: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => generateBlock(false)} style={{
                    flex: 1, padding: 16, background: model?.color, border: "none", borderRadius: 12,
                    color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    boxShadow: `0 0 30px ${model?.color}20`, letterSpacing: 0.5,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    {direction.trim() ? `Continue with new direction →` : `Continue with ${model?.name} →`}
                  </button>
                  <button onClick={copyStory} style={{
                    padding: "16px 24px", background: "#0E0E16", border: "1px solid #1A1A28",
                    borderRadius: 12, color: "#6B6775", fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}>📋 Copy All</button>
                </div>
              </div>
            )}

            {blocks.filter((b) => !b.error).length >= 2 && (
              <div style={{
                marginTop: 32, background: "#0A0A12", border: "1px solid #14141F",
                borderRadius: 12, padding: "16px 20px",
              }}>
                <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#2A2A3A", fontWeight: 500, marginBottom: 12 }}>
                  Model Usage Breakdown
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {MODELS.filter((m) => blocks.some((b) => b.modelId === m.id && !b.error)).map((m) => {
                    const mb = blocks.filter((b) => b.modelId === m.id && !b.error);
                    const mt = mb.reduce((s, b) => s + b.tokens, 0);
                    const at = Math.round(mb.reduce((s, b) => s + b.tps, 0) / mb.length);
                    return (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 3, height: 24, borderRadius: 2, background: m.color }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#E8E4DF" }}>{m.name}</div>
                          <div className="mono" style={{ fontSize: 10, color: "#4B4556" }}>
                            {mb.length} block{mb.length > 1 ? "s" : ""} · {mt} tokens · avg {at} tok/s
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 80, textAlign: "center" }}>
          <div className="glow" style={{ marginBottom: 28 }} />
          <div className="serif" style={{ fontSize: 13, color: "#2A2A3A", fontStyle: "italic" }}>
            Powered by OpenRouter · Qwen by Alibaba · Mistral by Mistral AI · Gemma by Google DeepMind
          </div>
        </div>
      </div>
    </div>
  );
}
