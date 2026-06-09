# LLM Story Writer

A multi-model AI story generator featuring **Qwen 3 235B**, **Mistral Small 24B**, and **Gemma 3 27B** — powered by OpenRouter's unified API.

## Features

- **Pick your narrator** — 3 distinct AI models with unique writing styles
- **Block-by-block generation** — Build stories chapter by chapter
- **Mid-story model switching** — Blend writing styles seamlessly
- **8 genres** — Fantasy, Sci-Fi, Horror, Romance, Mystery, Adventure, Thriller, Dystopian
- **Performance metrics** — Real-time tokens/sec, latency, usage tracking

## Tech Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS 4
- **OpenRouter API** (free, one key for all models)
- **Models**: Qwen 3 235B, Mistral Small 24B, Gemma 3 27B

## Deploy in 3 Minutes

### 1. Get OpenRouter API Key (free)
Go to [openrouter.ai/keys](https://openrouter.ai/keys), sign up, create a key.

### 2. Clone & run
```bash
git clone https://github.com/YOUR_USERNAME/llm-story-writer.git
cd llm-story-writer
npm install
cp .env.example .env.local
# Add your OPENROUTER_API_KEY to .env.local
npm run dev
```

### 3. Deploy to Vercel
```bash
npx vercel --prod
```
Add `OPENROUTER_API_KEY` as environment variable when prompted.

## License
MIT
