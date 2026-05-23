import { prisma } from "@/lib/prisma";
import type { Niche } from "@/generated/prisma/client";

export type NewsBrief = {
  headline: string;
  summary: string;
  sources: { title: string; url: string; imageUrl?: string }[];
  trendingQuery?: string;
  traffic?: string;
  matchedFrom?: "google_trends" | "google_news_section" | "google_news_search";
  relatedTrends?: string[];
};

type NewsCandidate = {
  headline: string;
  summary: string;
  sources: { title: string; url: string; imageUrl?: string }[];
  trendingQuery: string;
  traffic?: string;
  matchedFrom: NewsBrief["matchedFrom"];
  score: number;
};

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; ViralHotshots/1.0; +https://www.viralhotshots.com)",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};

const NICHE_NEWS_SECTION: Partial<Record<Niche, string>> = {
  FINANCE: "BUSINESS",
  TECH: "TECHNOLOGY",
  AI: "TECHNOLOGY",
  HEALTH: "HEALTH",
  GAMING: "ENTERTAINMENT",
  CRYPTO: "BUSINESS",
  BUSINESS: "BUSINESS",
  TRAVEL: "WORLD",
};

const NICHE_SEARCH_QUERIES: Record<Niche, string[]> = {
  FINANCE: [
    "personal finance OR investing OR stock market when:1d",
    "economy OR inflation OR federal reserve when:1d",
  ],
  TECH: [
    "technology OR gadgets OR smartphone when:1d",
    "Apple OR Google OR Microsoft OR Nvidia when:1d",
  ],
  AI: [
    "artificial intelligence OR ChatGPT OR OpenAI when:1d",
    "AI tools OR machine learning when:1d",
  ],
  HEALTH: [
    "health OR wellness OR fitness when:1d",
    "mental health OR nutrition when:1d",
  ],
  GAMING: [
    "video games OR gaming OR PlayStation OR Xbox when:1d",
    "esports OR Steam when:1d",
  ],
  CRYPTO: [
    "cryptocurrency OR Bitcoin OR Ethereum when:1d",
    "crypto market OR blockchain when:1d",
  ],
  BUSINESS: [
    "business OR startup OR entrepreneur when:1d",
    "marketing OR side hustle when:1d",
  ],
  TRAVEL: [
    "travel OR tourism OR vacation destinations when:1d",
    "flights OR hotels OR travel deals when:1d",
  ],
};

const NICHE_KEYWORDS: Record<Niche, string[]> = {
  FINANCE: [
    "finance", "money", "invest", "stock", "market", "bank", "budget", "savings",
    "inflation", "economy", "tax", "credit", "loan", "retirement", "fed",
  ],
  TECH: [
    "tech", "technology", "software", "hardware", "gadget", "phone", "laptop",
    "apple", "google", "microsoft", "nvidia", "chip", "cyber", "app", "device",
  ],
  AI: [
    "ai", "artificial intelligence", "chatgpt", "openai", "machine learning",
    "llm", "gemini", "copilot", "automation", "robot", "neural",
  ],
  HEALTH: [
    "health", "wellness", "fitness", "medical", "doctor", "diet", "nutrition",
    "mental", "exercise", "sleep", "weight", "virus", "cancer", "heart",
  ],
  GAMING: [
    "game", "gaming", "xbox", "playstation", "nintendo", "steam", "esports",
    "console", "pc gaming", "fortnite", "call of duty",
  ],
  CRYPTO: [
    "crypto", "bitcoin", "ethereum", "blockchain", "nft", "defi", "token",
    "coinbase", "binance", "wallet", "altcoin",
  ],
  BUSINESS: [
    "business", "startup", "entrepreneur", "company", "ceo", "marketing",
    "revenue", "hiring", "layoff", "ipo", "small business",
  ],
  TRAVEL: [
    "travel", "flight", "hotel", "vacation", "destination", "tourism", "airline",
    "cruise", "passport", "trip", "resort", "airport",
  ],
};

function stripHtml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(title: string): string {
  return title.replace(/ - .*$/, "").replace(/\s+/g, " ").trim();
}

function significantWords(text: string): Set<string> {
  const stop = new Set([
    "the", "a", "an", "and", "or", "for", "to", "in", "on", "of", "is", "are",
    "was", "were", "be", "at", "by", "with", "from", "as", "it", "this", "that",
    "how", "what", "why", "when", "who", "new", "latest", "today", "2024", "2025", "2026",
  ]);
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stop.has(w))
  );
}

function overlapScore(a: string, b: string): number {
  const wa = significantWords(a);
  const wb = significantWords(b);
  if (wa.size === 0 || wb.size === 0) return 0;
  let shared = 0;
  for (const w of wa) {
    if (wb.has(w)) shared++;
  }
  return shared / Math.min(wa.size, wb.size);
}

function isTooSimilarToRecent(headline: string, recentTitles: string[]): boolean {
  const clean = normalizeTitle(headline);
  return recentTitles.some((t) => overlapScore(clean, t) >= 0.55);
}

function scoreForNiche(text: string, niche: Niche): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of NICHE_KEYWORDS[niche]) {
    if (lower.includes(kw)) score += kw.includes(" ") ? 3 : 1;
  }
  return score;
}

function parseTraffic(block: string): string | undefined {
  return block.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/i)?.[1]?.trim();
}

function parseTrendItems(xml: string): NewsCandidate[] {
  const items: NewsCandidate[] = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

  for (const block of blocks.slice(0, 25)) {
    const query = stripHtml(block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const traffic = parseTraffic(block);
    if (!query) continue;

    const newsBlocks = block.match(/<ht:news_item>[\s\S]*?<\/ht:news_item>/gi) ?? [];
    const sources: { title: string; url: string }[] = [];

    for (const nb of newsBlocks.slice(0, 3)) {
      const title = stripHtml(
        nb.match(/<ht:news_item_title>([\s\S]*?)<\/ht:news_item_title>/i)?.[1] ?? ""
      );
      const url = stripHtml(
        nb.match(/<ht:news_item_url>([\s\S]*?)<\/ht:news_item_url>/i)?.[1] ?? ""
      );
      if (title && url.startsWith("http")) {
        sources.push({ title: title.slice(0, 120), url });
      }
    }

    const headline = sources[0]?.title ?? query;
    items.push({
      headline: normalizeTitle(headline).slice(0, 200),
      summary: sources[0]?.title ?? query,
      sources,
      trendingQuery: query,
      traffic,
      matchedFrom: "google_trends",
      score: 0,
    });
  }

  return items;
}

function extractRssImageUrl(block: string): string | undefined {
  const media =
    block.match(/<media:content[^>]+url=["']([^"']+)["']/i)?.[1] ??
    block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)?.[1] ??
    block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image/i)?.[1] ??
    block.match(/<enclosure[^>]+type=["']image[^"']*["'][^>]+url=["']([^"']+)["']/i)?.[1];

  if (media?.startsWith("http")) return media;

  const descImg = block.match(/<description>[\s\S]*?<img[^>]+src=["']([^"']+)["']/i)?.[1];
  if (descImg?.startsWith("http")) return descImg;

  return undefined;
}

function parseRssItems(xml: string): {
  title: string;
  link: string;
  description: string;
  imageUrl?: string;
}[] {
  const items: {
    title: string;
    link: string;
    description: string;
    imageUrl?: string;
  }[] = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  for (const block of blocks.slice(0, 20)) {
    const title = stripHtml(block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const link = stripHtml(block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? "");
    const description = stripHtml(
      block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ?? ""
    );
    const imageUrl = extractRssImageUrl(block);
    if (title && link.startsWith("http")) {
      items.push({ title, link, description, imageUrl });
    }
  }
  return items;
}

async function fetchRss(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS, cache: "no-store" });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchGoogleTrends(): Promise<NewsCandidate[]> {
  const xml = await fetchRss("https://trends.google.com/trending/rss?geo=US");
  if (!xml) return [];
  return parseTrendItems(xml);
}

async function fetchGoogleNewsSection(niche: Niche): Promise<NewsCandidate[]> {
  const section = NICHE_NEWS_SECTION[niche];
  if (!section) return [];

  const url = `https://news.google.com/rss/headlines/section/topic/${section}?hl=en-US&gl=US&ceid=US:en`;
  const xml = await fetchRss(url);
  if (!xml) return [];

  return parseRssItems(xml).map((item, i) => ({
    headline: normalizeTitle(item.title).slice(0, 200),
    summary: item.description.slice(0, 400) || item.title,
    sources: [{
      title: normalizeTitle(item.title).slice(0, 120),
      url: item.link,
      imageUrl: item.imageUrl,
    }],
    trendingQuery: normalizeTitle(item.title),
    matchedFrom: "google_news_section" as const,
    score: 0,
    traffic: i < 3 ? "top story" : undefined,
  }));
}

async function fetchGoogleNewsSearch(niche: Niche, categoryName: string): Promise<NewsCandidate[]> {
  const queries = NICHE_SEARCH_QUERIES[niche] ?? [];
  const candidates: NewsCandidate[] = [];

  for (const q of queries.slice(0, 2)) {
    const query = `${q} ${categoryName}`.trim();
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const xml = await fetchRss(url);
    if (!xml) continue;

    for (const item of parseRssItems(xml).slice(0, 8)) {
      candidates.push({
        headline: normalizeTitle(item.title).slice(0, 200),
        summary: item.description.slice(0, 400) || item.title,
        sources: [{
          title: normalizeTitle(item.title).slice(0, 120),
          url: item.link,
          imageUrl: item.imageUrl,
        }],
        trendingQuery: normalizeTitle(item.title),
        matchedFrom: "google_news_search",
        score: 0,
      });
    }
  }

  return candidates;
}

function rankCandidates(
  candidates: NewsCandidate[],
  niche: Niche,
  recentTitles: string[],
  options?: { minScore?: number }
): NewsCandidate[] {
  const minScore = options?.minScore ?? 1;
  const scored = candidates
    .map((c) => {
      const text = `${c.trendingQuery} ${c.headline} ${c.summary}`;
      const nicheScore = scoreForNiche(text, niche);
      const trafficBoost =
        c.traffic?.includes("+") ?
          Math.min(5, Math.log10(parseInt(c.traffic.replace(/\D/g, ""), 10) || 1))
        : c.traffic === "top story" ? 2 : 0;
      const sourceBoost =
        c.matchedFrom === "google_trends" ? 3
        : c.matchedFrom === "google_news_section" ? 2
        : 1;

      return {
        ...c,
        score: nicheScore + trafficBoost + sourceBoost,
      };
    })
    .filter((c) => c.score >= minScore)
    .filter((c) => !isTooSimilarToRecent(c.headline, recentTitles))
    .sort((a, b) => b.score - a.score);

  const unique: NewsCandidate[] = [];
  for (const c of scored) {
    if (unique.some((u) => overlapScore(u.headline, c.headline) >= 0.7)) continue;
    unique.push(c);
  }

  return unique;
}

async function getRecentTitles(niche: Niche): Promise<string[]> {
  const rows = await prisma.article.findMany({
    where: { category: { niche } },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { title: true },
  });
  return rows.map((r) => r.title);
}

export async function fetchNewsBrief(
  niche: Niche,
  categoryName: string
): Promise<NewsBrief | null> {
  const [trends, sectionNews, searchNews, recentTitles] = await Promise.all([
    fetchGoogleTrends(),
    fetchGoogleNewsSection(niche),
    fetchGoogleNewsSearch(niche, categoryName),
    getRecentTitles(niche),
  ]);

  const allCandidates = [...trends, ...sectionNews, ...searchNews];
  let ranked = rankCandidates(allCandidates, niche, recentTitles);

  if (ranked.length === 0) {
    ranked = rankCandidates([...sectionNews, ...searchNews], niche, recentTitles, {
      minScore: 0,
    });
  }

  if (ranked.length === 0) return null;

  const pick = ranked[0];
  const relatedTrends = ranked.slice(1, 6).map((c) => c.headline);

  const sourcesMap = new Map<string, { title: string; url: string; imageUrl?: string }>();
  for (const c of ranked.slice(0, 5)) {
    for (const s of c.sources) {
      if (!sourcesMap.has(s.url)) sourcesMap.set(s.url, s);
    }
  }

  return {
    headline: pick.headline,
    summary: pick.summary,
    sources: [...sourcesMap.values()].slice(0, 6),
    trendingQuery: pick.trendingQuery,
    traffic: pick.traffic,
    matchedFrom: pick.matchedFrom,
    relatedTrends,
  };
}

export async function fetchTrendingTopics(limit = 15): Promise<string[]> {
  const trends = await fetchGoogleTrends();
  return trends.slice(0, limit).map((t) => t.trendingQuery);
}
