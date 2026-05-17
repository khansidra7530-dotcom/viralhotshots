import type { Niche } from "@/generated/prisma/client";

export function buildArticlePrompt(input: {
  niche: Niche;
  category: string;
  topic?: string;
  affiliateKeywords?: string[];
}): string {
  const topicLine = input.topic
    ? `Topic: ${input.topic}`
    : `Generate a timely, high-intent topic suitable for the ${input.niche} niche.`;

  return `You are an experienced journalist and subject-matter expert writing for a premium affiliate blog.

${topicLine}
Category: ${input.category}
Niche: ${input.niche}

Write a complete SEO article that follows Google EEAT (Experience, Expertise, Authoritativeness, Trustworthiness).

REQUIREMENTS:
- 1200–2500 words in natural, conversational English
- Human tone: vary sentence length, use transitions, storytelling where relevant
- NO keyword stuffing, NO robotic patterns, NO repetitive phrases
- Proper markdown: one H1 (# title), multiple H2 (##) and H3 (###)
- Short paragraphs (2–4 sentences)
- Include real-world context and plausible statistics (cite sources in references)
- Include semantic keywords naturally
- Add 2–3 natural CTA sections for affiliate intent (no hard sell)
- Include a product comparison table section if relevant to the topic
- End with a strong conclusion
- Adsense-safe: no prohibited content, no fake claims, no medical guarantees

Return ONLY valid JSON with this exact structure:
{
  "title": "string (50-65 chars ideal)",
  "metaDescription": "string (120-160 chars)",
  "slug": "url-friendly-slug",
  "excerpt": "2-3 sentence hook",
  "featuredImagePrompt": "detailed image prompt for hero",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "content": "full markdown article body WITHOUT the H1 title",
  "faq": [{"question": "...", "answer": "..."}],
  "sources": [{"title": "...", "url": "..."}],
  "internalLinkSuggestions": [{"anchor": "...", "topic": "..."}],
  "affiliateProducts": [{"name": "...", "price": "$...", "rating": 4.5, "url": "https://...", "badge": "Best Overall"}]
}

${input.affiliateKeywords?.length ? `Naturally mention these affiliate topics where relevant: ${input.affiliateKeywords.join(", ")}` : ""}`;
}
