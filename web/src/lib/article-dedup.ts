import { prisma } from "@/lib/prisma";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleWordSet(title: string): Set<string> {
  return new Set(
    normalizeTitle(title)
      .split(" ")
      .filter((w) => w.length > 2)
  );
}

/** Jaccard similarity on significant words (0–1). */
export function titleSimilarity(a: string, b: string): number {
  const setA = titleWordSet(a);
  const setB = titleWordSet(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

const DUPLICATE_THRESHOLD = 0.55;

/** Returns an existing article if the title is too similar to a published/pending one in the same category. */
export async function findSimilarArticle(title: string, categoryId: string) {
  const candidates = await prisma.article.findMany({
    where: {
      categoryId,
      status: { in: ["PUBLISHED", "PENDING", "SCHEDULED"] },
    },
    select: { id: true, title: true, slug: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 40,
  });

  let best: (typeof candidates)[0] | null = null;
  let bestScore = 0;

  for (const article of candidates) {
    const score = titleSimilarity(title, article.title);
    if (score > bestScore && score >= DUPLICATE_THRESHOLD) {
      bestScore = score;
      best = article;
    }
  }

  return best ? { article: best, score: bestScore } : null;
}
