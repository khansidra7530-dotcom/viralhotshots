# AI Marketing System

Autonomous marketing pipeline for Viral Hotshots — modular agents, cron automation, and admin dashboard.

## Architecture

```
Trend Research → Writing → SEO → Social Media → Analytics → Optimization
       ↑                                              ↓
   Google Trends, Reddit, HN, Product Hunt, News     Daily snapshots + admin dashboard
```

### Agents (`src/lib/marketing/agents/`)

| Agent | Role |
|-------|------|
| **Trend Research** | Multi-source trend discovery, keyword scoring, competition analysis |
| **SEO** | Title/meta optimization, AI search snippets, EEAT signals |
| **Writing** | Wraps existing `generateArticle()` with trend topics |
| **Social Media** | X, Threads, LinkedIn, Reddit, Facebook copy generation |
| **Analytics** | View/SEO snapshots, top performers, event tracking |
| **Optimization** | Refreshes stale articles, fixes SEO, re-indexes via IndexNow |

### Orchestrator

`runDailyMarketingPipeline()` in `src/lib/marketing/orchestrator.ts` runs the full daily flow.

## Cron endpoints

All require `Authorization: Bearer CRON_SECRET` or `?secret=`.

| Endpoint | Schedule (Vercel) | Purpose |
|----------|-------------------|---------|
| `/api/cron/marketing` | Daily 6:00 UTC | Full pipeline |
| `/api/cron/research-trends` | Daily 5:00 UTC | Trend research only |
| `/api/cron/generate` | Daily 12:00 UTC | Extra article (Hobby plan: 1×/day) |
| `/api/cron/social-publish` | Daily 7:00 UTC | Publish due social posts |
| `/api/cron/optimize` | Weekly Sun 3:00 UTC | SEO refresh agent |

> **Vercel Hobby** allows each cron to run at most once per day. For every-4-hour articles, use [cron-job.org](https://cron-job.org) to hit `/api/cron/generate` with your `CRON_SECRET`.

### Manual trigger (PowerShell)

```powershell
curl.exe -s -H "Authorization: Bearer YOUR_CRON_SECRET" "https://www.viralhotshots.com/api/cron/marketing"
```

## Admin dashboard

**`/admin/marketing`** — analytics, trend queue, social posts, agent runs, manual triggers.

**Settings** — enable/disable marketing, social auto-post, optimization, LLM provider, n8n webhook.

## Environment variables

```env
# LLM (at least one required)
GROQ_API_KEY=
OPENAI_API_KEY=          # optional
ANTHROPIC_API_KEY=       # optional Claude
PREFERRED_LLM=groq       # groq | openai | anthropic

# Trend sources
PRODUCT_HUNT_TOKEN=      # optional
TWITTER_TRENDS_JSON=[]   # optional JSON array until X API connected

# Social publishing
FACEBOOK_PAGE_ID=
FACEBOOK_PAGE_ACCESS_TOKEN=
N8N_WEBHOOK_URL=         # n8n receives X/LinkedIn/Reddit/Threads posts
```

## n8n integration

When a social post is due for non-Facebook platforms, the system POSTs to your n8n webhook:

```json
{
  "event": "social_post_due",
  "platform": "TWITTER",
  "content": "...",
  "threadParts": ["..."],
  "articleId": "...",
  "postId": "..."
}
```

Build n8n workflows to post to X, LinkedIn, Reddit, etc., then mark posts published in your workflow or via a callback.

## Database migration

After pulling changes:

```bash
cd web
npm run db:push
npm run db:generate
```

New models: `MarketingResearchRun`, `TrendCandidate`, `SocialPost`, `ArticleMetricDaily`, `ArticleOptimizationRun`.

## Analytics events

POST `/api/analytics/event`:

```json
{ "type": "affiliate_click", "path": "/blog/slug", "metadata": { "linkId": "..." } }
```

Events feed the marketing analytics dashboard alongside GA4 and `viewCount`.
