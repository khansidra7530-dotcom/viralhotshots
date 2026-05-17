# Go live: viralhotshots.com

Your IONOS **MariaDB** (`dbs13487861`) is not used by this app.  
Use **Neon (Postgres)** + **Vercel (site)** + **IONOS (domain DNS)**.

---

## Step 1 — Live database (Neon) ~5 min

1. Open https://neon.tech → Sign up (free).
2. **New project** → name: `viralhotshots`.
3. Copy the **connection string** (starts with `postgresql://`).
4. On your PC:

```powershell
cd "C:\Users\burnh\OneDrive\Desktop\automate blog\web"
$env:DATABASE_URL="PASTE_NEON_URL_HERE"
npx prisma db push
npm run db:seed
```

You should see `Seed complete!`

---

## Step 2 — Deploy site (Vercel) ~10 min

1. Push project to **GitHub** (the `web` folder or whole repo).
2. https://vercel.com → **Add New Project** → import repo.
3. **Root Directory:** `web` ← **required** (Settings → General → Root Directory)
4. **Framework Preset:** **Next.js** (not "Other")
5. **Build Command:** leave **empty** (default `npm run build`)
6. **Install Command:** leave **empty** (default `npm install`)
7. **Output Directory:** leave **empty** — **NOT** `public` (fixes "No Output Directory named public" error)
8. **Environment Variables** — copy from `.env.production.example`:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon connection string |
| `AUTH_SECRET` | Random 32+ chars |
| `NEXTAUTH_URL` | `https://viralhotshots.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://viralhotshots.com` |
| `NEXT_PUBLIC_SITE_NAME` | `Viral Hotshots` |
| `GROQ_API_KEY` | Free key from [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `CRON_SECRET` | Random string |
| `ADMIN_EMAIL` | Your email |
| `ADMIN_PASSWORD` | Strong password (only if re-seeding) |

7. Click **Deploy**.

### If deploy fails

- Confirm **Root Directory** = `web` (not empty, not `/web/web`)
- Confirm `DATABASE_URL` is set in Vercel env vars
- Redeploy from **Deployments → … → Redeploy**
- View logs: Vercel dashboard → failed deployment → **Building** tab

---

## Step 3 — Connect domain (IONOS DNS) ~5 min

1. Vercel → Project → **Settings → Domains** → Add `viralhotshots.com` and `www.viralhotshots.com`.
2. Vercel shows DNS records (usually **A** `76.76.21.21` or **CNAME** to `cname.vercel-dns.com`).
3. IONOS → **viralhotshots.com** → **DNS**:
   - Set **A** record `@` → Vercel IP (if shown)
   - Set **CNAME** `www` → Vercel target (if shown)
4. Wait 5–60 minutes for SSL (HTTPS).

---

## Step 4 — Verify

| Test | URL |
|------|-----|
| Homepage | https://viralhotshots.com |
| Admin | https://viralhotshots.com/admin/login |
| Sitemap | https://viralhotshots.com/sitemap.xml |

Login: email/password from seed (`admin@viralhotshots.com` unless you changed `ADMIN_EMAIL`).

**Change admin password** after first login.

---

## Step 5 — AI articles (cron)

**Schedule:** every 4 hours (`0 */4 * * *` in `vercel.json` → 6 posts/day at 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC).

**Vercel Hobby** may only trigger crons once per day. If you stay on Hobby, use [cron-job.org](https://cron-job.org) every 4 hours instead:

For more reliability on Hobby, use a free external scheduler (e.g. [cron-job.org](https://cron-job.org)) every 4 hours:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://www.viralhotshots.com/api/cron/generate
```

Manual test anytime:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://www.viralhotshots.com/api/cron/generate
```

In admin → **Settings**: enable cron, set default niche, set Groq model.

---

## Local dev (keep using your PC)

Terminal 1:
```powershell
cd web
npx prisma dev
```

Terminal 2:
```powershell
cd web
npm run dev
```

Use `postgres://postgres:postgres@localhost:51214/...` in `.env` for local only.

---

## Checklist

- [ ] Neon database created
- [ ] `prisma db push` + `db:seed` on Neon URL
- [ ] Vercel deploy succeeded
- [ ] All env vars set on Vercel
- [ ] IONOS DNS points to Vercel
- [ ] HTTPS works on viralhotshots.com
- [ ] Admin login works
- [ ] Groq API key added on Vercel
- [ ] Cron tested once
