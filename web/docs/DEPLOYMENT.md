# Deployment Guide

## Vercel (Recommended for Frontend)

1. Push `web/` to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `web`
4. Add environment variables from `.env.example`
5. Deploy

### Database

Use one of:
- [Neon](https://neon.tech) — serverless Postgres
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

Set `DATABASE_URL` in Vercel → run migrations:
```bash
npx prisma migrate deploy
npm run db:seed
```

### Required env vars on Vercel

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `NEXT_PUBLIC_SITE_URL`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `CRON_SECRET`

## VPS (Optional backend/cron)

If self-hosting:

```bash
git clone <repo>
cd web
npm ci
npm run build
pm2 start npm --name insightpress -- start
```

Nginx reverse proxy to port 3000. Use certbot for SSL.

## Post-deploy checklist

- [ ] Run migrations + seed
- [ ] Change admin password
- [ ] Test `/api/cron/generate` with CRON_SECRET
- [ ] Submit sitemap to Google Search Console
- [ ] Configure AdSense ad unit IDs in components
