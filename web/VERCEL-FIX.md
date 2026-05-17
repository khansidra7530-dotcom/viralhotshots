# Fix: "No Output Directory named public"

Your Vercel project has the wrong **Output Directory**. Next.js does not build into `public/`.

## Fix in Vercel (2 minutes)

1. Open project → **Settings** → **Build and Deployment**
2. Set:

| Setting | Value |
|---------|--------|
| **Framework Preset** | Next.js |
| **Root Directory** | `web` |
| **Build Command** | *(leave empty)* |
| **Install Command** | *(leave empty)* |
| **Output Directory** | *(leave empty — delete `public` if shown)* |

3. Click **Save**
4. **Deployments** → **Redeploy**

## Fix: 404 NOT_FOUND on `*.vercel.app`

A **404** on the Vercel URL almost always means the deployment **did not build** or Vercel is serving the wrong folder.

1. **Deployments** → open the latest deployment → confirm status is **Ready** (green), not **Error**
2. If **Error**, open **Build Logs** and fix the first red error (often missing env vars or wrong root)
3. **Settings → Build and Deployment** must match the table above (`Root Directory` = `web`, **Framework** = Next.js)
4. **Settings → Environment Variables** (Production): add `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`
5. **Redeploy** after saving settings
6. Test: `https://YOUR-PROJECT.vercel.app/api/health` should return `{"ok":true,...}`

Do **not** set a root-level `vercel.json` with `outputDirectory` or `installCommand --prefix web` when Root Directory is already `web`.

## Why this happens

- `public/` in Next.js = static files (images, favicon), **not** the build output
- Vercel builds Next.js automatically into `.next/` — you must not override Output Directory
