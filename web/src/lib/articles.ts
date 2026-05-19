import { prisma } from "@/lib/prisma";
import type { ArticleStatus } from "@/generated/prisma/client";

function searchRelevanceScore(
  article: { title: string; excerpt: string; content: string; category: { name: string } },
  query: string
): number {
  const q = query.toLowerCase().trim();
  const title = article.title.toLowerCase();
  const excerpt = article.excerpt.toLowerCase();
  const category = article.category.name.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  let score = 0;
  if (title.includes(q)) score += 20;
  if (title === q) score += 30;
  if (excerpt.includes(q)) score += 8;
  if (category.includes(q)) score += 12;

  for (const word of words) {
    if (title.includes(word)) score += 6;
    if (category.includes(word)) score += 5;
    if (excerpt.includes(word)) score += 2;
  }

  return score;
}

export async function searchPublishedArticles(query: string, limit = 24) {
  const q = query.trim();
  if (!q) return [];

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    include: {
      category: true,
      author: { select: { id: true, name: true, avatar: true, bio: true } },
    },
    take: 80,
  });

  return articles
    .map((article) => ({ article, score: searchRelevanceScore(article, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article }) => article);
}

export async function getPublishedArticles(options?: {
  limit?: number;
  categorySlug?: string;
  search?: string;
  skip?: number;
}) {
  const where = {
    status: "PUBLISHED" as ArticleStatus,
    publishedAt: { lte: new Date() },
    ...(options?.categorySlug && {
      category: { slug: options.categorySlug },
    }),
    ...(options?.search && {
      OR: [
        { title: { contains: options.search, mode: "insensitive" as const } },
        { excerpt: { contains: options.search, mode: "insensitive" as const } },
        { content: { contains: options.search, mode: "insensitive" as const } },
      ],
    }),
  };

  return prisma.article.findMany({
    where,
    include: {
      category: true,
      author: { select: { id: true, name: true, avatar: true, bio: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: options?.limit ?? 12,
    skip: options?.skip ?? 0,
  });
}

export async function getTrendingArticles(limit = 5) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { gte: weekAgo },
    },
    include: {
      category: true,
      author: { select: { name: true, avatar: true } },
    },
    orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
}

export async function getRelatedArticles(articleId: string, categoryId: string, limit = 4) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      categoryId,
      id: { not: articleId },
    },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function incrementViewCount(articleId: string) {
  await prisma.article.update({
    where: { id: articleId },
    data: { viewCount: { increment: 1 } },
  });
}
