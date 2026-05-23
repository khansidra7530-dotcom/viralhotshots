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
      ? `TRENDING NOW (from Google Trends / Google News — write a timely article about this):
- Headline: "${input.news.headline.slice(0, 140)}"
- Context: ${input.news.summary.slice(0, 280)}${input.news.traffic ? `\n- Search interest: ${input.news.traffic}` : ""}${input.news.trendingQuery ? `\n- Trending query: "${input.news.trendingQuery}"` : ""}${input.news.relatedTrends?.length ? `\n- Also trending: ${input.news.relatedTrends.slice(0, 4).join("; ")}` : ""}
Explain what happened, why it matters, and what readers should know. Use today's date. Do NOT write a stale evergreen piece — tie the article to this news angle.`
      : `Pick a fresh, specific topic for ${input.niche} readers in ${input.category}. Avoid generic listicles like "5 tips" unless the news demands it.`;

  const avoidDupes =
    input.recentTitles?.length ?
      `\nAvoid duplicating these titles:\n${input.recentTitles
        .slice(0, 5)
        .map((t) => `- ${t.slice(0, 80)}`)
        .join("\n")}`
    : "";

  const newsSources =
    input.news?.sources?.length ?
      `\nInclude 2–3 sources in JSON. Example links:\n${input.news.sources
        .slice(0, 2)
        .map((s) => `- ${s.title.slice(0, 60)}`)
        .join("\n")}`
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
- "featuredImageSearchQuery" must be a UNIQUE, specific 4–7 word photo search tied to the news story and THIS article (use names, places, or objects from the headline — not generic "AI technology"). Example: "federal reserve building economy" or "nvidia gpu chip closeup".

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
    ? `\nTrending news angle (Google): "${input.news.headline.slice(0, 120)}" — ${input.news.summary.slice(0, 200)}. Open with why this is trending now.`
    : "";

  return `Write article body (markdown, no H1).

Title: ${input.title.slice(0, 100)}
Keyword: "${input.keywords.primary}"
Also use: ${input.keywords.secondary.slice(0, 3).join(", ")}
Category: ${input.category}
${newsNote}

## Rules
- Simple English (grade 6–8). Short sentences.
- MINIMUM ${MIN_WORDS} words in "content" (aim for ${MIN_WORDS + 150}). Shorter articles are rejected.
- Markdown only — NO H1. No FAQ or sources section (added later).
- PRIMARY keyword in the first 60 words.
- At least 6 ## H2 sections (150+ words each on average). Use ### subheadings under H2s.
- Each H2 needs 2–4 short paragraphs OR a list plus explanation.
- Include real examples, pros/cons, and practical steps.
- Do NOT invent fake experts, studies, or placeholder URLs.

Return ONLY valid JSON:
{"content": "full markdown article body here"}`;
}

export function buildExpandPrompt(content: string, targetWords: number, currentWords: number): string {
  const need = Math.max(targetWords - currentWords, 250);
  return `The article is only ${currentWords} words. Expand to AT LEAST ${targetWords} words total.

Add ${need}+ new words by:
- Expanding thin sections with examples and detail
- Adding 2–3 new ## H2 sections if needed
- Do NOT remove existing headings or shorten text

Keep simple English (grade 6–8). Return ONLY JSON: { "content": "full expanded markdown body" }

Article:
${content.slice(0, 6000)}`;
}

export function buildArticleContinuationPrompt(input: {
  title: string;
  existingContent: string;
  keywords: KeywordSet;
  minAdditionalWords: number;
}): string {
  return `Continue this article with NEW markdown sections only (${input.minAdditionalWords}+ words).

Title: ${input.title}
Primary keyword: "${input.keywords.primary}"

Do NOT repeat existing H2 headings. Add 2–4 new ## H2 sections with depth, lists, and examples.
No H1. No FAQ. Simple English.

Existing article (end):
${input.existingContent.slice(-2500)}

Return ONLY JSON:
{"content": "new ## sections to append"}`;
}

export const ARTICLE_MIN_WORDS = MIN_WORDS;
