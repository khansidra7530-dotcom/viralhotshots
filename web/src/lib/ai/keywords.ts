import type { Niche } from "@/generated/prisma/client";

export type KeywordSet = {
  primary: string;
  secondary: string[];
};

/** High-volume search phrases per niche (used in title, meta, and H2s). */
const NICHE_PRIMARY: Record<Niche, string[]> = {
  FINANCE: [
    "personal finance tips",
    "save money",
    "budget planning",
    "investing for beginners",
    "credit score",
  ],
  TECH: [
    "best tech gadgets",
    "smartphone review",
    "laptop buying guide",
    "tech news",
    "apps worth trying",
  ],
  AI: [
    "AI tools",
    "ChatGPT tips",
    "artificial intelligence",
    "AI for work",
    "machine learning basics",
  ],
  HEALTH: [
    "healthy habits",
    "wellness tips",
    "fitness at home",
    "mental health",
    "nutrition guide",
  ],
  GAMING: [
    "best games",
    "gaming setup",
    "PC gaming",
    "console games",
    "esports news",
  ],
  CRYPTO: [
    "cryptocurrency news",
    "Bitcoin guide",
    "crypto investing",
    "blockchain explained",
    "altcoins",
  ],
  BUSINESS: [
    "small business tips",
    "startup advice",
    "side hustle ideas",
    "entrepreneurship",
    "marketing strategy",
  ],
  TRAVEL: [
    "travel tips",
    "cheap flights",
    "best destinations",
    "travel planning",
    "vacation ideas",
  ],
};

const SECONDARY_BY_NICHE: Record<Niche, string[]> = {
  FINANCE: ["money", "savings", "debt", "retirement", "financial planning"],
  TECH: ["software", "devices", "innovation", "security", "productivity"],
  AI: ["automation", "productivity", "prompts", "free tools", "future of work"],
  HEALTH: ["exercise", "diet", "sleep", "stress", "weight loss"],
  GAMING: ["Steam", "PlayStation", "Xbox", "Nintendo", "multiplayer"],
  CRYPTO: ["Ethereum", "wallet", "DeFi", "NFT", "market trends"],
  BUSINESS: ["revenue", "customers", "growth", "remote work", "freelance"],
  TRAVEL: ["hotels", "backpacking", "Europe", "Asia", "road trip"],
};

function hashPick<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return items[Math.abs(h) % items.length];
}

function wordsFromHeadline(headline: string): string {
  const cleaned = headline
    .replace(/ - .*$/, "")
    .replace(/[^\w\s]/g, " ")
    .toLowerCase();
  const stop = new Set(["the", "a", "an", "and", "or", "for", "to", "in", "on", "of", "is", "are"]);
  const words = cleaned.split(/\s+/).filter((w) => w.length > 2 && !stop.has(w));
  return words.slice(0, 4).join(" ");
}

export function buildKeywordSet(input: {
  niche: Niche;
  categoryName: string;
  titleSeed?: string;
  newsHeadline?: string | null;
}): KeywordSet {
  const pool = NICHE_PRIMARY[input.niche];
  const fromNews = input.newsHeadline ? wordsFromHeadline(input.newsHeadline) : "";
  const primary =
    (fromNews.length >= 4 ? fromNews : null) ??
    hashPick(pool, `${input.niche}-${input.categoryName}-${input.titleSeed ?? "x"}`);

  const secondary = [
    ...new Set([
      ...SECONDARY_BY_NICHE[input.niche].slice(0, 3),
      input.categoryName.toLowerCase(),
      ...primary.split(" ").filter((w) => w.length > 3),
    ]),
  ].slice(0, 6);

  return { primary, secondary };
}

function containsPhrase(text: string, phrase: string): boolean {
  return text.toLowerCase().includes(phrase.toLowerCase());
}

/** Ensure primary keyword appears in title, meta, and multiple H2 headings. */
export function applyKeywordsToArticle(input: {
  title: string;
  metaDescription: string;
  content: string;
  keywords: KeywordSet;
}): { title: string; metaDescription: string; content: string } {
  const { primary, secondary } = input.keywords;
  let title = input.title.trim();
  let meta = input.metaDescription.trim();
  let content = input.content.trim();

  // Do not rewrite the visible title — it must match the on-page H1.
  if (!containsPhrase(meta, primary)) {
    meta = `${primary} — ${meta}`;
    if (meta.length > 160) meta = `${meta.slice(0, 157)}…`;
  }

  const h2Matches = content.match(/^## .+$/gm) ?? [];
  const h2WithKeyword = h2Matches.filter((h) => containsPhrase(h, primary)).length;

  if (h2WithKeyword < 2 && h2Matches.length > 0) {
    const lines = content.split("\n");
    let injected = 0;
    for (let i = 0; i < lines.length && injected < 2; i++) {
      if (lines[i].startsWith("## ") && !containsPhrase(lines[i], primary)) {
        const heading = lines[i].replace(/^## /, "").trim();
        const alt = secondary[injected % secondary.length];
        lines[i] = `## ${heading}: ${primary} and ${alt}`;
        injected++;
      }
    }
    content = lines.join("\n");
  }

  if (h2Matches.length === 0) {
    content = `## ${primary} basics\n\n${content}`;
  }

  const firstChunk = content.slice(0, 400);
  if (!containsPhrase(firstChunk, primary)) {
    content = `If you are searching for **${primary}**, this guide explains it in plain English.\n\n${content}`;
  }

  return { title, metaDescription: meta, content };
}
