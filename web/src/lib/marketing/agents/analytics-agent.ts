import { prisma } from "@/lib/prisma";
import type { AgentResult } from "@/lib/marketing/types";

export type AnalyticsSnapshot = {
  totalViews: number;
  totalArticles: number;
  publishedArticles: number;
  avgSeoScore: number;
  topArticles: { id: string; title: string; slug: string; views: number; seoScore: number }[];
  socialScheduled: number;
  socialPublished: number;
  socialFailed: number;
  trendCandidates: number;
  recentEvents: number;
};

export async function runAnalyticsAgent(): Promise<AgentResult<AnalyticsSnapshot>> {
  const started = Date.now();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      articles,
      publishedCount,
      socialCounts,
      trendCount,
      eventCount,
    ] = await Promise.all([
      prisma.article.findMany({
        select: { id: true, title: true, slug: true, viewCount: true, seoScore: true, likes: { select: { id: true } } },
        orderBy: { viewCount: "desc" },
        take: 100,
      }),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.socialPost.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.trendCandidate.count({ where: { articleId: null } }),
      prisma.analyticsEvent.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400_000) } } }),
    ]);

    for (const article of articles) {
      await prisma.articleMetricDaily.upsert({
        where: { articleId_date: { articleId: article.id, date: today } },
        create: {
          articleId: article.id,
          date: today,
          views: article.viewCount,
          likes: article.likes.length,
          seoScore: article.seoScore,
        },
        update: {
          views: article.viewCount,
          likes: article.likes.length,
          seoScore: article.seoScore,
        },
      });
    }

    const totalViews = articles.reduce((sum, a) => sum + a.viewCount, 0);
    const avgSeoScore =
      articles.length > 0
        ? Math.round(articles.reduce((sum, a) => sum + a.seoScore, 0) / articles.length)
        : 0;

    const socialMap = Object.fromEntries(
      socialCounts.map((s) => [s.status, s._count._all])
    ) as Record<string, number>;

    return {
      agent: "analytics",
      ok: true,
      data: {
        totalViews,
        totalArticles: articles.length,
        publishedArticles: publishedCount,
        avgSeoScore,
        topArticles: articles.slice(0, 10).map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          views: a.viewCount,
          seoScore: a.seoScore,
        })),
        socialScheduled: socialMap.SCHEDULED ?? 0,
        socialPublished: socialMap.PUBLISHED ?? 0,
        socialFailed: socialMap.FAILED ?? 0,
        trendCandidates: trendCount,
        recentEvents: eventCount,
      },
      durationMs: Date.now() - started,
    };
  } catch (error) {
    return {
      agent: "analytics",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - started,
    };
  }
}

export async function getMarketingDashboardData(): Promise<AnalyticsSnapshot> {
  const result = await runAnalyticsAgent();
  if (!result.ok || !result.data) {
    throw new Error(result.error ?? "Analytics agent failed");
  }
  return result.data;
}
