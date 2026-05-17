# Deploy to IONOS — viralhotshots.com

Your app needs **Node.js** (Next.js) + **PostgreSQL**. IONOS shared web hosting (PHP only) will **not** run this project. Use one of these setups:

| Setup | Best for |
|-------|----------|
| **A) IONOS VPS** (site + DB on same server) | Everything on IONOS |
| **B) IONOS PostgreSQL + Vercel** (site on Vercel, DB on IONOS) | Easiest Next.js deploy |
| **C) IONOS VPS + IONOS Managed PostgreSQL** | Production scale |

---

## Step 1 — Create a live PostgreSQL database

### Option A: IONOS Managed PostgreSQL (Cloud)

1. Log in to [IONOS Cloud](https://cloud.ionos.com) (not regular IONOS control panel if you only have domain hosting).
2. Go to **Databases → PostgreSQL** → Create cluster.
3. Note the connection details:
   - Host (e.g. `postgresql-xxxxx.db.cloud.ionos.com`)
   - Port (`5432`)
   - Database name
   - Username / password
4. Enable **external access** / allow your server IP (VPS or Vercel) in firewall rules.
5. Build your connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

### Option B: PostgreSQL on IONOS VPS (same server as the site)

SSH into your VPS and run:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER viralhotshots WITH PASSWORD 'YOUR_STRONG_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE viralhotshots OWNER viralhotshots;"
```

Connection string (local on VPS):

```env
DATABASE_URL="postgresql://viralhotshots:YOUR_STRONG_PASSWORD@localhost:5432/viralhotshots"
```

---

## Step 2 — Push your database schema (from your PC)

On your Windows machine, in the `web` folder, set production `DATABASE_URL` temporarily (or use a `.env.production` file):

```powershell
cd "C:\Users\burnh\OneDrive\Desktop\automate blog\web"

# Set for this session only (replace with your real IONOS URL)
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"

npx prisma db push
npm run db:seed
```

Or use migrations for production:

```powershell
npx prisma migrate deploy
npm run db:seed
```

You should see: `Seed complete!` and your admin user created.

---

## Step 3 — Deploy the Next.js site

### Recommended: IONOS VPS (full control on viralhotshots.com)

**Minimum VPS:** 2 GB RAM, Ubuntu 22.04.

#### 3.1 DNS (IONOS domain panel)

1. Open [IONOS](https://www.ionos.com) → Domains → **viralhotshots.com** → DNS.
2. Add an **A record**:
   - Name: `@` → Points to your VPS public IP
   - Name: `www` → Points to same IP (or CNAME to `@`)

#### 3.2 Server setup (SSH)

```bash
# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Clone or upload your project
cd /var/www
sudo git clone YOUR_GITHUB_REPO viralhotshots
cd viralhotshots/web

# Install & build
npm ci
npm run build
```

#### 3.3 Production `.env` on the server

Create `/var/www/viralhotshots/web/.env`:

```env
DATABASE_URL="postgresql://viralhotshots:PASSWORD@localhost:5432/viralhotshots"
AUTH_SECRET="paste-long-random-string-here"
NEXTAUTH_URL="https://viralhotshots.com"
NEXT_PUBLIC_SITE_NAME="Viral Hotshots"
NEXT_PUBLIC_SITE_URL="https://viralhotshots.com"
GROQ_API_KEY="gsk-your-key"
GROQ_MODEL="llama-3.3-70b-versatile"
CRON_SECRET="another-long-random-string"
ADMIN_EMAIL="your@email.com"
ADMIN_PASSWORD="StrongPassword123!"
```

Generate secrets:

```bash
openssl rand -base64 32
```

#### 3.4 Run with PM2

```bash
sudo npm install -g pm2
cd /var/www/viralhotshots/web
pm2 start npm --name viralhotshots -- start
pm2 save
pm2 startup
```

#### 3.5 Nginx + SSL

```bash
sudo nano /etc/nginx/sites-available/viralhotshots
```

```nginx
server {
    listen 80;
    server_name viralhotshots.com www.viralhotshots.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/viralhotshots /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d viralhotshots.com -d www.viralhotshots.com
```

#### 3.6 Cron (AI articles every 4 hours)

```bash
crontab -e
```

Add:

```cron
0 */4 * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://viralhotshots.com/api/cron/generate >> /var/log/viralhotshots-cron.log 2>&1
```

---

### Alternative: Vercel (site) + IONOS (database only)

1. Push `web/` to GitHub.
2. Import on [vercel.com](https://vercel.com), root directory: `web`.
3. Add all env vars (same as `.env` above).
4. Set `DATABASE_URL` to your **IONOS PostgreSQL** URL (must allow Vercel IPs or public access).
5. In IONOS DNS: add **CNAME** `www` → `cname.vercel-dns.com` (Vercel will show exact values).
6. Add domain `viralhotshots.com` in Vercel → Domains.

Vercel runs the 4-hour cron automatically via `vercel.json`.

---

## Step 4 — Verify everything works

| Check | URL |
|-------|-----|
| Homepage | https://viralhotshots.com |
| Admin | https://viralhotshots.com/admin/login |
| Sitemap | https://viralhotshots.com/sitemap.xml |
| Cron (manual) | `curl -H "Authorization: Bearer CRON_SECRET" https://viralhotshots.com/api/cron/generate` |

---

## Common IONOS issues

| Problem | Fix |
|---------|-----|
| `Can't reach database server` | Open port 5432 for your VPS IP in IONOS DB firewall; use `?sslmode=require` |
| Site shows IONOS parking page | DNS A record not pointing to VPS yet (wait up to 24h) |
| Admin login fails | `NEXTAUTH_URL` must exactly match `https://viralhotshots.com` |
| No articles | Run seed on production DB; enable cron or trigger generate API |
| Only domain, no VPS | Buy **IONOS VPS** or use **Vercel** for the app |

---

## Quick checklist for viralhotshots.com

- [ ] PostgreSQL created (IONOS Cloud or VPS)
- [ ] `DATABASE_URL` in production `.env`
- [ ] `npx prisma db push` + `npm run db:seed` against live DB
- [ ] Next.js deployed (VPS + PM2 or Vercel)
- [ ] DNS A/CNAME records set for viralhotshots.com
- [ ] SSL certificate active (HTTPS)
- [ ] `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` = `https://viralhotshots.com`
- [ ] Change default admin password after first login
- [ ] Add `GROQ_API_KEY` for AI articles
- [ ] Set up cron for `/api/cron/generate`
