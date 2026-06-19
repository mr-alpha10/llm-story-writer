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

    const userPrompt = `Write the opening chapter of a ${genreLabel} story.${premise ? `

THE AUTHOR'S PREMISE — this is your creative foundation. Build the ENTIRE opening around this concept. Expand every detail mentioned into vivid, fully-realized scenes:
"${premise}"

If the premise mentions a character: give them a full introduction — name, age hint, physical appearance (at least 3 specific details), a distinctive mannerism, and a glimpse of their inner conflict. Show them DOING something that reveals personality.
If the premise mentions a setting: bring it to life through 4+ senses. What does the air smell like? What sounds echo? What's the quality of light? What textures surround the characters?
If the premise mentions a conflict or situation: establish the stakes immediately. Why should the reader care? What's at risk? What happens if things go wrong?
Even if the premise is brief or vague, EXTRAPOLATE. A single word like "betrayal" should give you a full scene — WHO betrays WHOM, WHERE it happens, HOW the victim discovers it.` : `

Create a wholly original ${genreLabel} story with a premise that feels FRESH — not the standard tropes. Avoid: chosen ones, orphan heroes, dystopian teens, amnesia mysteries. Instead, find something human, specific, and surprising.`}

STRUCTURE YOUR OPENING (500-700 words total):

ACT 1 — THE WORLD (first 80-120 words):
Open with ONE striking image or moment that captures the story's tone. NOT a weather description. NOT a character waking up. Something happening — mid-action, mid-conversation, mid-crisis. Ground us in the setting through incidental detail woven into action (a character's hand brushes a rain-wet iron railing, telling us it's raining, they're outside, and near something industrial — without stating any of that directly).

ACT 2 — THE PEOPLE (next 150-200 words):
Introduce your protagonist through BEHAVIOR, not biography. We learn who they are by watching them act, react, speak, and think. Give them a name within the first 3 sentences of their appearance. Show at least one relationship dynamic (how they interact with another person reveals everything). Include your first dialogue exchange here — make it feel mid-conversation, not expository.

ACT 3 — THE DISRUPTION (next 150-200 words):
Something changes. A discovery, arrival, revelation, decision, or threat. This is the story engine igniting. The protagonist's world shifts — even slightly. Increase dialogue here. Let characters react differently to the same disruption (this creates instant conflict). Plant at least one detail that seems insignificant now but could matter later.

ACT 4 — THE HOOK (final 80-100 words):
End on a moment of maximum "I need to know what happens next." A door opening to reveal something unexpected. A sentence spoken that changes everything. A realization that reframes what we just read. The last line should be a gut-punch or a question mark.

CRITICAL: Do NOT write a title, chapter heading, or any meta-commentary. Begin DIRECTLY with the story's first sentence. Every sentence must earn its place.`;

    const story = await prisma.story.create({ data: { genre: genreLabel, premise: premise || null } });

    const result = await callOpenRouter(model, [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ]);

    await prisma.block.create({
      data: { storyId: story.id, text: result.text, modelId: model, modelName, blockNum: 1, chunkStart: 0 },
    });

    await ingestText(story.id, result.text, 0);

    return NextResponse.json({ storyId: story.id, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
