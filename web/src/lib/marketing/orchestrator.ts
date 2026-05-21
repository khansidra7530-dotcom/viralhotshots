import { prisma } from "@/lib/prisma";
import { runTrendResearchAgent } from "@/lib/marketing/agents/trend-research-agent";
import { runWritingAgent } from "@/lib/marketing/agents/writing-agent";
import { runSocialMediaAgent } from "@/lib/marketing/agents/social-media-agent";
import { runAnalyticsAgent } from "@/lib/marketing/agents/analytics-agent";
import { runOptimizationAgent } from "@/lib/marketing/agents/optimization-agent";
import { publishDueSocialPosts } from "@/lib/marketing/social/publisher";
import { pickCategoryForCron } from "@/lib/ai/pick-category";
import type { MarketingDailyReport } from "@/lib/marketing/types";

async function getAdminAuthorId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!admin) throw new Error("No admin user found for article author");
  return admin.id;
}

/** Master daily pipeline — research → write → social → optimize → publish → analytics */
export async function runDailyMarketingPipeline(options?: {
  skipWrite?: boolean;
  skipOptimize?: boolean;
}): Promise<MarketingDailyReport> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (settings && !settings.marketingEnabled) {
    return {
      trendsFound: 0,
      articlesCreated: 0,
      socialPostsCreated: 0,
      socialPostsPublished: 0,
      articlesOptimized: 0,
      errors: ["Marketing automation disabled in settings"],
    };
  }

  const report: MarketingDailyReport = {
    trendsFound: 0,
    articlesCreated: 0,
    socialPostsCreated: 0,
    socialPostsPublished: 0,
    articlesOptimized: 0,
    errors: [],
  };

  const research = await runTrendResearchAgent({ limit: 25 });
  if (research.ok && research.data) {
    report.trendsFound = research.data.trends.length;
    report.researchRunId = research.data.runId;
  } else if (research.error) {
    report.errors.push(`Trend research: ${research.error}`);
  }

  if (!options?.skipWrite && settings?.cronEnabled !== false) {
    try {
      const pick = await pickCategoryForCron();
      const authorId = await getAdminAuthorId();
      const topTrendDb = research.data?.runId
        ? await prisma.trendCandidate.findFirst({
            where: { researchRunId: research.data.runId, articleId: null },
            orderBy: { overallScore: "desc" },
          })
        : null;

      const writing = await runWritingAgent({
        niche: pick.category.niche,
        categoryId: pick.category.id,
        categoryName: pick.category.name,
        authorId,
        autoPublish: settings?.autoPublish ?? true,
        topic: topTrendDb?.title,
        trendCandidateId: topTrendDb?.id,
      });

      if (writing.ok && writing.data) {
        report.articlesCreated = 1;
        await prisma.cronLog.create({
          data: {
            job: "marketing_writing",
            status: "success",
            message: `Created ${writing.data.slug}`,
            articleId: writing.data.articleId,
          },
        });

        if (settings?.autoSocialEnabled !== false) {
          const social = await runSocialMediaAgent({
            articleId: writing.data.articleId,
            settingsModel: settings?.aiModel,
            settingsPreferred: settings?.preferredLlm,
          });
          if (social.ok && social.data) {
            report.socialPostsCreated = social.data.postIds.length;
          } else if (social.error) {
            report.errors.push(`Social generation: ${social.error}`);
          }
        }
      } else if (writing.error) {
        report.errors.push(`Writing: ${writing.error}`);
      }
    } catch (error) {
      report.errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (settings?.autoSocialEnabled !== false) {
    const pub = await publishDueSocialPosts(15);
    report.socialPostsPublished = pub.published + pub.delegated;
    if (pub.failed > 0) report.errors.push(`${pub.failed} social posts failed`);
  }

  if (!options?.skipOptimize && settings?.autoOptimizeEnabled !== false) {
    const opt = await runOptimizationAgent({
      limit: 2,
      settingsModel: settings?.aiModel,
      settingsPreferred: settings?.preferredLlm,
    });
    if (opt.ok && opt.data) {
      report.articlesOptimized = opt.data.optimized.length;
    } else if (opt.error) {
      report.errors.push(`Optimization: ${opt.error}`);
    }
  }

  await runAnalyticsAgent();

  await prisma.cronLog.create({
    data: {
      job: "marketing_daily",
      status: report.errors.length ? "partial" : "success",
      message: JSON.stringify(report),
    },
  });

  return report;
}

export async function queueSocialForArticle(articleId: string): Promise<void> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (settings?.autoSocialEnabled === false) return;
  await runSocialMediaAgent({
    articleId,
    settingsModel: settings?.aiModel,
    settingsPreferred: settings?.preferredLlm,
  });
}
