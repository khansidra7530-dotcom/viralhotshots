import { prisma } from "@/lib/prisma";
import type { Niche } from "@/generated/prisma/client";
import type { RawTrendItem, ScoredTrend } from "@/lib/marketing/types";

const NICHE_KEYWORDS: Record<Niche, string[]> = {
  FINANCE: ["finance", "money", "invest", "stock", "crypto", "bank", "economy"],
  TECH: ["tech", "software", "ai", "app", "device", "startup", "code"],
  AI: ["ai", "chatgpt", "llm", "machine learning", "openai", "automation"],
  HEALTH: ["health", "fitness", "wellness", "diet", "mental", "medical"],
  GAMING: ["game", "gaming", "xbox", "playstation", "esports", "steam"],
  CRYPTO: ["crypto", "bitcoin", "ethereum", "blockchain", "web3", "defi"],
  BUSINESS: ["business", "startup", "marketing", "entrepreneur", "sales"],
  TRAVEL: ["travel", "flight", "hotel", "vacation", "tourism", "trip"],
};

function overlapScore(a: string, b: string): number {
  const wa = new Set(a.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
  const wb = new Set(b.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
  if (wa.size === 0 || wb.size === 0) return 0;
  let hits = 0;
  for (const w of wa) if (wb.has(w)) hits++;
  return hits / Math.max(wa.size, wb.size);
}

function detectNiche(text: string): Niche | undefined {
  const lower = text.toLowerCase();
  let best: { niche: Niche; score: number } | null = null;
  for (const [niche, words] of Object.entries(NICHE_KEYWORDS) as [Niche, string[]][]) {
    const score = words.filter((w) => lower.includes(w)).length;
    if (!best || score > best.score) best = { niche, score };
  }
  return best && best.score > 0 ? best.niche : undefined;
}

export async function scoreTrendItems(
  items: RawTrendItem[],
  options?: { niche?: Niche; limit?: number }
): Promise<ScoredTrend[]> {
  const recentTitles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { title: true, tags: true },
  });

  const titleMatches = recentTitles.map((a) => a.title);
  const tagSet = new Set(recentTitles.flatMap((a) => a.tags.map((t) => t.toLowerCase())));

  const scored: ScoredTrend[] = items.map((item) => {
    const text = `${item.title} ${item.summary ?? ""} ${item.keywords.join(" ")}`;
    const niche = item.niche ?? detectNiche(text) ?? options?.niche;

    let competitionHits = 0;
    for (const title of titleMatches) {
      if (overlapScore(item.title, title) >= 0.55) competitionHits += 2;
      else if (overlapScore(item.title, title) >= 0.35) competitionHits += 1;
    }
    for (const kw of item.keywords) {
      if (tagSet.has(kw.toLowerCase())) competitionHits += 0.5;
    }

    const competitionScore = Math.max(0, 10 - Math.min(10, competitionHits));
    const nicheBoost = niche && options?.niche && niche === options.niche ? 1.5 : 0;
    const overallScore =
      item.trafficScore * 0.35 +
      item.viralScore * 0.35 +
      competitionScore * 0.25 +
      nicheBoost;

    return {
      ...item,
      niche,
      competitionScore,
      overallScore,
    };
  });

  const unique: ScoredTrend[] = [];
  for (const item of scored.sort((a, b) => b.overallScore - a.overallScore)) {
    if (unique.some((u) => overlapScore(u.title, item.title) >= 0.65)) continue;
    unique.push(item);
  }

  return unique.slice(0, options?.limit ?? 30);
}
