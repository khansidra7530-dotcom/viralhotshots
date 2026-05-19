import type { Niche } from "@/generated/prisma/client";
import type { NewsBrief } from "@/lib/ai/news";
import type { KeywordSet } from "@/lib/ai/keywords";

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
  keywords: KeywordSet;
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

## SEO keywords (required — use these exact phrases naturally)
- PRIMARY KEYWORD (must use): "${input.keywords.primary}"
- SECONDARY KEYWORDS (use 2–4 across H2/H3): ${input.keywords.secondary.join(", ")}
- "title" (HTML title tag): MUST include the primary keyword near the start. 50–60 characters.
- "metaDescription": MUST include the primary keyword once. 120–160 characters.
- "content": PRIMARY keyword in the first 60 words. PRIMARY or secondary keyword in at least 4 different ## H2 headings (word naturally, not stuffed).
- Use ### subheadings under H2s where helpful; include a secondary keyword in 1–2 H3s.
- 5–8 tags including the primary keyword and related terms.
- FAQ: 4–6 real questions readers would Google.
- Soft affiliate mentions only where honest (2–3 max).

## Hero image
- "featuredImageSearchQuery" must be a UNIQUE, specific 4–7 word photo search matching THIS article only (not generic "AI technology"). Example: "person budgeting notebook coffee" or "hiking trail mountain sunrise".

Return ONLY valid JSON (no markdown fences, no "content" field — body is generated separately):
{
  "title": "unique SEO title — not generic",
  "metaDescription": "120-160 chars",
  "slug": "url-friendly-slug",
  "excerpt": "2-3 simple sentences",
  "featuredImageSearchQuery": "specific unsplash search query",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "faq": [{"question": "...", "answer": "..."}],
  "sources": [{"title": "Publisher - Topic", "url": "https://..."}],
  "internalLinkSuggestions": [{"anchor": "...", "topic": "..."}],
  "affiliateProducts": [{"name": "...", "price": "$...", "rating": 4.5, "url": "https://...", "badge": "Best Overall"}]
}

${input.affiliateKeywords?.length ? `Affiliate topics (only if truly relevant): ${input.affiliateKeywords.join(", ")}` : ""}`;
}

export function buildArticleBodyPrompt(input: {
  title: string;
  excerpt: string;
  niche: Niche;
  category: string;
  keywords: KeywordSet;
  news?: NewsBrief | null;
}): string {
  const newsNote = input.news
    ? `\nNews angle: "${input.news.headline}" — ${input.news.summary}`
    : "";

  return `Write the full article body in markdown for this post.

Title: ${input.title}
Excerpt: ${input.excerpt}
Category: ${input.category} (${input.niche})
Primary keyword: "${input.keywords.primary}"
Secondary keywords: ${input.keywords.secondary.join(", ")}
${newsNote}

## Rules
- VERY EASY ENGLISH (grade 6–8). Short sentences. No AI clichés.
- ${MIN_WORDS}–${MAX_WORDS} words. Markdown only — NO H1 (title is separate).
- PRIMARY keyword in the first 60 words.
- 5–8 ## H2 sections; use ### subheadings where helpful.
- Include lists, examples, pros/cons. Be practical and trustworthy.
- Do NOT invent fake experts, studies, or placeholder URLs.

Return ONLY valid JSON:
{"content": "full markdown article body here"}`;
}

export function buildExpandPrompt(content: string, targetWords: number): string {
  return `Expand this article to at least ${targetWords} words. Keep simple English (grade 6–8). Add one more helpful H2 with examples. Do not remove existing sections. Return ONLY JSON: { "content": "expanded markdown" }

Article:
${content.slice(0, 12000)}`;
}

export const ARTICLE_MIN_WORDS = MIN_WORDS;
