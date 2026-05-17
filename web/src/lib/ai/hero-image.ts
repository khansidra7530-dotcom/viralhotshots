import { prisma } from "@/lib/prisma";
import type { Niche } from "@/generated/prisma/client";

/** Curated Unsplash URLs — multiple per niche so posts look distinct without an API key. */
const IMAGE_POOL: Record<Niche, string[]> = {
  FINANCE: [
    "https://images.unsplash.com/photo-1554224311-beee415c201f?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1579532537597-ef9e9f2f56a2?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=900&h=560&fit=crop&q=80",
  ],
  TECH: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&h=560&fit=crop&q=80",
  ],
  AI: [
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507146420279-ebb435aee3be?w=900&h=560&fit=crop&q=80",
  ],
  HEALTH: [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1574680096145-d05b474e2471?w=900&h=560&fit=crop&q=80",
  ],
  GAMING: [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1493711662062-fa541f3f6a96?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552820728-8b83bb6b2b5a?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1612287230202-1ff1d85c1f7d?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1538481199705-c710c4e213fc?w=900&h=560&fit=crop&q=80",
  ],
  CRYPTO: [
    "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1605792657660-596900e92f02?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1621414052290-748a200c02d8?w=900&h=560&fit=crop&q=80",
  ],
  BUSINESS: [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&h=560&fit=crop&q=80",
  ],
  TRAVEL: [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1501785888041-af9efcd6c3a4?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&h=560&fit=crop&q=80",
    "https://images.unsplash.com/photo-1432404753668-4b6049c9e4d0?w=900&h=560&fit=crop&q=80",
  ],
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function getRecentFeaturedImageUrls(limit = 40): Promise<Set<string>> {
  const rows = await prisma.article.findMany({
    where: { featuredImage: { not: null } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { featuredImage: true },
  });
  return new Set(
    rows.map((r) => r.featuredImage).filter((u): u is string => Boolean(u))
  );
}

function pickFromPool(
  pool: string[],
  seed: string,
  exclude: Set<string>
): string {
  const start = hashString(seed) % pool.length;
  for (let i = 0; i < pool.length; i++) {
    const url = pool[(start + i) % pool.length];
    if (!exclude.has(url)) return url;
  }
  return `${pool[start]}&sig=${hashString(seed)}`;
}

/** Unique hero image per article — Unsplash search with rotation, or curated pool. */
export async function fetchHeroImageUrl(input: {
  niche: Niche;
  query: string;
  uniqueSeed: string;
  excludeUrls?: Set<string>;
}): Promise<string> {
  const exclude = input.excludeUrls ?? new Set<string>();
  const pool = IMAGE_POOL[input.niche] ?? IMAGE_POOL.TECH;
  const searchQuery = input.query.replace(/_/g, " ").trim().slice(0, 80);
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (accessKey && searchQuery.length > 2) {
    try {
      const page = (hashString(input.uniqueSeed) % 5) + 1;
      const params = new URLSearchParams({
        query: searchQuery,
        per_page: "15",
        page: String(page),
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
          results?: { urls?: { regular?: string }; id?: string }[];
        };
        const results = data.results ?? [];
        if (results.length > 0) {
          const start = hashString(input.uniqueSeed) % results.length;
          for (let i = 0; i < results.length; i++) {
            const photo = results[(start + i) % results.length];
            const url = photo?.urls?.regular;
            if (url) {
              const full = `${url.split("?")[0]}?w=900&h=560&fit=crop&q=80`;
              if (!exclude.has(full)) return full;
            }
          }
        }
      }
    } catch {
      /* fall through to pool */
    }
  }

  return pickFromPool(pool, `${input.niche}-${input.uniqueSeed}-${searchQuery}`, exclude);
}
