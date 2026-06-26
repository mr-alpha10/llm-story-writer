export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callOpenRouter(model: string, messages: ChatMessage[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const start = Date.now();
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://llm-story-writer.vercel.app",
      "X-Title": "LLM Story Writer",
    },
    body: JSON.stringify({ model, messages, max_tokens: 2500, temperature: 0.8 }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

  const elapsed = Date.now() - start;
  let text = data.choices?.[0]?.message?.content || "";
  // Strip thinking tags from models like Qwen 3
  text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const tokens = data.usage?.completion_tokens || 0;
  const totalTokens = data.usage?.total_tokens || 0;
  const tps = tokens > 0 ? Math.round(tokens / (elapsed / 1000)) : 0;

  return { text, elapsed, tokens, totalTokens, tps };
}