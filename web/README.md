# InsightPress — AI-Powered Affiliate Blog Platform

Production-ready Next.js affiliate blogging platform with automated SEO article generation, admin CMS, affiliate tools, and AdSense-optimized layouts.

## Stack

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma 7
- **Auth:** NextAuth.js (credentials)
- **AI:** Groq API (free tier)

## Quick Start

```bash
cd web
cp .env.example .env
# Edit .env with your DATABASE_URL, AUTH_SECRET, GROQ_API_KEY

npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Visit:
- **Site:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login

Default admin (from seed): `admin@insightpress.com` / `ChangeMe123!`

## Features

- Public blog: homepage, categories, search, trending, related posts, author pages
- Legal pages: privacy, terms, affiliate disclosure
- Dark/light mode, newsletter signup, comments (moderated)
- Admin: edit/approve articles, SEO scores, affiliates, settings
- AI cron: generates EEAT-optimized articles every 4 hours
- SEO: meta tags, Open Graph, JSON-LD, sitemap, robots.txt
- AdSense-ready ad slots (CLS-safe containers)
- Affiliate: Amazon links, comparison tables, CTAs

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:seed` | Seed admin, categories, settings |
| `npm run db:migrate` | Run Prisma migrations |

## Cron (4-hour article generation)

**Vercel:** Configured in `vercel.json` — set `CRON_SECRET` in Vercel env vars.

**Manual trigger:**
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/generate
```

**VPS:** Add to crontab:
```
0 */4 * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://yoursite.com/api/cron/generate
```

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [SEO Setup](docs/SEO.md)
- [AdSense Setup](docs/ADSENSE.md)
- [Affiliate Setup](docs/AFFILIATE.md)
- [Cron Setup](docs/CRON.md)

## Folder Structure

```
web/
├── prisma/           # Schema, migrations, seed
├── src/
│   ├── app/          # Pages & API routes
│   ├── components/   # UI components
│   ├── lib/          # Auth, AI, SEO, affiliate logic
│   └── generated/    # Prisma client
├── docs/             # Setup guides
└── vercel.json       # Cron config
```

## License

MIT
