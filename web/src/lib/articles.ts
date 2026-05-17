import { prisma } from "@/lib/prisma";
import type { ArticleStatus } from "@/generated/prisma/client";

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
