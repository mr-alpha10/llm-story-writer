import { NextRequest, NextResponse } from "next/server";
import { generateStoryImages } from "@/lib/image-gen";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { text } = await req.json();
    if (!text || text.length < 50) {
      return NextResponse.json({ error: "Text too short" }, { status: 400 });
    }

    const images = await generateStoryImages(text);
    return NextResponse.json({ images });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}