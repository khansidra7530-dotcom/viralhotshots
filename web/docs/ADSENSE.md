# Google AdSense Setup

## Prerequisites

- 15–30 quality articles published
- Privacy policy, terms, affiliate disclosure pages (included)
- Custom domain with SSL
- Original, valuable content (review AI articles before publishing)

## Steps

1. Apply at [google.com/adsense](https://www.google.com/adsense)
2. Add site and verify ownership
3. Copy your publisher ID (`ca-pub-xxxxxxxx`)
4. Set in `.env`:
   ```
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxx
   ```
5. Create ad units in AdSense dashboard
6. Replace slot IDs in `src/components/ads/ad-slot.tsx`:
   - `in-article-top`
   - `in-article-bottom`
   - `sidebar-sticky`

## Layout Notes

- Ad containers use `min-height` to prevent CLS
- Avoid placing ads above the fold on mobile
- Max 3 ad units per page recommended
- Content spacing is optimized in article layout

## AdSense Script

Add to `src/app/layout.tsx` when approved:

```tsx
<Script
  async
  src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```
