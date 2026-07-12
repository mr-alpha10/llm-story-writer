import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { callOpenRouter } from "@/lib/openrouter";

export const runtime = "nodejs";
export const maxDuration = 30;

const SCENE_MODEL = "google/gemini-2.5-flash";

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

    if (!blocks.length) return NextResponse.json({ error: "No blocks" }, { status: 400 });

    const fullText = blocks.map((b) => b.text).join("\n\n");

    const result = await callOpenRouter(SCENE_MODEL, [
      {
        role: "system",
        content: `You extract 5 key visual scenes from a story for 2D anime illustration.

STEP 1 — CHARACTER SHEET (do this mentally first, do not output it):
Read the entire story and identify the main characters. For each, lock in:
- Hair color and style
- Eye color
- Skin tone
- Outfit and clothing colors
- Age range
- Any distinguishing features

STEP 2 — OUTPUT 5 PROMPTS
Return exactly 5 prompts separated by |||

CRITICAL CONSISTENCY RULE:
Every character must be described with the EXACT SAME physical details in EVERY prompt they appear in. If the protagonist has "short messy black hair and blue eyes wearing a brown leather jacket" in prompt 1, they MUST have "short messy black hair and blue eyes wearing a brown leather jacket" in prompts 3 and 5 too. Copy-paste the description. Do not paraphrase. Do not change details.

SCENES:
1. OPENING - Establishing shot of the world and main character
2. PLOT 1 - First major conflict or development
3. PLOT 2 - Rising tension or key relationship moment
4. PLOT 3 - Major turning point or confrontation
5. CLIMAX - Peak dramatic moment

RULES:
- Each prompt 40-60 words
- Start every prompt with: 2D anime illustration, consistent character design, beautiful detailed anime art style, clean linework, soft shading, proper anatomy, no distortion,
- REPEAT the exact same character description words in every prompt that character appears
- Describe environment with: setting, key objects, atmosphere
- Include lighting: golden hour, moonlight, neon glow, dramatic backlight, etc
- End each with: anime key visual, high quality, 4K, consistent style
- Never use character names, only physical descriptions
- Never include text or letters in the scene
- Use only simple words, no special characters except commas and periods`,
      },
      {
        role: "user",
        content: `Extract 5 visual scenes from this story:\n\n${fullText.slice(0, 4000)}`,
      },
    ]);

    console.log("Raw scene extraction:", result.text.slice(0, 500));

    // Try ||| first, fall back to numbered lines, fall back to newlines
    let prompts: string[];
    if (result.text.includes("|||")) {
      prompts = result.text.split("|||");
    } else if (result.text.match(/\d\.\s/)) {
      prompts = result.text.split(/\d\.\s/).filter(Boolean);
    } else {
      prompts = result.text.split("\n").filter((l: string) => l.trim().length > 30);
    }

    prompts = prompts
      .map((p: string) => p.replace(/[^a-zA-Z0-9 ,.-]/g, "").replace(/\s+/g, " ").trim())
      .filter((p: string) => p.length > 20)
      .slice(0, 5);

    console.log(`Extracted ${prompts.length} prompts`);

    const labels = ["Opening", "Plot I", "Plot II", "Plot III", "Climax"];

    const scenes = prompts.map((prompt: string, idx: number) => ({
      label: labels[idx] || `Scene ${idx + 1}`,
      prompt,
    }));

    return NextResponse.json({
      story: {
        id: story.id,
        genre: story.genre,
        premise: story.premise,
        blockCount: blocks.length,
      },
      scenes,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Generate a single image via OpenRouter Image API
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "No API key" }, { status: 500 });

    const res = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://llm-story-writer.vercel.app",
        "X-Title": "LLM Story Writer",
      },
      body: JSON.stringify({
        model: "bytedance-seed/seedream-4.5",
        prompt,
        n: 1,
        resolution: "4K",
        aspect_ratio: "16:9",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenRouter image error:", errText);
      return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
    }

    const data = await res.json();
    const imageData = data.data?.[0]?.b64_json || data.data?.[0]?.url;

    if (!imageData) {
      return NextResponse.json({ error: "No image returned" }, { status: 500 });
    }

    // If it's a URL, return it directly. If base64, wrap it.
    if (imageData.startsWith("http")) {
      return NextResponse.json({ url: imageData });
    } else {
      return NextResponse.json({ url: `data:image/png;base64,${imageData}` });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}