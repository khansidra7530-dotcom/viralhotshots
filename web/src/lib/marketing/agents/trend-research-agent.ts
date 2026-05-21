import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { Niche } from "@/generated/prisma/client";
import { fetchAllTrendSources } from "@/lib/marketing/trends/sources";
import { scoreTrendItems } from "@/lib/marketing/trends/scorer";
import type { AgentResult, ScoredTrend } from "@/lib/marketing/types";

export async function runTrendResearchAgent(options?: {
  niche?: Niche;
  limit?: number;
}): Promise<AgentResult<{ runId: string; trends: ScoredTrend[] }>> {
  const started = Date.now();
  const run = await prisma.marketingResearchRun.create({
    data: { agentType: "trend_research", status: "RUNNING" },
  });

  try {
    const raw = await fetchAllTrendSources(options?.niche);
    const trends = await scoreTrendItems(raw, {
      niche: options?.niche,
      limit: options?.limit ?? 25,
    });

    if (trends.length > 0) {
      await prisma.trendCandidate.createMany({
        data: trends.map((t) => ({
          researchRunId: run.id,
          query: t.query,
          title: t.title,
          summary: t.summary,
          source: t.source,
          niche: t.niche,
          trafficScore: t.trafficScore,
          competitionScore: t.competitionScore,
          viralScore: t.viralScore,
          overallScore: t.overallScore,
          keywords: t.keywords,
          metadata: (t.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        })),
      });
    }

    const highTraffic = trends.filter((t) => t.trafficScore >= 5).length;
    const lowCompetition = trends.filter((t) => t.competitionScore >= 6).length;
    const viral = trends.filter((t) => t.viralScore >= 5).length;

    await prisma.marketingResearchRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        summary: {
          total: trends.length,
          highTraffic,
          lowCompetition,
          viral,
          top: trends.slice(0, 5).map((t) => ({
            title: t.title,
            source: t.source,
            score: t.overallScore,
          })),
        },
      },
    });

    return {
      agent: "trend_research",
      ok: true,
      data: { runId: run.id, trends },
      durationMs: Date.now() - started,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.marketingResearchRun.update({
      where: { id: run.id },
      data: { status: "FAILED", error: message, completedAt: new Date() },
    });
    return { agent: "trend_research", ok: false, error: message, durationMs: Date.now() - started };
  }
}

export async function getTopUnusedTrend(limit = 1) {
  return prisma.trendCandidate.findMany({
    where: { articleId: null },
    orderBy: { overallScore: "desc" },
    take: limit,
  });
}
