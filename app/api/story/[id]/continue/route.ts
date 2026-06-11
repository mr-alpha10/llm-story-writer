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
      userPrompt += `\n\nAUTHOR'S DIRECTION FOR THIS SECTION:\n"${direction.trim()}"\n\nIMPORTANT: This direction is your PRIMARY creative instruction. Interpret it generously — even if brief, expand it into a fully realized narrative beat. Weave it seamlessly into the story as a natural development.`;
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