# AI Article Cron

Automatically publishes articles via `GET /api/cron/generate`.

## What each run does

1. Picks the category with the oldest last article (rotation across niches)
2. Fetches **latest news** from Google News RSS for that niche
3. Calls **OpenAI** with EEAT + SEO + easy-English prompts
4. Ensures **≥ 1000 words** (auto-expands if too short)
5. Adds a **high-quality hero image** (Unsplash API or niche fallback)
6. Injects **affiliate** product table when relevant + DB affiliate links
7. Lists **reliable sources** (news URLs + AI citations)
8. **Auto-publishes** when enabled in admin settings

## Vercel schedule

`vercel.json` — daily at **09:00 UTC** (Hobby plan limit: 1 cron/day).

For more runs, use [cron-job.org](https://cron-job.org):

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://viralhotshots.com/api/cron/generate
```

## Required env vars (Vercel Production)

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Article generation |
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
- OpenAI model (default `gpt-4o-mini`)

**Dashboard → Recent AI cron jobs** — success/error logs.
