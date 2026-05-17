# AI Article Cron

Automatically publishes articles via `GET /api/cron/generate`.

## What each run does

1. Picks the **next niche in order** (Finance → Tech → AI → Health → Gaming → Crypto → Business → Travel → repeat)
2. Fetches **latest news** from Google News RSS for that niche
3. Calls **Groq** (free) with EEAT + SEO + easy-English prompts
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
| `GROQ_MODEL` | Default `llama-3.3-70b-versatile` |
| `CRON_SECRET` | Secures the endpoint |
| `DATABASE_URL` | Save articles |
| `UNSPLASH_ACCESS_KEY` | Optional — better hero images |

## Niche rotation (one per cron run)

Each call publishes **one** article for the **next** niche in this order:

Finance → Tech → AI → Health → Gaming → Crypto → Business → Travel → (repeat)

With cron every **4 hours**, each niche gets a new post about every **32 hours**.

## Publish all niches at once (local)

```bash
cd web
npm run publish:all-niches
```

Or via API (needs ~3–15 min, Vercel Pro timeout):

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://viralhotshots.com/api/cron/generate?all=1"
```

## Publish one niche only

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://viralhotshots.com/api/cron/generate?niche=HEALTH"
```

## Manual test (local)

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/generate
```

## Admin

**Settings → AI article cron**

- Enable scheduled cron
- Auto-publish (recommended ON)
- Groq model (default `llama-3.3-70b-versatile`)

**Dashboard → Recent AI cron jobs** — success/error logs.
