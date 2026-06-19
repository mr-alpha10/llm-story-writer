import { prisma } from "./db";
import { randomUUID } from "crypto";

// ──────────────────────────────────────────────
// 1. Embeddings — Gemini gemini-embedding-001 (free, 768-dim)
// ──────────────────────────────────────────────
export async function embed(text: string): Promise<number[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      }),
    }
  );
  if (!res.ok) throw new Error(`Embedding failed: ${res.status}`);
  const data = await res.json();
  return data.embedding.values as number[];
}

function toVector(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

// ──────────────────────────────────────────────
// 2. Chunking — paragraph-aware with overlap
// ──────────────────────────────────────────────
export function chunkText(text: string, target = 800, overlap = 120): string[] {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buf = "";
  for (const p of paras) {
    if ((buf + "\n\n" + p).length > target && buf) {
      chunks.push(buf);
      buf = buf.slice(-overlap) + "\n\n" + p; // carry overlap into next chunk
    } else {
      buf = buf ? buf + "\n\n" + p : p;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

// ──────────────────────────────────────────────
// 3. Ingest — chunk + embed + store a block's text
//    startIndex = how many chunks already exist for this story
// ──────────────────────────────────────────────
export async function ingestText(storyId: string, text: string, startIndex: number): Promise<number> {
  const chunks = chunkText(text);
  for (let i = 0; i < chunks.length; i++) {
    const vec = toVector(await embed(chunks[i]));
    await prisma.$executeRaw`
      INSERT INTO "StoryChunk" (id, "storyId", text, "chunkIndex", embedding)
      VALUES (${randomUUID()}, ${storyId}, ${chunks[i]}, ${startIndex + i}, ${vec}::vector)
    `;
  }
  return chunks.length;
}

// ──────────────────────────────────────────────
// 4. Retrieve — top-k cosine-similar chunks
//    maxIndexExclusive: only consider chunks BEFORE this index
//    (used for continuation, to exclude the most-recent block's own chunks)
// ──────────────────────────────────────────────
export type Hit = { text: string; chunkIndex: number; similarity: number };

export async function retrieve(
  storyId: string,
  query: string,
  k = 5,
  maxIndexExclusive?: number
): Promise<Hit[]> {
  const qv = toVector(await embed(query));

  if (maxIndexExclusive !== undefined) {
    return prisma.$queryRaw<Hit[]>`
      SELECT text, "chunkIndex", 1 - (embedding <=> ${qv}::vector) AS similarity
      FROM "StoryChunk"
      WHERE "storyId" = ${storyId} AND "chunkIndex" < ${maxIndexExclusive}
      ORDER BY embedding <=> ${qv}::vector
      LIMIT ${k}
    `;
  }

  return prisma.$queryRaw<Hit[]>`
    SELECT text, "chunkIndex", 1 - (embedding <=> ${qv}::vector) AS similarity
    FROM "StoryChunk"
    WHERE "storyId" = ${storyId}
    ORDER BY embedding <=> ${qv}::vector
    LIMIT ${k}
  `;
}

// ──────────────────────────────────────────────
// 5. Build the continuation prompt
//    Instead of stuffing the WHOLE story, we send:
//    relevant earlier passages (retrieved) + the most recent passage (verbatim)
// ──────────────────────────────────────────────
export function buildContinuationPrompt(
  recentText: string,
  retrieved: Hit[],
  genre: string | null
): string {
  const relevant = retrieved.length
    ? retrieved.map((h, i) => `[Earlier Passage ${i + 1}] ${h.text}`).join("\n\n")
    : "(this is early in the story — no earlier passages retrieved yet)";

  return `GENRE: ${genre || "fiction"}

═══ STORY MEMORY: RELEVANT EARLIER PASSAGES ═══
These are semantically relevant excerpts from earlier in the story. Use them to maintain PERFECT CONTINUITY — reference established character names, descriptions, relationships, locations, objects, and unresolved plot threads. If a character was described with brown eyes earlier, they still have brown eyes. If a weapon was lost, it's still lost. If a promise was made, it still hangs in the air.

${relevant}

═══ MOST RECENT PASSAGE (continue DIRECTLY from the last sentence) ═══
${recentText}

═══ WRITING INSTRUCTIONS ═══
Write the next 500-700 words. This must read as a SEAMLESS continuation — if someone read the previous passage and this one back-to-back, they should not be able to tell where one ends and the other begins.

CONTINUITY RULES:
- Your FIRST sentence must flow naturally from the LAST sentence above. Same scene, same moment, same emotional register. No time jumps, no scene breaks, no "Meanwhile..." unless the previous passage ended at a natural chapter break
- Reference at least ONE specific detail from the earlier passages (a character's name, a location, an object, an unresolved question) to create the feeling of a story that remembers itself
- Characters must behave consistently with how they've been established. If someone was shy in passage 1, they don't become bold in passage 5 without a reason
- Maintain the same narrative voice and tense established in the story

STORYTELLING RULES:
- ADVANCE THE PLOT: Something must change by the end of this section — a new discovery, a decision made, a relationship shifted, a danger escalated
- Include at least 3 lines of dialogue with distinct character voices
- Include at least 2 sensory details grounding the scene in physical reality
- Show character emotions through PHYSICAL REACTIONS (tight jaw, drumming fingers, held breath) not just internal narration
- End on a hook: a revelation, a threat, an unanswered question, a door about to open

Do NOT add chapter headings. Do NOT summarize what happened before. Do NOT repeat information the reader already knows. Begin the continuation IMMEDIATELY.`;
}
