import type { Niche } from "@/generated/prisma/client";
import type { NewsBrief } from "@/lib/ai/news";

const MIN_WORDS = 1000;
const MAX_WORDS = 2500;

export function buildArticlePrompt(input: {
  niche: Niche;
  category: string;
  topic?: string;
  news?: NewsBrief | null;
  affiliateKeywords?: string[];
  siteName?: string;
}): string {
  const site = input.siteName ?? "Viral Hotshots";
  const topicLine = input.topic
    ? `Focus topic: ${input.topic}`
    : input.news
      ? `Base the article on this timely news angle: "${input.news.headline}" — ${input.news.summary}`
      : `Pick a timely, high-search-intent topic for ${input.niche} readers in ${input.category}.`;

  const newsSources =
    input.news?.sources?.length ?
      `\nUse these real news sources in your references section (you may add other reputable outlets like Reuters, BBC, AP, NIH, FTC, or official .gov sites):\n${input.news.sources.map((s) => `- ${s.title}: ${s.url}`).join("\n")}`
    : "";

  return `You are a senior editor at ${site}. Write for everyday readers in clear, friendly English (grade 8–10 reading level).

${topicLine}
Category: ${input.category}
Niche: ${input.niche}
${newsSources}

## Content standards (required)
1. LENGTH: ${MIN_WORDS}–${MAX_WORDS} words in the "content" field (markdown body only, no title).
2. EEAT: Show real expertise — practical tips, balanced pros/cons, when something is not right for everyone. No fake credentials or made-up studies.
3. TRUST: Cite reputable sources only. Include 4–6 sources with real-looking publisher names and plausible URLs (prefer .gov, .edu, major news, official brand sites).
4. SEO: Natural keyword use, semantic variations, one clear primary keyword in the first 100 words, descriptive H2/H3 headings.
5. HUMAN VOICE: Short paragraphs, contractions, varied sentence length, occasional questions. Avoid: "In conclusion", "delve", "landscape", "game-changer", "it's important to note".
6. STRUCTURE: Markdown with ## and ### headings (do NOT repeat the article title as H1). Include bullet lists where helpful.
7. AFFILIATE: 2–3 soft recommendation sections where honest; include affiliateProducts JSON when products fit (disclose value in tone, not hype).
8. LATEST NEWS: Frame as current (${new Date().toISOString().slice(0, 10)}) — what's happening now and why readers should care.
9. ADSENSE-SAFE: No medical cures, no guaranteed income, no adult content, no hate.

Return ONLY valid JSON (no markdown fences):
{
  "title": "50-65 char SEO title",
  "metaDescription": "120-160 chars",
  "slug": "url-friendly-slug",
  "excerpt": "2-3 sentence hook",
  "featuredImageSearchQuery": "3-6 word Unsplash search query for hero photo",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "content": "full markdown article WITHOUT H1 title",
  "faq": [{"question": "...", "answer": "..."}],
  "sources": [{"title": "Publisher - Article", "url": "https://..."}],
  "internalLinkSuggestions": [{"anchor": "...", "topic": "..."}],
  "affiliateProducts": [{"name": "...", "price": "$...", "rating": 4.5, "url": "https://...", "badge": "Best Overall"}]
}

${input.affiliateKeywords?.length ? `Weave in these affiliate topics only if genuinely relevant: ${input.affiliateKeywords.join(", ")}` : ""}`;
}

export function buildExpandPrompt(content: string, targetWords: number): string {
  return `Expand this markdown article to at least ${targetWords} words. Keep the same topic, tone, and facts. Add useful examples, a short "What experts say" section, and one more H2. Do not remove existing headings. Return ONLY JSON: { "content": "expanded markdown" }

Current article:
${content.slice(0, 12000)}`;
}

export const ARTICLE_MIN_WORDS = MIN_WORDS;
