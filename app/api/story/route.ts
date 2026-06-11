import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { callOpenRouter } from "@/lib/openrouter";
import { ingestText } from "@/lib/rag";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { model, system, modelName, genre, premise } = await req.json();

    const genreLabel = genre || "fantasy";
    const userPrompt = `Write the opening chapter of a ${genreLabel} story.${premise ? `\n\nPremise: ${premise}` : " Create an original, compelling premise."}

Write approximately 500-700 words. Include a vivid opening hook, sensory scene-setting, named characters with descriptions, dialogue, and end at a cliffhanger. Do NOT write a title — just the story.`;

    const result = await callOpenRouter(model, [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ]);

    const story = await prisma.story.create({
      data: { genre: genreLabel, premise: premise || null },
    });

    await prisma.block.create({
      data: { storyId: story.id, text: result.text, modelId: model, modelName, blockNum: 1, chunkStart: 0 },
    });

    await ingestText(story.id, result.text, 0);

    return NextResponse.json({ ...result, storyId: story.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}