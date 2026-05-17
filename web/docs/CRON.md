# AI Article Cron

Automatically publishes articles via `GET /api/cron/generate`.

## What each run does

1. Picks the category with the oldest last article (rotation across niches)
2. Fetches **latest news** from Google News RSS for that niche
3. Calls **AI** (Groq free, Gemini free, or OpenAI) with EEAT + SEO + easy-English prompts
4. Ensures **≥ 1000 words** (auto-expands if too short)
5. Adds a **high-quality hero image** (Unsplash API or niche fallback)
6. Injects **affiliate** product table when relevant + DB affiliate links
7. Lists **reliable sources** (news URLs + AI citations)
8. **Auto-publishes** when enabled in admin settings

## Vercel schedule

`vercel.json` — **every 4 hours** (`0 */4 * * *` → 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC). That is **6 articles per day**.

**Vercel Hobby** may only run scheduled crons once per day. If posts are not appearing every 4 hours, upgrade to **Pro** or use a free external scheduler:

1. [cron-job.org](https://cron-job.org) → new job every **4 hours**
2. URL: `https://viralhotshots.com/api/cron/generate`
3. Header: `Authorization: Bearer YOUR_CRON_SECRET`

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://viralhotshots.com/api/cron/generate
```

## Required env vars (Vercel Production)

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | **Free** article generation ([console.groq.com](https://console.groq.com)) |
| `GEMINI_API_KEY` | **Free** alternative ([aistudio.google.com/apikey](https://aistudio.google.com/apikey)) |
| `AI_PROVIDER` | `groq` \| `gemini` \| `openai` (auto-detected from keys if omitted) |
| `OPENAI_API_KEY` | Optional paid OpenAI |
| `CRON_SECRET` | Secures the endpoint |
| `DATABASE_URL` | Save articles |
| `UNSPLASH_ACCESS_KEY` | Optional — better hero images |

## Manual test (local)

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/generate
```

## Admin

**Settings → AI article cron**

- Enable scheduled cron
- Auto-publish (recommended ON)
- AI model (default `llama-3.3-70b-versatile` on Groq)

**Dashboard → Recent AI cron jobs** — success/error logs.
