import { prisma } from "@/lib/prisma";
import { generateArticle } from "@/lib/ai/generate-article";
import { getTopUnusedTrend } from "@/lib/marketing/agents/trend-research-agent";
import type { AgentResult } from "@/lib/marketing/types";
import type { Niche } from "@/generated/prisma/client";

export async function runWritingAgent(input: {
  niche?: Niche;
  categoryId: string;
  categoryName: string;
  authorId: string;
  autoPublish?: boolean;
  trendCandidateId?: string;
  topic?: string;
}): Promise<
  AgentResult<{ articleId: string; slug: string; wordCount: number; trendCandidateId?: string }>
> {
  const started = Date.now();
  try {
    let topic = input.topic;
    let trendCandidateId = input.trendCandidateId;

    if (!topic) {
      const trends = input.trendCandidateId
        ? await prisma.trendCandidate.findMany({ where: { id: input.trendCandidateId }, take: 1 })
        : await getTopUnusedTrend(1);
      const pick = trends[0];
      if (pick) {
        topic = pick.title;
        trendCandidateId = pick.id;
      }
    }

    const { article, wordCount } = await generateArticle({
      niche: input.niche!,
      categoryId: input.categoryId,
      categoryName: input.categoryName,
      authorId: input.authorId,
      autoPublish: input.autoPublish,
      topic,
    });

    if (trendCandidateId) {
      await prisma.trendCandidate.update({
        where: { id: trendCandidateId },
        data: { articleId: article.id },
      });
    }

    if (article.tags[0]) {
      await prisma.article.update({
        where: { id: article.id },
        data: { primaryKeyword: article.tags[0] },
      });
    }

    return {
      agent: "writing",
      ok: true,
      data: {
        articleId: article.id,
        slug: article.slug,
        wordCount,
        trendCandidateId,
      },
      durationMs: Date.now() - started,
    };
  } catch (error) {
    return {
      agent: "writing",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - started,
    };
  }
}
