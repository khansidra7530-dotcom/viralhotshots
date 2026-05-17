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

## Why this happens

- `public/` in Next.js = static files (images, favicon), **not** the build output
- Vercel builds Next.js automatically into `.next/` — you must not override Output Directory
