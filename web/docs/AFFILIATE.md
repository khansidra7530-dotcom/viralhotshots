# Affiliate Setup Guide

## Amazon Associates

1. Join [affiliate-program.amazon.com](https://affiliate-program.amazon.com)
2. Get your Associate tag (e.g. `yoursite-20`)
3. Set in `.env`:
   ```
   AMAZON_ASSOCIATE_TAG=yoursite-20
   ```

## Adding Links

Via Prisma Studio or seed:

```bash
npx prisma studio
```

Create `AffiliateLink` records:
- `name` — keyword for auto-insertion in AI content
- `url` — destination URL
- `network` — `amazon` or `custom`
- `asin` — for Amazon product links
- `niche` — optional niche filter

## AI Auto-Insertion

The cron job passes active affiliate link names to the AI prompt. Articles may include:
- Comparison tables
- CTA blocks
- Natural product mentions

Always disclose affiliate relationships (footer link included).

## Custom Networks

Add links with `network: "custom"` for ShareASale, CJ, Impact, etc.
