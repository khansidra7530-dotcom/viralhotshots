import type { Niche } from "@/generated/prisma/client";
import { imageFingerprint } from "@/lib/image-utils";

export type NewsImageSource = {
  title: string;
  url: string;
  imageUrl?: string | null;
};

export type NewsImageContext = {
  headline: string;
  summary?: string;
  trendingQuery?: string;
  sources?: NewsImageSource[];
};

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; ViralHotshots/1.0; +https://www.viralhotshots.com)",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "for", "to", "in", "on", "of", "is", "are",
  "was", "were", "be", "at", "by", "with", "from", "as", "it", "this", "that",
  "how", "what", "why", "when", "who", "new", "latest", "today", "2024", "2025", "2026",
  "says", "after", "over", "into", "about", "amid",
]);

function significantWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/** Build ordered Unsplash/search queries from news context — most specific first. */
export function buildNewsImageSearchQueries(input: {
  news?: NewsImageContext | null;
  niche: Niche;
  categoryName?: string;
  aiQuery?: string;
  title?: string;
}): string[] {
  const seen = new Set<string>();
  const add = (raw: string | undefined | null) => {
    const q = raw?.replace(/_/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
    if (!q || q.length < 3) return;
    const key = q.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    queries.push(q);
  };

  const queries: string[] = [];
  const news = input.news;

  add(news?.headline);
  add(news?.trendingQuery);
  add(input.aiQuery);

  if (news?.headline) {
    const words = significantWords(news.headline).slice(0, 5).join(" ");
    add(words ? `${input.niche.toLowerCase()} ${words}` : undefined);
  }

  add(input.title ? `${input.title} ${input.categoryName ?? ""}`.trim() : undefined);
  add(input.categoryName ? `${input.niche.toLowerCase()} ${input.categoryName} news` : undefined);

  return queries;
}

function isLikelyHeroImage(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const lower = parsed.pathname.toLowerCase();
    if (lower.endsWith(".svg") || lower.endsWith(".gif")) return false;
    const full = url.toLowerCase();
    if (
      full.includes("favicon") ||
      full.includes("/icon") ||
      full.includes("avatar") ||
      full.includes("1x1") ||
      full.includes("pixel.gif") ||
      full.includes("spacer")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function decodeHtmlEntities(url: string): string {
  return url.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function normalizeImageUrl(raw: string, pageUrl?: string): string | null {
  const trimmed = decodeHtmlEntities(raw.trim());
  if (!trimmed) return null;

  try {
    if (trimmed.startsWith("//")) {
      return normalizeImageUrl(`https:${trimmed}`, pageUrl);
    }
    if (trimmed.startsWith("/") && pageUrl) {
      return normalizeImageUrl(new URL(trimmed, pageUrl).href, pageUrl);
    }
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

function extractMetaImage(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

async function fetchOgImageFromPage(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, {
      headers: FETCH_HEADERS,
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.startsWith("image/")) {
      return normalizeImageUrl(res.url);
    }

    const html = await res.text();
    const meta = extractMetaImage(html);
    return meta ? normalizeImageUrl(meta, res.url) : null;
  } catch {
    return null;
  }
}

function isUsed(url: string, used: Set<string>): boolean {
  return used.has(imageFingerprint(url));
}

/** Try RSS thumbnails first, then og:image from publisher pages. */
export async function fetchNewsRelatedImage(
  sources: NewsImageSource[] | undefined,
  used: Set<string>
): Promise<string | null> {
  if (!sources?.length) return null;

  for (const source of sources.slice(0, 4)) {
    if (source.imageUrl) {
      const normalized = normalizeImageUrl(source.imageUrl, source.url);
      if (
        normalized &&
        isLikelyHeroImage(normalized) &&
        !isUsed(normalized, used)
      ) {
        return normalized;
      }
    }
  }

  for (const source of sources.slice(0, 3)) {
    const og = await fetchOgImageFromPage(source.url);
    if (og && isLikelyHeroImage(og) && !isUsed(og, used)) {
      return og;
    }
  }

  return null;
}
