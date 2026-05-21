import { prisma } from "@/lib/prisma";
import { runSeoAgent } from "@/lib/marketing/agents/seo-agent";
import { callMarketingLlm } from "@/lib/marketing/llm/router";
import { scheduleIndexNow, articleIndexNowUrl } from "@/lib/indexnow";
import { ensureBodyMatchesTitle } from "@/lib/seo";
import type { AgentResult } from "@/lib/marketing/types";

export async function runOptimizationAgent(options?: {
  limit?: number;
  settingsModel?: string | null;
  settingsPreferred?: string | null;
}): Promise<AgentResult<{ optimized: string[] }>> {
  const started = Date.now();
  const limit = options?.limit ?? 3;
  const optimized: string[] = [];

  try {
    const weekAgo = new Date(Date.now() - 7 * 86400_000);
    const candidates = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { seoScore: { lt: 75 } },
          { updatedAt: { lt: weekAgo } },
          { lastOptimizedAt: null },
        ],
      },
      orderBy: [{ seoScore: "asc" }, { viewCount: "desc" }],
      take: limit,
    });

    for (const article of candidates) {
      const run = await prisma.articleOptimizationRun.create({
        data: {
          articleId: article.id,
          agentType: "optimization",
          beforeScore: article.seoScore,
          status: "RUNNING",
        },
      });

      try {
        const seo = await runSeoAgent({
          title: article.title,
          metaDescription: article.metaDescription,
          content: article.content,
          tags: article.tags,
          primaryKeyword: article.primaryKeyword ?? undefined,
          settingsModel: options?.settingsModel,
          settingsPreferred: options?.settingsPreferred,
        });

        let content = article.content;
        const metrics = await prisma.articleMetricDaily.findMany({
          where: { articleId: article.id },
          orderBy: { date: "desc" },
          take: 7,
        });
        const viewsDropped =
          metrics.length >= 2 && metrics[0].views < metrics[metrics.length - 1].views * 0.7;

        if (viewsDropped || article.seoScore < 70) {
          const { text } = await callMarketingLlm(
            `You update blog articles with fresh stats, examples, and clearer EEAT signals. Return JSON: { "introAddendum": string, "updatedStats": string[] }`,
            `Article title: ${article.title}\nExcerpt: ${article.excerpt}\nContent start: ${article.content.slice(0, 1500)}\nAdd a short 2026 freshness update.`,
            { settingsModel: options?.settingsModel, settingsPreferred: options?.settingsPreferred, jsonMode: true }
          );
          const parsed = JSON.parse(text) as { introAddendum?: string; updatedStats?: string[] };
          const addendum = parsed.introAddendum?.trim();
          if (addendum) {
            content = `> **Updated ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}:** ${addendum}\n\n${content}`;
          }
          if (parsed.updatedStats?.length) {
            content += `\n\n### Latest numbers\n${parsed.updatedStats.map((s) => `- ${s}`).join("\n")}`;
          }
        }

        content = ensureBodyMatchesTitle(
          seo.data?.title ?? article.title,
          article.excerpt,
          content
        );

        await prisma.article.update({
          where: { id: article.id },
          data: {
            title: seo.data?.title ?? article.title,
            metaDescription: seo.data?.metaDescription ?? article.metaDescription,
            tags: seo.data?.tags ?? article.tags,
            primaryKeyword: seo.data?.primaryKeyword ?? article.primaryKeyword,
            content,
            seoScore: seo.data?.seoScore ?? article.seoScore,
            lastOptimizedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        await prisma.articleOptimizationRun.update({
          where: { id: run.id },
          data: {
            status: "COMPLETED",
            afterScore: seo.data?.seoScore ?? article.seoScore,
            changes: {
              seoSuggestions: seo.data?.suggestions ?? [],
              viewsDropped,
            },
          },
        });

        scheduleIndexNow([articleIndexNowUrl(article.slug)]);
        optimized.push(article.id);
      } catch (err) {
        await prisma.articleOptimizationRun.update({
          where: { id: run.id },
          data: {
            status: "FAILED",
            error: err instanceof Error ? err.message : String(err),
          },
        });
      }
    }

    return { agent: "optimization", ok: true, data: { optimized }, durationMs: Date.now() - started };
  } catch (error) {
    return {
      agent: "optimization",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - started,
    };
  }
}
