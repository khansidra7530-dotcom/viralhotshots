import type { MetadataRoute } from "next";

/** Paths never useful for AI citation or search indexing. */
export const AEO_DISALLOW = ["/admin/", "/api/", "/account/", "/login", "/register", "/auth/"];

/**
 * AI crawlers that power real-time answers and citations (ChatGPT Search, Perplexity, etc.).
 * Explicit Allow rules signal intent and avoid accidental blocks from future default changes.
 */
export const AEO_SEARCH_CRAWLERS = [
  "OAI-SearchBot", // ChatGPT Search index (citations)
  "ChatGPT-User", // ChatGPT browsing shared links
  "GPTBot", // OpenAI crawler (search + training — allow for max AI visibility)
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended", // Gemini / AI Overviews eligibility
  "Applebot-Extended",
  "Amazonbot",
  "cohere-ai",
  "YouBot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
] as const;

/** Large-scale training scrapers with little citation benefit — blocked by default. */
export const AEO_BLOCKED_CRAWLERS = ["CCBot", "Bytespider", "ImagesiftBot", "Omgilibot"] as const;

export function buildAeoRobotsRules(): MetadataRoute.Robots["rules"] {
  const allowSearch = AEO_SEARCH_CRAWLERS.map((userAgent) => ({
    userAgent,
    allow: "/",
    disallow: AEO_DISALLOW,
  }));

  const blockScrapers = AEO_BLOCKED_CRAWLERS.map((userAgent) => ({
    userAgent,
    disallow: "/",
  }));

  return [
    { userAgent: "*", allow: "/", disallow: AEO_DISALLOW },
    ...allowSearch,
    ...blockScrapers,
  ];
}
