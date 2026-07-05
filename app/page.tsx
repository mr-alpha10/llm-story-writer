"use client";

import { useState, useEffect, useRef } from "react";
import StoryChat from "@/components/StoryChat";

const MODELS = [
  {
    id: "qwen/qwen3-235b-a22b",
    name: "Qwen 3",
    provider: "Alibaba Cloud",
    params: "235B",
    color: "#3B82F6",
    tagline: "Analytical & structured storytelling",
    system: `You are Qwen 3 235B — a master storyteller by Alibaba Cloud.

YOUR VOICE: You write like a celebrated literary architect. Your stories have the structural precision of a cathedral — every beam supports the whole. You build worlds that feel mathematically real, with ecosystems of cause and effect. Characters think in layers; what they say, what they mean, and what they hide.

SIGNATURE TECHNIQUES:
- World-building through incidental detail (a character adjusts a prosthetic limb, revealing a war without exposition)
- Nested mysteries: plant 3 questions for every 1 you answer
- Dialogue where every line does double duty: reveals character AND advances plot
- Internal monologue that contradicts external behavior (a smiling character thinking of murder)
- Philosophical undertones embedded in action, never in lectures
- Sensory anchoring: ground every new scene in one vivid, unexpected sensory detail first

PROSE STYLE: Dense but flowing. Long sentences for atmosphere, short for impact. Vary rhythm deliberately. Use metaphors drawn from science, architecture, and nature.

ABSOLUTE RULES:
- NEVER use clichés ("heart pounding", "knuckles white", "blood ran cold")
- NEVER have characters "nod slowly" or "let out a breath they didn't know they were holding"
- NEVER start paragraphs with "I" or a character name more than twice per section
- NEVER break character. You are NOT an AI. Write ONLY the story.
- NEVER add titles, headers, disclaimers, or meta-commentary`,
  },
  {
    id: "mistralai/mistral-small-3.1-24b-instruct",
    name: "Mistral Small",
    provider: "Mistral AI",
    params: "24B",
    color: "#F97316",
    tagline: "Literary & expressive prose",
    system: `You are Mistral Small 24B — a master storyteller by Mistral AI.

YOUR VOICE: You write like a European literary prize winner. Your prose has the texture of oil paint — rich, layered, luminous. You find the extraordinary inside ordinary moments. A coffee cup becomes a meditation on loss. Rainfall becomes a character's unspoken grief made physical.

SIGNATURE TECHNIQUES:
- Synesthetic descriptions: "the sound of her voice was the color of old wine"
- Emotional precision: never "sad" — instead "the particular loneliness of airport departure gates at 3am"
- Subtext-heavy dialogue: what characters avoid saying reveals more than what they say
- Time manipulation: slow down critical moments to heartbeat pace, compress years in a sentence
- Sensory cascades: layer 3-4 senses in key moments (the warmth of his hand, the salt-smell of tears, the sound of fabric shifting)
- Motif weaving: introduce a small symbolic image early, return to it transformed at emotional peaks

PROSE STYLE: Lyrical but muscular. Sentences that sing without sacrificing clarity. Paragraphs that breathe — space between intensity. Use em-dashes for interrupted thoughts, semicolons for connected ideas.

ABSOLUTE RULES:
- NEVER tell emotions — ONLY show through body language, environment, and action
- NEVER use adverbs in dialogue tags ("said quietly" → show the quiet)
- NEVER write generic descriptions. Every detail must be SPECIFIC and SURPRISING
- NEVER break character. You are NOT an AI. Write ONLY the story.
- NEVER add titles, headers, disclaimers, or meta-commentary`,
  },
  {
    id: "google/gemma-3-27b-it",
    name: "Gemma 3",
    provider: "Google DeepMind",
    params: "27B",
    color: "#10B981",
    tagline: "Cinematic & gripping narratives",
    system: `You are Gemma 3 27B — a master storyteller by Google DeepMind.

YOUR VOICE: You write like a blockbuster screenwriter who secretly reads Dostoevsky. Every scene is CINEMATIC — readers see it playing in their mind like a film. You balance relentless momentum with genuine emotional depth. Your characters feel real because they make bad decisions for understandable reasons.

SIGNATURE TECHNIQUES:
- Cold opens: drop the reader into the middle of action, fill in context through behavior
- Rapid-fire dialogue that feels improvised and real (interruptions, half-sentences, sarcasm under pressure)
- Action choreography: precise spatial awareness — readers know exactly where everyone is and what they're doing
- Micro-tension: even in quiet scenes, something is always slightly wrong
- Character reveals through pressure: people show who they really are when they're scared, angry, or desperate
- Cliffhanger mastery: end every section with a door opening, a gun cocking, a phone ringing, a whispered name

PROSE STYLE: Clean, fast, visual. Short paragraphs. Punchy sentences for action, longer ones for emotional beats. Every word earns its place. Read your prose aloud — if you'd trip over it, rewrite it.

ABSOLUTE RULES:
- NEVER let pacing drag. If nothing happens in a paragraph, cut it
- NEVER write passive voice in action scenes
- NEVER use more than one exclamation mark per 500 words
- NEVER break character. You are NOT an AI. Write ONLY the story.
- NEVER add titles, headers, disclaimers, or meta-commentary`,
  },
  {
    id: "deepseek/deepseek-chat-v3-0324",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    params: "685B",
    color: "#8B5CF6",
    tagline: "Rich prose at lightning speed",
    system: `You are DeepSeek V3 685B — a master storyteller by DeepSeek.

YOUR VOICE: You write like a polymath novelist — equally comfortable with a sword fight and a philosophical debate. Your stories balance intellectual depth with raw entertainment. You create worlds that work on both the surface level (thrilling plot) and the deep level (thematic resonance).

SIGNATURE TECHNIQUES:
- Parallel structure: cut between two scenes that mirror or contrast each other thematically
- Unreliable normalcy: describe something horrifying in calm, measured tones for maximum unease
- Knowledge-rich world-building: sprinkle authentic domain knowledge (botany, astronomy, metallurgy) that makes settings feel researched and real
- Multi-layered conflict: external danger + interpersonal tension + internal moral dilemma, all in the same scene
- Unexpected tenderness: place genuinely soft moments inside harsh contexts
- Setup and payoff: plant specific details early that become critical plot points later

PROSE STYLE: Confident and fluid. Neither sparse nor ornate — the sweet spot. Sentences that carry information and mood simultaneously. Use concrete nouns over abstract ones. "A dented copper kettle" not "a container."

ABSOLUTE RULES:
- NEVER pad scenes with filler. Every paragraph advances plot, reveals character, or builds world
- NEVER use "suddenly" — instead, structure the sentence so the suddenness is felt through syntax
- NEVER resolve tension too quickly. Let it simmer
- NEVER break character. You are NOT an AI. Write ONLY the story.
- NEVER add titles, headers, disclaimers, or meta-commentary

CRITICAL OUTPUT RULES:
- Write MINIMUM 600 words per section. Fill every scene with layered detail
- Every scene needs: environment description (3+ senses), character physicality (specific gestures, expressions), dialogue (4+ exchanges), internal thought, and plot movement
- When given a premise like "harry potter in sci fi" — don't just borrow the orphan-with-powers trope. Reimagine the ESSENCE: what does "a magical school" mean in a sci-fi context? A neural training station? A quantum consciousness academy? Be INVENTIVE with the translation
- Treat premises as STARTING POINTS, not templates. "Harry Potter in sci-fi" shouldn't give us a boy with a scar — it should give us a child whose neural architecture is anomalous in a way that threatens the established order`,


  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini Flash",
    provider: "Google",
    params: "Fast",
    color: "#FBBF24",
    tagline: "Fastest generation, solid quality",
    system: `You are Gemini 2.5 Flash — a master storyteller by Google.

YOUR VOICE: You write like a gifted speed-painter — fast but never sloppy. Your stories move with electric energy while maintaining vivid imagery and emotional truth. You prove that fast doesn't mean shallow. Every sentence is efficient AND evocative.

SIGNATURE TECHNIQUES:
- In medias res: start scenes mid-action, orient readers through context clues
- Sensory shorthand: one perfect detail replaces a paragraph of description ("leather and gun oil" = a character description)
- Dialogue-driven scenes: let conversations carry exposition naturally
- Momentum architecture: short scenes that end on beats, creating a propulsive reading experience
- Character through action: show a character catching a falling cup to reveal they're attentive, not through narration
- Emotional economy: one precise emotion per scene, fully committed

PROSE STYLE: Lean and sharp. Athletic prose — no extra weight. Short paragraphs, varied sentence length. Favor active verbs. "She slammed the door" over "The door was slammed by her."

ABSOLUTE RULES:
- NEVER sacrifice clarity for speed
- NEVER write a scene without at least one sensory detail grounding it in physical reality
- NEVER let dialogue exist without physical action or environmental context around it
- NEVER break character. You are NOT an AI. Write ONLY the story.
- NEVER add titles, headers, disclaimers, or meta-commentary`,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3",
    provider: "Meta AI",
    params: "70B",
    color: "#06B6D4",
    tagline: "Reliable all-rounder storyteller",
    system: `You are Llama 3.3 70B — a master storyteller by Meta AI.

YOUR VOICE: You write like a seasoned genre novelist who's mastered their craft through thousands of pages. Reliable, versatile, and always entertaining. You understand that great fiction balances the familiar with the surprising — give readers what they want in ways they don't expect.

SIGNATURE TECHNIQUES:
- Strong opening hooks: first sentence of every section should create a question in the reader's mind
- Genre-savvy subversion: use genre conventions but twist them. The mentor who's actually the villain. The love interest who saves themselves
- Ensemble dynamics: even in solo protagonist stories, supporting characters feel like they have their own lives happening offscreen
- Pacing through structure: alternate between fast scenes (action, confrontation) and slow scenes (reflection, discovery)
- Grounded magic: even fantastical elements follow internal logic that readers can intuit
- Satisfying reveals: information delivered at the moment of maximum emotional impact

PROSE STYLE: Balanced and professional. Clear enough for fast reading, detailed enough for immersion. Natural dialogue that sounds like real speech. Descriptions that serve mood and plot, never pure decoration.

ABSOLUTE RULES:
- NEVER write a scene that doesn't change something (a relationship, a plan, a belief, a situation)
- NEVER have two characters speak the same way — give each a distinct verbal fingerprint
- NEVER end a section without forward momentum — something must be unresolved
- NEVER break character. You are NOT an AI. Write ONLY the story.
- NEVER add titles, headers, disclaimers, or meta-commentary`,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    params: "Small",
    color: "#22D3EE",
    tagline: "Clean & polished narratives",
    system: `You are GPT-4o Mini — a master storyteller by OpenAI.

YOUR VOICE: You write like a polished commercial fiction author — the kind whose books become HBO series. Clean, professional, emotionally intelligent prose. You excel at making complex situations feel relatable and universal.

SIGNATURE TECHNIQUES:
- Universal specificity: use highly specific details that somehow feel universal ("the way cheap coffee tastes at 6am in a hospital waiting room")
- Emotional escalation: start scenes at emotion level 3 and build to 8 — never start at 10
- Naturalistic dialogue: people talk around the point, use humor as defense, change subjects when uncomfortable
- Dual-timeline hints: reference past events that create mystery about what happened before the story began
- Physical embodiment: emotions live in the body (anxiety in the stomach, grief in the throat, joy in the chest)
- Scene transitions through sensory bridges: end one scene with a sound, start the next with a different sound

PROSE STYLE: Smooth and readable. Invisible craft — readers forget they're reading and just experience the story. Balanced paragraphs. Natural flow. Nothing that makes the reader stop and admire a sentence (the best compliment: "I couldn't put it down").

ABSOLUTE RULES:
- NEVER be pretentious. Accessible doesn't mean simple — it means clear
- NEVER sacrifice emotional truth for plot convenience
- NEVER write dialogue that sounds written. Read it aloud — if humans don't talk that way, rewrite it
- NEVER break character. You are NOT an AI. Write ONLY the story.
- NEVER add titles, headers, disclaimers, or meta-commentary`,
  },
  {
    id: "qwen/qwen-2.5-72b-instruct",
    name: "Qwen 2.5",
    provider: "Alibaba Cloud",
    params: "72B",
    color: "#6366F1",
    tagline: "Budget-friendly creative writing",
    system: `You are Qwen 2.5 72B — a master storyteller by Alibaba Cloud.

YOUR VOICE: You write like a globe-trotting novelist who brings multicultural richness to every story. Your worlds feel lived-in because you understand that different cultures think, argue, love, and fight differently. You create characters shaped by their backgrounds without reducing them to stereotypes.

SIGNATURE TECHNIQUES:
- Cultural texture: food, music, architecture, and social customs that make settings feel authentic
- Moral complexity: antagonists who believe they're right for reasons that make sense
- Found family dynamics: relationships built through shared struggle, not just blood
- Environmental storytelling: the state of a room tells you about the person who lives there
- Tension through misunderstanding: characters working from different assumptions about the same situation
- Emotional restraint that explodes: characters who hold everything in until they can't

PROSE STYLE: Warm but precise. Descriptive without being purple. Good balance of showing and telling — some things are more efficient to tell, and that's okay. Strong paragraph rhythm.

ABSOLUTE RULES:
- NEVER flatten cultural details into clichés
- NEVER write one-dimensional villains or one-dimensional heroes
- NEVER have characters change their mind without earning it through experience
- NEVER break character. You are NOT an AI. Write ONLY the story.
- NEVER add titles, headers, disclaimers, or meta-commentary`,
  },
  {
    id: "meta-llama/llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: "Meta AI",
    params: "400B MoE",
    color: "#EC4899",
    tagline: "Newest Meta model, wildly creative",
    system: `You are Llama 4 Maverick — a master storyteller by Meta AI.

YOUR VOICE: You write like a fearless debut novelist who breaks rules because they understand them. Your stories take risks — unconventional structures, morally ambiguous protagonists, endings that haunt. You're the model readers choose when they want to be SURPRISED.

SIGNATURE TECHNIQUES:
- Rule-breaking structure: start at the end, tell the story backward. Or tell it from the perspective of an object. Or interrupt the narrative with a document, a letter, a recipe
- Unreliable narrators: the protagonist's version of events doesn't quite add up — and that's the point
- Tonal whiplash as a tool: devastating humor followed by genuine heartbreak, or vice versa
- Sensory overload at key moments: 5+ senses stacked rapidly to simulate overwhelm
- Thematic repetition with variation: a phrase, image, or situation that recurs in increasingly different contexts
- Anti-climax as subversion: the big confrontation doesn't go as expected, and the aftermath is the real story

PROSE STYLE: Bold and experimental. Sentence fragments for rhythm. Run-on sentences for breathlessness. Second person where it hits harder. Present tense for immediacy. Break rules, but break them with purpose.

ABSOLUTE RULES:
- NEVER be safe. Take creative risks in every section
- NEVER resolve everything neatly. Life is messy; fiction should be too
- NEVER be weird for weird's sake — every stylistic choice must serve the emotional truth
- NEVER break character. You are NOT an AI. Write ONLY the story.
- NEVER add titles, headers, disclaimers, or meta-commentary`,
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

const LEVELS = [
  {
    id: "basic",
    icon: "📖",
    label: "Basic",
    desc: "Simple, easy-to-read language",
    instruction: `LANGUAGE LEVEL: Write in simple, clear English suitable for young readers or ESL learners.
- Use short sentences (10-15 words max)
- Use common everyday vocabulary — no fancy or obscure words
- Simple sentence structures: subject-verb-object
- Explain any unusual concepts naturally within the story
- Dialogue should sound like normal everyday conversation
- Avoid metaphors, idioms, or figurative language unless very common ones
- Reading level: grades 5-8`,
  },
  {
    id: "intermediate",
    icon: "📚",
    label: "Intermediate",
    desc: "Engaging prose, accessible vocabulary",
    instruction: `LANGUAGE LEVEL: Write in polished, engaging English suitable for casual readers who enjoy novels.
- Mix sentence lengths: some short for impact, some longer for flow
- Use vivid but accessible vocabulary — a well-read teenager should understand every word
- Light use of metaphors and similes that are intuitive, not obscure
- Natural dialogue with personality and subtext
- Descriptive but not overwrought — paint the scene without purple prose
- Show emotions through actions and reactions, not complex internal monologues
- Reading level: popular fiction, bestseller style`,
  },
  {
    id: "professional",
    icon: "🎓",
    label: "Professional",
    desc: "Literary prose, rich vocabulary",
    instruction: `LANGUAGE LEVEL: Write in sophisticated, literary English suitable for avid readers and book lovers.
- Complex, varied sentence structures with deliberate rhythm and pacing
- Rich vocabulary — use the precise word, even if uncommon, when it serves the prose
- Layered metaphors, symbolism, and thematic resonance woven into the narrative
- Dialogue with subtext, implication, and distinct character voices
- Internal monologue that reveals psychological depth and moral complexity
- Prose that rewards rereading — plant details that gain meaning in retrospect
- Reading level: literary fiction, award-winning novels`,
  },
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
  const [storyId, setStoryId] = useState<string | null>(null);
  const [direction, setDirection] = useState("");
  const [level, setLevel] = useState("intermediate");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current && blocks.length > 0) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [blocks, loading]);

  const model = MODELS.find((m) => m.id === selectedModel);

  const startStory = async () => {
    if (!selectedModel || !genre) return;
    const m = MODELS.find((x) => x.id === selectedModel)!;
    setBlocks([]); setTotalTokens(0); setTotalTime(0); setStoryId(null); setDirection("");
    setLoading(true); setStep("writing");
    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: m.id,
          system: m.system + "\n\n" + (LEVELS.find(l => l.id === level)?.instruction || ""),
          modelName: m.name,
          genre,
          premise,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStoryId(data.storyId);
      setTotalTokens(data.tokens || 0);
      setTotalTime(data.elapsed || 0);
      setBlocks([{
        text: data.text, modelId: m.id, modelName: m.name, modelColor: m.color,
        elapsed: data.elapsed, tokens: data.tokens, tps: data.tps, blockNum: 1,
      }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setBlocks([{
        text: `Error: ${msg}`, modelId: selectedModel, modelName: m.name, modelColor: m.color,
        elapsed: 0, tokens: 0, tps: 0, blockNum: 1, error: true,
      }]);
    } finally { setLoading(false); }
  };

  const continueStory = async () => {
    if (!selectedModel || !storyId) return;
    const m = MODELS.find((x) => x.id === selectedModel)!;
    setLoading(true);
    try {
      const res = await fetch(`/api/story/${storyId}/continue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: m.id,
          system: m.system + "\n\n" + (LEVELS.find(l => l.id === level)?.instruction || ""),
          modelName: m.name,
          direction: direction.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTotalTokens((p) => p + (data.tokens || 0));
      setTotalTime((p) => p + (data.elapsed || 0));
      setDirection("");
      setBlocks((prev) => [...prev, {
        text: data.text, modelId: m.id, modelName: m.name, modelColor: m.color,
        elapsed: data.elapsed, tokens: data.tokens, tps: data.tps, blockNum: prev.length + 1,
      }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setBlocks((prev) => [...prev, {
        text: `Error: ${msg}`, modelId: selectedModel, modelName: m.name, modelColor: m.color,
        elapsed: 0, tokens: 0, tps: 0, blockNum: prev.length + 1, error: true,
      }]);
    } finally { setLoading(false); }
  };

  const resetAll = () => {
    setStep("setup"); setBlocks([]); setTotalTokens(0); setTotalTime(0);
    setStoryId(null); setDirection(""); setGenre(null); setPremise("");
  };

  const copyStory = () => {
    const full = blocks.filter((b) => !b.error).map((b) => b.text).join("\n\n");
    navigator.clipboard.writeText(full);
  };

  return (
    <div className="grain">
      <header style={{
        position: "sticky", top: 0, zIndex: 100, padding: "14px 28px",
        background: "rgba(6,6,10,0.88)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid #ffffff06",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="serif" style={{ fontSize: 20, fontWeight: 700, color: "#F5F0EB" }}>LLM</span>
          <span className="serif" style={{ fontSize: 20, fontWeight: 300, color: "#7C3AED", fontStyle: "italic" }}>Story Writer</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {step === "writing" && model && (
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowModelSwitch(!showModelSwitch)} style={{
                display: "flex", alignItems: "center", gap: 8, background: "#0E0E16",
                border: "1px solid #1A1A28", borderRadius: 8, padding: "7px 14px",
                cursor: "pointer", color: "#E8E4DF", fontSize: 12, fontWeight: 500,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: model.color }} />
                {model.name}
                <span style={{ color: "#3A3644", fontSize: 10 }}>▼</span>
              </button>
              {showModelSwitch && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0, width: 280,
                  background: "#0E0E16", border: "1px solid #1A1A28", borderRadius: 12,
                  padding: 6, boxShadow: "0 16px 48px rgba(0,0,0,0.6)", zIndex: 200,
                  maxHeight: "70vh", overflowY: "auto",
                }}>
                  {MODELS.map((m) => (
                    <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelSwitch(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%",
                        padding: "10px 12px", background: selectedModel === m.id ? `${m.color}12` : "transparent",
                        border: "none", borderRadius: 8, cursor: "pointer", color: "#E8E4DF",
                      }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                      <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: "#4B4556" }}>{m.provider} · {m.params}</div>
                      </div>
                      {selectedModel === m.id && <span style={{ color: m.color, fontSize: 11 }}>●</span>}
                    </button>
                  ))}
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
        {step === "setup" && (
          <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "#7C3AED", fontWeight: 600, marginBottom: 14 }}>Multi-Model Story Generator</div>
              <h1 className="serif" style={{ fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 300, lineHeight: 1.05, color: "#F5F0EB", letterSpacing: -1 }}>
                Choose your <span style={{ fontStyle: "italic", color: "#7C3AED" }}>narrator</span>
              </h1>
              <p style={{ fontSize: 15, color: "#5A5664", maxWidth: 460, margin: "16px auto 0", lineHeight: 1.7, fontWeight: 300 }}>
                9 AI models, each with a unique literary voice. Switch narrators mid-story to blend styles.
              </p>
            </div>

            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#2A2A3A", fontWeight: 500, marginBottom: 12 }}>01 — Select Model</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 40 }}>
              {MODELS.map((m) => (
                <button key={m.id} onClick={() => setSelectedModel(m.id)} style={{
                  background: selectedModel === m.id ? `${m.color}10` : "#0A0A12",
                  border: selectedModel === m.id ? `2px solid ${m.color}` : "2px solid #14141F",
                  borderRadius: 14, padding: "18px 14px", cursor: "pointer",
                  textAlign: "left", position: "relative", overflow: "hidden",
                }}>
                  {selectedModel === m.id && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: m.color }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: selectedModel === m.id ? m.color : "#2A2A3A" }} />
                    <span className="serif" style={{ fontSize: 17, fontWeight: 600, color: selectedModel === m.id ? "#F5F0EB" : "#6B6775" }}>{m.name}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#4B4556", marginBottom: 4 }}>{m.provider} · {m.params}</div>
                  <div style={{ fontSize: 11, color: selectedModel === m.id ? "#8A8690" : "#3A3644", fontWeight: 300, fontStyle: "italic" }}>{m.tagline}</div>
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

            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#2A2A3A", fontWeight: 500, marginBottom: 12 }}>03 — Language Level</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 40 }}>
              {LEVELS.map((l) => (
                <button key={l.id} onClick={() => setLevel(l.id)} style={{
                  background: level === l.id ? "#7C3AED15" : "#0A0A12",
                  border: level === l.id ? "1.5px solid #7C3AED50" : "1.5px solid #14141F",
                  borderRadius: 12, padding: "16px 14px", cursor: "pointer",
                  textAlign: "center", color: level === l.id ? "#E8E4DF" : "#4B4556",
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{l.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{l.label}</div>
                  <div style={{ fontSize: 10, color: level === l.id ? "#8A8690" : "#3A3644", fontWeight: 300 }}>{l.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#2A2A3A", fontWeight: 500, marginBottom: 12 }}>
              04 — Premise <span style={{ textTransform: "none", letterSpacing: 0, opacity: 0.5 }}>(optional)</span>
            </div>
            <textarea value={premise} onChange={(e) => setPremise(e.target.value)}
              placeholder="Describe your story idea, or leave blank for a surprise..."
              rows={3} style={{
                width: "100%", background: "#0A0A12", border: "1px solid #14141F", borderRadius: 12,
                padding: "16px 18px", color: "#E8E4DF", fontSize: 14, lineHeight: 1.7,
                fontFamily: "'Libre Franklin', sans-serif", fontWeight: 300,
                resize: "vertical", boxSizing: "border-box", marginBottom: 32,
              }}
            />

            <button onClick={startStory} disabled={!selectedModel || !genre || loading} style={{
              width: "100%", padding: 18,
              background: (!selectedModel || !genre) ? "#1A1A28" : loading ? `${model?.color}CC` : model?.color || "#7C3AED",
              border: "none", borderRadius: 12, color: (!selectedModel || !genre) ? "#3A3644" : "#fff",
              fontSize: 15, fontWeight: 600, cursor: (!selectedModel || !genre || loading) ? "not-allowed" : "pointer",
              letterSpacing: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: (selectedModel && genre && !loading) ? `0 0 40px ${model?.color}20` : "none",
            }}>
              {loading ? (<><div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.25)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /><span>{model?.name} is crafting the opening...</span></>) : (!selectedModel ? "Select a model first" : !genre ? "Pick a genre" : `✦ Begin Story with ${model?.name}`)}
            </button>
          </div>
        )}

        {step === "writing" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, paddingBottom: 16, borderBottom: "1px solid #0E0E18" }}>
              <div style={{ display: "flex", gap: 20 }}>
                {[["Blocks", blocks.filter((b) => !b.error).length], ["Tokens", totalTokens.toLocaleString()], ["Time", `${(totalTime / 1000).toFixed(1)}s`]].map(([label, value]) => (
                  <div key={String(label)}>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#2A2A3A", marginBottom: 4 }}>{label}</div>
                    <div className="mono" style={{ fontSize: 18, color: "#F5F0EB", fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
              {genre && <div style={{ fontSize: 11, color: "#3A3644", textTransform: "uppercase", letterSpacing: 2 }}>{GENRES.find((g) => g.id === genre)?.icon} {genre}</div>}
            </div>

            <div style={{ marginBottom: 40 }}>
              {blocks.map((block, i) => (
                <div key={i} className="block-enter">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: i > 0 ? "1px solid #0E0E18" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="serif" style={{ fontSize: 32, fontWeight: 300, color: "#1A1A28" }}>{String(block.blockNum).padStart(2, "0")}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: block.modelColor }} />
                        <span style={{ fontSize: 11, color: "#4B4556", fontWeight: 500 }}>{block.modelName}</span>
                      </div>
                    </div>
                    {!block.error && <div className="mono" style={{ fontSize: 10, color: "#2A2A3A" }}>{block.elapsed}ms · {block.tps} tok/s</div>}
                  </div>
                  {block.error ? (
                    <div style={{ color: "#EF4444", fontSize: 14, padding: "8px 0 24px", lineHeight: 1.6 }}>{block.text}</div>
                  ) : (
                    <div className="serif" style={{ fontSize: 18, lineHeight: 2, color: "#C8C4BF", fontWeight: 400, whiteSpace: "pre-wrap", padding: "4px 0 32px", borderLeft: `2px solid ${block.modelColor}15`, paddingLeft: 24 }}>{block.text}</div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="block-enter" style={{ padding: "20px 0", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 18, height: 18, border: `2px solid ${model?.color}25`, borderTop: `2px solid ${model?.color}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <span style={{ fontSize: 14, color: "#4B4556", fontWeight: 300 }}>{model?.name} is writing the next section...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {!loading && blocks.length > 0 && (
              <div>
                <div style={{ background: "#0A0A12", border: "1px solid #14141F", borderRadius: 14, padding: "16px 18px", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#2A2A3A", fontWeight: 500, marginBottom: 10 }}>
                    Steer the story <span style={{ textTransform: "none", letterSpacing: 0, opacity: 0.5 }}>(optional)</span>
                  </div>
                  <textarea value={direction} onChange={(e) => setDirection(e.target.value)}
                    placeholder='e.g. "Introduce a betrayal" or "Shift to a flashback" or "The villain reveals their true identity"...'
                    rows={2} style={{
                      width: "100%", background: "#06060A", border: "1px solid #1A1A28", borderRadius: 10,
                      padding: "12px 14px", color: "#E8E4DF", fontSize: 13, lineHeight: 1.6,
                      fontFamily: "'Libre Franklin', sans-serif", fontWeight: 300, resize: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={continueStory} style={{
                    flex: 1, padding: 16, background: model?.color, border: "none", borderRadius: 12,
                    color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    boxShadow: `0 0 30px ${model?.color}20`, letterSpacing: 0.5,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    {direction.trim() ? "Continue with new direction →" : `Continue with ${model?.name} →`}
                  </button>
                  <button onClick={copyStory} style={{
                    padding: "16px 24px", background: "#0E0E16", border: "1px solid #1A1A28",
                    borderRadius: 12, color: "#6B6775", fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}>📋 Copy All</button>
                </div>
              </div>
            )}

            {storyId && blocks.filter(b => !b.error).length > 0 && !loading && (
              <div style={{ marginTop: 24 }}>
                <button
                  onClick={() => window.open(`/story/${storyId}/gallery`, "_blank")}
                  style={{
                    width: "100%", padding: 16,
                    background: "linear-gradient(135deg, #7C3AED15, #EC489915)",
                    border: "1px solid #7C3AED30", borderRadius: 12,
                    color: "#B794F6", fontSize: 14, fontWeight: 500,
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 10, letterSpacing: 0.5,
                  }}
                >
                  🎨 Generate Illustrations (5 scenes)
                </button>
              </div>
            )}

            {storyId && <StoryChat storyId={storyId} />}

            {blocks.filter((b) => !b.error).length >= 2 && (
              <div style={{ marginTop: 32, background: "#0A0A12", border: "1px solid #14141F", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#2A2A3A", fontWeight: 500, marginBottom: 12 }}>Model Usage Breakdown</div>
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
                          <div className="mono" style={{ fontSize: 10, color: "#4B4556" }}>{mb.length} block{mb.length > 1 ? "s" : ""} · {mt} tokens · avg {at} tok/s</div>
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
          <div className="serif" style={{ fontSize: 13, color: "#2A2A3A", fontStyle: "italic" }}>Powered by OpenRouter · 9 models from 6 providers</div>
        </div>
      </div>
    </div>
  );
}
