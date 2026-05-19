import { prisma } from "@/lib/prisma";
import type { Niche } from "@/generated/prisma/client";

export type NewsBrief = {
  headline: string;
  summary: string;
  sources: { title: string; url: string }[];
};

const NICHE_QUERIES: Record<Niche, string> = {
  FINANCE: "personal finance OR investing news",
  TECH: "technology news latest",
  AI: "artificial intelligence news",
  HEALTH: "health wellness news",
  GAMING: "gaming industry news",
  CRYPTO: "cryptocurrency news",
  BUSINESS: "business startup news",
  TRAVEL: "travel news destinations",
};

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function parseRssItems(xml: string): { title: string; link: string; description: string }[] {
  const items: { title: string; link: string; description: string }[] = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  for (const block of blocks.slice(0, 12)) {
    const title = stripHtml(block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const link = stripHtml(block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? "");
    const description = stripHtml(
      block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ?? ""
    );
    if (title && link.startsWith("http")) {
      items.push({ title, link, description });
    }
  }
  return items;
}

/** Fetch recent headlines — rotates story so cron posts do not repeat the same angle. */
export async function fetchNewsBrief(
  niche: Niche,
  categoryName: string
): Promise<NewsBrief | null> {
  const query = `${NICHE_QUERIES[niche]} ${categoryName}`.trim();
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ViralHotshots/1.0 (content bot)" },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const xml = await res.text();
    const items = parseRssItems(xml);
    if (items.length === 0) return null;

    const recentCount = await prisma.article.count({
      where: { category: { niche } },
    });
    const lead = items[recentCount % items.length];

    const sources = items.slice(0, 3).map((item) => ({
      title: item.title.replace(/ - .*$/, "").slice(0, 80),
      url: item.link,
    }));

    return {
      headline: lead.title.replace(/ - .*$/, "").slice(0, 200),
      summary: lead.description.slice(0, 400) || lead.title,
      sources,
    };
  } catch {
    return null;
  }
}
