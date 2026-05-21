import type { Niche, TrendSource } from "@/generated/prisma/client";
import { fetchTrendingTopics } from "@/lib/ai/news";
import type { RawTrendItem } from "@/lib/marketing/types";

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; ViralHotshotsMarketing/1.0; +https://www.viralhotshots.com)",
  Accept: "application/json, application/rss+xml, application/xml, text/xml, */*",
};

const REDDIT_SUBS: Partial<Record<Niche, string[]>> = {
  FINANCE: ["personalfinance", "investing"],
  TECH: ["technology", "gadgets"],
  AI: ["artificial", "MachineLearning"],
  HEALTH: ["health", "Fitness"],
  GAMING: ["gaming", "Games"],
  CRYPTO: ["CryptoCurrency", "Bitcoin"],
  BUSINESS: ["Entrepreneur", "smallbusiness"],
  TRAVEL: ["travel", "solotravel"],
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchGoogleTrendItems(): Promise<RawTrendItem[]> {
  const topics = await fetchTrendingTopics(20);
  return topics.map((title, i) => ({
    query: title,
    title,
    source: "GOOGLE_TRENDS" as TrendSource,
    trafficScore: Math.max(1, 10 - i * 0.4),
    viralScore: Math.max(1, 8 - i * 0.3),
    keywords: title.toLowerCase().split(/\s+/).filter((w) => w.length > 3).slice(0, 8),
    metadata: { rank: i + 1 },
  }));
}

export async function fetchRedditTrends(niche?: Niche): Promise<RawTrendItem[]> {
  const subs = niche ? (REDDIT_SUBS[niche] ?? ["technology"]) : ["all"];
  const items: RawTrendItem[] = [];

  for (const sub of subs.slice(0, 2)) {
    const data = await fetchJson<{
      data?: { children?: { data?: { title?: string; score?: number; url?: string; selftext?: string } }[] };
    }>(`https://www.reddit.com/r/${sub}/hot.json?limit=15`);

    for (const child of data?.data?.children ?? []) {
      const post = child.data;
      if (!post?.title) continue;
      const score = post.score ?? 0;
      items.push({
        query: post.title,
        title: post.title,
        summary: post.selftext?.slice(0, 280),
        source: "REDDIT",
        niche,
        trafficScore: Math.min(10, Math.log10(score + 1) * 2.5),
        viralScore: Math.min(10, score / 500),
        keywords: post.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3).slice(0, 8),
        url: post.url,
        metadata: { subreddit: sub, score },
      });
    }
  }

  return items;
}

export async function fetchHackerNewsTrends(): Promise<RawTrendItem[]> {
  const ids = await fetchJson<number[]>("https://hacker-news.firebaseio.com/v0/topstories.json");
  if (!ids?.length) return [];

  const items: RawTrendItem[] = [];
  for (const id of ids.slice(0, 20)) {
    const story = await fetchJson<{
      title?: string;
      score?: number;
      url?: string;
      descendants?: number;
    }>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    if (!story?.title) continue;
    items.push({
      query: story.title,
      title: story.title,
      source: "HACKER_NEWS",
      trafficScore: Math.min(10, Math.log10((story.score ?? 0) + 1) * 2),
      viralScore: Math.min(10, (story.descendants ?? 0) / 100),
      keywords: story.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3).slice(0, 8),
      url: story.url,
      metadata: { hnId: id, score: story.score, comments: story.descendants },
    });
  }
  return items;
}

export async function fetchProductHuntTrends(): Promise<RawTrendItem[]> {
  const token = process.env.PRODUCT_HUNT_TOKEN?.trim();
  if (!token) return [];

  try {
    const res = await fetch("https://api.producthunt.com/v2/api/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{ posts(order: VOTES, first: 15) { edges { node { name tagline votesCount url } } } }`,
      }),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      data?: { posts?: { edges?: { node?: { name?: string; tagline?: string; votesCount?: number; url?: string } }[] } };
    };

    return (data.data?.posts?.edges ?? [])
      .map((edge) => edge.node)
      .filter((n): n is NonNullable<typeof n> => Boolean(n?.name))
      .map((node) => ({
        query: node.name!,
        title: node.name!,
        summary: node.tagline,
        source: "PRODUCT_HUNT" as TrendSource,
        trafficScore: Math.min(10, (node.votesCount ?? 0) / 50),
        viralScore: Math.min(10, (node.votesCount ?? 0) / 80),
        keywords: `${node.name} ${node.tagline ?? ""}`.toLowerCase().split(/\s+/).filter((w) => w.length > 3).slice(0, 8),
        url: node.url,
        metadata: { votes: node.votesCount },
      }));
  } catch {
    return [];
  }
}

/** X/Twitter trends require paid API — use n8n webhook or manual export when configured. */
export async function fetchTwitterTrendPlaceholders(): Promise<RawTrendItem[]> {
  const raw = process.env.TWITTER_TRENDS_JSON?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return parsed.slice(0, 10).map((title, i) => ({
      query: title,
      title,
      source: "TWITTER" as TrendSource,
      trafficScore: 7 - i * 0.3,
      viralScore: 8 - i * 0.4,
      keywords: title.toLowerCase().split(/\s+/).filter((w) => w.length > 2).slice(0, 6),
    }));
  } catch {
    return [];
  }
}

export async function fetchAllTrendSources(niche?: Niche): Promise<RawTrendItem[]> {
  const [google, reddit, hn, ph, twitter] = await Promise.all([
    fetchGoogleTrendItems(),
    fetchRedditTrends(niche),
    fetchHackerNewsTrends(),
    fetchProductHuntTrends(),
    fetchTwitterTrendPlaceholders(),
  ]);
  return [...google, ...reddit, ...hn, ...ph, ...twitter];
}
