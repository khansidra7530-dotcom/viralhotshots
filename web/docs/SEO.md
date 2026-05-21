# SEO Setup Guide

## Built-in features

| Feature | URL / location |
|---------|----------------|
| Sitemap | `https://viralhotshots.com/sitemap.xml` |
| Robots | `https://viralhotshots.com/robots.txt` |
| Open Graph + Twitter cards | All pages via `buildMetadata()` |
| JSON-LD | Article, FAQ, Breadcrumb, Organization, WebSite |
| IndexNow key file | `https://viralhotshots.com/indexnow-key.txt` |
| IndexNow bulk submit | `POST /api/indexnow` (CRON_SECRET) |

---

## 1. Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property → **URL prefix** → `https://viralhotshots.com`
3. Choose **HTML tag** verification
4. Copy the `content="..."` value (not the full meta tag)
5. Add to Vercel env:

```env
GOOGLE_SITE_VERIFICATION="paste-content-value-here"
```

6. Redeploy, then click **Verify** in Search Console
7. **Sitemaps** → Submit: `https://viralhotshots.com/sitemap.xml`
8. Use **URL inspection** to request indexing for key pages

---

## 2. Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add site `https://viralhotshots.com`
3. Choose **Meta tag** verification
4. Copy the `content="..."` value from `msvalidate.01`
5. Add to Vercel env:

```env
BING_SITE_VERIFICATION="paste-content-value-here"
```

6. Redeploy, then click **Verify**
7. **Sitemaps** → Submit: `https://viralhotshots.com/sitemap.xml`
8. Optional: import from Google Search Console (Bing offers this during setup)

---

## 3. Sitemap

Auto-generated at `/sitemap.xml` and includes:

- Static pages (home, blog, categories, authors, legal)
- All published articles
- Category and author pages

Referenced in `robots.txt`. Resubmit in GSC/Bing after major content pushes.

---

## 4. Open Graph tags

Every page gets:

- `og:title`, `og:description`, `og:url`, `og:site_name`, `og:image`
- `og:type` (`website` or `article`)
- Articles also get `article:published_time`, `article:modified_time`, `article:author`, `article:section`, tags
- Twitter `summary_large_image` card

Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or [opengraph.xyz](https://www.opengraph.xyz/).

---

## 5. IndexNow (Bing + Yandex instant indexing)

IndexNow pings search engines when articles are published (cron, admin, AI).

### Setup

1. Generate a random key (32+ chars):

```powershell
openssl rand -hex 16
```

2. Add to Vercel env:

```env
INDEXNOW_KEY="your-random-key-here"
```

3. Deploy — verify key file loads:  
   `https://viralhotshots.com/indexnow-key.txt`

4. Submit all existing URLs once:

```powershell
curl -X POST "https://viralhotshots.com/api/indexnow?secret=YOUR_CRON_SECRET" -H "Content-Type: application/json" -d "{}"
```

Or submit a single URL:

```json
{ "urls": ["https://viralhotshots.com/blog/your-slug"] }
```

New publishes auto-notify IndexNow — no manual step needed.

---

## Environment variables (SEO)

```env
NEXT_PUBLIC_SITE_URL="https://viralhotshots.com"
GOOGLE_SITE_VERIFICATION=""
BING_SITE_VERIFICATION=""
INDEXNOW_KEY=""
```

---

## Best practices

- Approve only high-quality AI articles (review in admin)
- Target 1200–2500 words per post
- Meta descriptions: 120–160 characters
- Featured images on every post (1200×630 OG image)
- Build topical authority within each niche category

## EEAT checklist

- [ ] Author bio on author pages
- [ ] Sources/references section in articles
- [ ] Affiliate disclosure linked in footer
- [ ] Contact page with real email
- [ ] Fact-check statistics and claims
