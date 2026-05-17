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
  recentTitles?: string[];
}): string {
  const site = input.siteName ?? "Viral Hotshots";
  const today = new Date().toISOString().slice(0, 10);

  const topicLine = input.topic
    ? `Focus topic: ${input.topic}`
    : input.news
      ? `Write about THIS specific news story (do not copy the headline word-for-word): "${input.news.headline}" — ${input.news.summary}`
      : `Pick a fresh, specific topic for ${input.niche} readers in ${input.category}. Avoid generic listicles like "5 tips" unless the news demands it.`;

  const avoidDupes =
    input.recentTitles?.length ?
      `\n## Do NOT repeat these recent articles (pick a different angle):\n${input.recentTitles.map((t) => `- ${t}`).join("\n")}`
    : "";

  const newsSources =
    input.news?.sources?.length ?
      `\nCite these real news links in sources (add 2–3 more from Reuters, BBC, AP, NIH, FTC, or official .gov):\n${input.news.sources.map((s) => `- ${s.title}: ${s.url}`).join("\n")}`
    : "";

  return `You are a trusted editor at ${site}. Write for everyday readers who want simple, honest help.

${topicLine}
Category: ${input.category}
Niche: ${input.niche}
Date context: ${today}
${avoidDupes}
${newsSources}

## Writing style (required)
- VERY EASY ENGLISH: Grade 6–8 reading level. Short sentences (12–18 words average). Common words only.
- Explain any jargon in plain English the first time you use it.
- Sound human: use "you" and "we", contractions (it's, don't, you'll), and real examples.
- Never use: "delve", "landscape", "game-changer", "unlock", "dive in", "in today's fast-paced world", "it's important to note", "in conclusion".
- Short paragraphs (2–4 sentences max).

## EEAT & trust (required)
- Share practical steps anyone can try. Say who each tip is best for.
- Include balanced pros AND cons. Admit limits ("this won't work if…").
- No fake degrees, fake studies, or made-up quotes. No medical or financial guarantees.
- Author voice: experienced friend who did the research — not a robot.

## SEO (required)
- LENGTH: ${MIN_WORDS}–${MAX_WORDS} words in "content" (markdown body only).
- One clear primary keyword in the first 80 words and in one H2.
- Meta title 50–60 chars, meta description 120–160 chars.
- Use ## and ### headings (no H1 in content). Descriptive, searchable headings.
- 5–8 relevant tags.

## Structure
- Hook in the first paragraph: why this matters right now.
- 5–8 H2 sections with useful detail, lists, and examples.
- FAQ: 4–6 real questions readers would Google.
- Soft affiliate mentions only where honest (2–3 max).

## Hero image
- "featuredImageSearchQuery" must be a UNIQUE, specific 4–7 word photo search matching THIS article only (not generic "AI technology"). Example: "person budgeting notebook coffee" or "hiking trail mountain sunrise".

Return ONLY valid JSON (no markdown fences):
{
  "title": "unique SEO title — not generic",
  "metaDescription": "120-160 chars",
  "slug": "url-friendly-slug",
  "excerpt": "2-3 simple sentences",
  "featuredImageSearchQuery": "specific unsplash search query",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "content": "full markdown WITHOUT H1",
  "faq": [{"question": "...", "answer": "..."}],
  "sources": [{"title": "Publisher - Topic", "url": "https://..."}],
  "internalLinkSuggestions": [{"anchor": "...", "topic": "..."}],
  "affiliateProducts": [{"name": "...", "price": "$...", "rating": 4.5, "url": "https://...", "badge": "Best Overall"}]
}

${input.affiliateKeywords?.length ? `Affiliate topics (only if truly relevant): ${input.affiliateKeywords.join(", ")}` : ""}`;
}

export function buildExpandPrompt(content: string, targetWords: number): string {
  return `Expand this article to at least ${targetWords} words. Keep simple English (grade 6–8). Add one more helpful H2 with examples. Do not remove existing sections. Return ONLY JSON: { "content": "expanded markdown" }

Article:
${content.slice(0, 12000)}`;
}

export const ARTICLE_MIN_WORDS = MIN_WORDS;
