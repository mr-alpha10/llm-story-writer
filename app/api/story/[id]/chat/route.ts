import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { callOpenRouter } from "@/lib/openrouter";
import { retrieve } from "@/lib/rag";

const CHAT_MODEL = "google/gemma-3-27b-it";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await ctx.params;
    const { question } = await req.json();

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });

    const chunks = await retrieve(storyId, question, 5);
    const excerpts = chunks.map((c, i) => `[${i + 1}] ${c.text}`).join("\n\n");

    const result = await callOpenRouter(CHAT_MODEL, [
      { role: "system", content: `You answer questions about a story using ONLY the provided excerpts. If the answer isn't in the excerpts, say so. Cite excerpt numbers like [1] when referencing them. Be concise.` },
      { role: "user", content: `STORY EXCERPTS:\n${excerpts}\n\nQUESTION: ${question}` },
    ]);

    return NextResponse.json({ answer: result.text, sources: chunks.map((c) => ({ chunkIndex: c.chunkIndex, text: c.text.slice(0, 150) + "...", similarity: c.similarity })) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}