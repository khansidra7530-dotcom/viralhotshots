import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const [articles, categories, authors] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: now } },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { articles: { some: { status: "PUBLISHED", publishedAt: { lte: now } } } },
      select: { name: true, updatedAt: true },
    }),
  ]);

  const staticPages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] }[] = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/blog", priority: 0.9, changeFrequency: "daily" },
    { path: "/categories", priority: 0.85, changeFrequency: "weekly" },
    { path: "/authors", priority: 0.7, changeFrequency: "weekly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/affiliate-disclosure", priority: 0.3, changeFrequency: "yearly" },
  ];

  return [
    ...staticPages.map(({ path, priority, changeFrequency }) => ({
      url: `${base}${path || "/"}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...categories.map((c) => ({
      url: `${base}/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...authors.map((a) => ({
      url: `${base}/author/${slugify(a.name)}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
    ...articles.map((a) => ({
      url: `${base}/blog/${a.slug}`,
      lastModified: a.publishedAt ?? a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
