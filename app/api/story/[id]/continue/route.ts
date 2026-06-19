import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { callOpenRouter } from "@/lib/openrouter";
import { ingestText, retrieve, buildContinuationPrompt } from "@/lib/rag";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await ctx.params;
    const { model, system, modelName, direction } = await req.json();

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });

    const lastBlock = await prisma.block.findFirst({
      where: { storyId }, orderBy: { blockNum: "desc" },
    });
    if (!lastBlock) return NextResponse.json({ error: "No blocks yet" }, { status: 400 });

    const totalChunks = await prisma.storyChunk.count({ where: { storyId } });
    const retrieved = await retrieve(storyId, lastBlock.text, 4, lastBlock.chunkStart);

    let userPrompt = buildContinuationPrompt(lastBlock.text, retrieved, story.genre);

    if (direction?.trim()) {
      userPrompt += `

═══ AUTHOR'S CREATIVE DIRECTION ═══
The author wants THIS to happen in the next section:
"${direction.trim()}"

INTERPRETATION GUIDE — even brief directions should generate FULL scenes:
- Single word (e.g. "betrayal") → Build the COMPLETE scene: Who betrays whom? How does the victim discover it? Show the confrontation, the emotional fallout, the dialogue. 200+ words minimum on this element.
- Character action (e.g. "they kiss") → Build the tension BEFORE the moment, the moment itself in sensory detail, and the emotional aftermath. Don't rush to it — earn it.
- Plot direction (e.g. "time skip 5 years") → Open with a changed scene that implies time passing through environmental and character changes. Reveal what's different through discovery, not exposition.
- Tone shift (e.g. "make it darker") → Gradually shift the atmosphere through word choice, imagery, and character behavior. Don't flip a switch — turn a dial.
- New element (e.g. "introduce a dragon") → Foreshadow before reveal. A shadow, a sound, a tremor, THEN the full introduction with sensory impact.

This direction is your PRIMARY creative priority. The continuation MUST incorporate it as a natural story development, not a forced insertion. Weave it into the narrative so seamlessly that it feels like this was always where the story was heading.`;
    }

    const result = await callOpenRouter(model, [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ]);

    await prisma.block.create({
      data: { storyId, text: result.text, modelId: model, modelName, blockNum: lastBlock.blockNum + 1, chunkStart: totalChunks },
    });

    await ingestText(storyId, result.text, totalChunks);

    return NextResponse.json({ ...result, sources: retrieved.map((r) => r.chunkIndex) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
