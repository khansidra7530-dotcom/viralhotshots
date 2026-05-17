import type { Niche } from "@/generated/prisma/client";

const FALLBACK_BY_NICHE: Record<Niche, string> = {
  FINANCE: "https://images.unsplash.com/photo-1554224311-beee415c201f?w=1200&q=85",
  TECH: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=85",
  AI: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=85",
  HEALTH: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=85",
  GAMING: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=85",
  CRYPTO: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&q=85",
  BUSINESS: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=85",
  TRAVEL: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=85",
};

/** High-quality hero image from Unsplash API or curated fallback. */
export async function fetchHeroImageUrl(
  niche: Niche,
  topic: string
): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const query = `${topic} ${niche}`.replace(/_/g, " ").slice(0, 80);

  if (accessKey) {
    try {
      const params = new URLSearchParams({
        query,
        per_page: "1",
        orientation: "landscape",
        content_filter: "high",
      });
      const res = await fetch(
        `https://api.unsplash.com/search/photos?${params}`,
        {
          headers: { Authorization: `Client-ID ${accessKey}` },
          cache: "no-store",
        }
      );
      if (res.ok) {
        const data = (await res.json()) as {
          results?: { urls?: { regular?: string } }[];
        };
        const url = data.results?.[0]?.urls?.regular;
        if (url) return `${url}&w=1200&q=85`;
      }
    } catch {
      /* use fallback */
    }
  }

  return FALLBACK_BY_NICHE[niche] ?? FALLBACK_BY_NICHE.TECH;
}
