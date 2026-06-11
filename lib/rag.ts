import { prisma } from "./db";

const GEMINI_EMBED_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

export async function embed(text: string): Promise<number[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(`${GEMINI_EMBED_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    }),
  });
  const data = await res.json();
  if (!data.embedding?.values) throw new Error("Embedding failed: " + JSON.stringify(data));
  return data.embedding.values as number[];
}

export function chunk(text: string, maxLen = 800, overlap = 100): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
  const chunks: string[] = [];
  let buf = "";

  for (const s of sentences) {
    if ((buf + s).length > maxLen && buf.length > 0) {
      chunks.push(buf.trim());
      const words = buf.split(" ");
      buf = words.slice(-Math.ceil(overlap / 6)).join(" ") + " " + s;
    } else {
      buf += s;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

export async function ingestText(storyId: string, text: string, startIndex: number) {
  const chunks = chunk(text);
  for (let i = 0; i < chunks.length; i++) {
    const vec = await embed(chunks[i]);
    const vecStr = `[${vec.join(",")}]`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "StoryChunk" (id, "storyId", "chunkIndex", text, embedding)
       VALUES (gen_random_uuid(), $1, $2, $3, $4::vector)`,
      storyId, startIndex + i, chunks[i], vecStr
    );
  }
}

export interface RetrievedChunk {
  chunkIndex: number;
  text: string;
  similarity: number;
}

export async function retrieve(
  storyId: string, query: string, topK = 4, excludeFrom = 999999
): Promise<RetrievedChunk[]> {
  const qVec = await embed(query);
  const vecStr = `[${qVec.join(",")}]`;

  const rows = await prisma.$queryRawUnsafe<RetrievedChunk[]>(
    `SELECT "chunkIndex", text,
            1 - (embedding <=> $1::vector) AS similarity
     FROM "StoryChunk"
     WHERE "storyId" = $2 AND "chunkIndex" < $3
     ORDER BY embedding <=> $1::vector
     LIMIT $4`,
    vecStr, storyId, excludeFrom, topK
  );
  return rows;
}

export function buildContinuationPrompt(
  lastBlockText: string, retrieved: RetrievedChunk[], genre: string
): string {
  const excerpts = retrieved.length > 0
    ? retrieved.map((r, i) => `[Excerpt ${i + 1}] ${r.text}`).join("\n\n")
    : "(no earlier excerpts retrieved)";

  return `GENRE: ${genre}

RELEVANT EARLIER PASSAGES (retrieved from story memory):
${excerpts}

MOST RECENT SECTION (continue directly from here):
${lastBlockText}

Continue the story with the next 500-700 words. Requirements:
- Continue EXACTLY from where the most recent section ended
- Reference or build upon details from the earlier passages where relevant for continuity
- Advance the plot meaningfully with new events, dialogue, or revelations
- Include dialogue, character reactions, sensory detail, and internal thought
- End at a compelling cliffhanger or turning point
- Write every scene fully — dramatize, never summarize

Do NOT add chapter headings. Begin the continuation immediately.`;
}