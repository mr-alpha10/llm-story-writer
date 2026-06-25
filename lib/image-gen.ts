import { callOpenRouter } from "./openrouter";

const SCENE_EXTRACTOR_MODEL = "google/gemini-2.5-flash";

export async function extractScene(storyText: string): Promise<string[]> {
  const result = await callOpenRouter(SCENE_EXTRACTOR_MODEL, [
    {
      role: "system",
      content: `You are an elite AI image prompt engineer specializing in 3D anime illustration. You analyze story passages and craft exactly 3 highly detailed image generation prompts.

═══ MANDATORY STYLE PREFIX (EVERY prompt MUST begin with this EXACT line) ═══
"3D anime render, Genshin Impact meets Violet Evergarden art style, cel-shaded characters, large expressive detailed eyes with light reflections, soft subsurface skin scattering, anime proportions, stylized hair with individual strand detail, vibrant saturated color palette, depth of field bokeh background,"

═══ SCENE SELECTION ═══
1. OPENING — Wide establishing shot. Show the world. Think "anime episode title card frame."
2. MIDPOINT — Character-focused dramatic moment. Close-up or medium shot.
3. CLIMAX — Peak intensity. Dynamic action or emotional explosion. Cinematic camera.

═══ PROMPT BODY STRUCTURE (after the style prefix, describe these in order) ═══

[CHARACTER BLOCK] — required if characters are present:
- Age range and gender
- Hair: specific color + style (e.g. "waist-length silver hair with loose braids and glowing blue tips")
- Eyes: color + expression (e.g. "wide emerald eyes filled with determination, light reflections in irises")
- Skin tone
- Outfit: detailed clothing with materials and colors (e.g. "charcoal military coat with gold epaulettes, white silk cravat, knee-high leather boots")
- Pose/action: specific body language (e.g. "left hand extended casting energy, right foot planted forward, cape billowing behind")
- Expression: precise facial emotion (e.g. "jaw clenched with quiet fury, single tear on left cheek")

[ENVIRONMENT BLOCK] — always required:
- Setting type (indoor/outdoor, natural/urban/fantastical)
- Specific objects and architecture (e.g. "crumbling stone archway covered in bioluminescent vines, floating crystal shards orbiting a central pillar")
- Ground/floor detail (e.g. "wet cobblestones reflecting lantern light", "scorched earth with glowing cracks")
- Atmosphere particles (e.g. "floating golden dust motes", "drifting cherry blossom petals", "swirling embers", "light snowfall")

[LIGHTING BLOCK] — critical for mood:
- Primary light source and color (e.g. "warm amber sunset rays streaming through broken stained glass")
- Secondary/rim light (e.g. "cool cyan rim light from behind, separating character from background")
- Ambient mood (e.g. "soft purple twilight haze", "harsh dramatic shadows with high contrast")
- Volumetric effects (e.g. "god rays through canopy", "volumetric fog at knee level", "light shafts through dust")

[CAMERA BLOCK] — composition matters:
- Shot type: extreme wide / wide / medium / close-up / extreme close-up
- Angle: eye level / low angle hero shot / high angle / dutch tilt / bird's eye / worm's eye
- Depth: "shallow depth of field with bokeh background" or "deep focus showing full environment"
- Composition: rule of thirds placement, leading lines, framing elements

[QUALITY SUFFIX] — end every prompt with:
"masterpiece quality, ultra detailed, 4K UHD, sharp focus, professional illustration, trending on ArtStation, unreal engine 5 rendering"

═══ NEGATIVE CONSTRAINTS ═══
- NEVER include any text, words, letters, numbers, watermarks, or signatures in prompts
- NEVER use character names — only physical descriptions
- NEVER describe dark/gritty/muted aesthetics — keep colors VIBRANT even in serious scenes
- NEVER leave characters vague — always specify hair color, eye color, outfit details
- NEVER skip the lighting block — lighting makes or breaks the image
- NEVER write prompts shorter than 80 words or longer than 150 words
- NEVER use the word "realistic" or "photorealistic" — always anime/stylized

═══ OUTPUT FORMAT ═══
prompt1 ||| prompt2 ||| prompt3

No labels, no numbers, no explanation. Just the 3 prompts separated by |||`,
    },
    {
      role: "user",
      content: `Extract 3 key visual scenes from this passage:\n\n${storyText.slice(0, 2500)}`,
    },
  ]);

  return result.text.split("|||").map(p => p.trim()).filter(p => p.length > 20);
}

export async function generateImage(scenePrompt: string): Promise<{
  imageBase64: string;
  mimeType: string;
  prompt: string;
} | null> {
  const encoded = encodeURIComponent(scenePrompt);
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 3000 * attempt)); // wait 3s, 6s between retries
      }
      
      const url = `https://image.pollinations.ai/prompt/${encoded}?width=1920&height=1080&model=flux&nologo=true&enhance=true&seed=${Date.now() + attempt}`;
      const res = await fetch(url);
      
      if (res.status === 429) {
        console.log(`Pollinations rate limited, retry ${attempt + 1}/3...`);
        continue;
      }
      
      if (!res.ok) {
        console.error("Pollinations error:", res.status);
        return null;
      }

      const buffer = await res.arrayBuffer();
      const imageBase64 = Buffer.from(buffer).toString("base64");
      return { imageBase64, mimeType: "image/jpeg", prompt: scenePrompt };
    } catch (err) {
      console.error("Image generation failed:", err);
    }
  }
  return null;
}

export async function generateStoryImages(storyText: string): Promise<{
  imageBase64: string;
  mimeType: string;
  prompt: string;
}[]> {
  try {
    const scenePrompts = await extractScene(storyText);
    if (!scenePrompts.length) return [];

    const images = [];
    for (const prompt of scenePrompts.slice(0, 3)) {
      const img = await generateImage(prompt);
      if (img) images.push(img);
      // Delay between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
    }

    return images.filter((img): img is NonNullable<typeof img> => img !== null);
  } catch (err) {
    console.error("Story image pipeline failed:", err);
    return [];
  }
}