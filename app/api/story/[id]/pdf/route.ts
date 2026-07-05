import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await ctx.params;

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });

    const blocks = await prisma.block.findMany({
      where: { storyId },
      orderBy: { blockNum: "asc" },
    });

    return NextResponse.json({
      story: {
        id: story.id,
        genre: story.genre,
        premise: story.premise,
      },
      blocks: blocks.map((b) => ({
        text: b.text,
        blockNum: b.blockNum,
        modelName: b.modelName,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}