# Cron Job Setup (AI Article Generation)

## What It Does

`GET /api/cron/generate` runs on a schedule and:
1. Picks the default niche from site settings
2. Calls OpenAI with EEAT-optimized prompts
3. Creates article (PENDING or PUBLISHED based on `autoPublish` setting)
4. Logs result to `CronLog` table

## Vercel Cron (Hobby = once per day)

Configured in `vercel.json`:
```json
{ "path": "/api/cron/generate", "schedule": "0 9 * * *" }
```
Runs daily at **09:00 UTC**. Vercel Hobby does not allow hourly crons.

Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is set in project env.

**More than once per day?** Use [cron-job.org](https://cron-job.org) (free) to HTTP GET your endpoint every 4 hours, or upgrade to Vercel Pro.

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
