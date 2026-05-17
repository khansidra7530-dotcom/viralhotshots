# Cron Job Setup (4-Hour Article Generation)

## What It Does

Every 4 hours, `GET /api/cron/generate`:
1. Picks the default niche from site settings
2. Calls OpenAI with EEAT-optimized prompts
3. Creates article (PENDING or PUBLISHED based on `autoPublish` setting)
4. Logs result to `CronLog` table

## Vercel Cron

Configured in `vercel.json`:
```json
{ "path": "/api/cron/generate", "schedule": "0 */4 * * *" }
```

Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is set in project env.

## Manual Test

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/generate
```

## VPS Crontab

```
0 */4 * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://yoursite.com/api/cron/generate >> /var/log/insightpress-cron.log 2>&1
```

## Admin Controls

- **Settings → Enable 4-hour cron** — toggle `cronEnabled`
- **Settings → Auto-publish** — skip manual review
- **Settings → Default niche** — which category niche to target

## Requirements

- Valid `OPENAI_API_KEY`
- At least one admin user (seed creates one)
- Categories seeded for the selected niche
