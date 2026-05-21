import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAiProviderLabel, isAiConfigured } from "@/lib/ai/client";
import { generateArticle } from "@/lib/ai/generate-article";
import {
  pickAllCategoriesInOrder,
  pickCategoryForCron,
  CRON_NICHE_ORDER,
} from "@/lib/ai/pick-category";
import { ARTICLE_MIN_WORDS } from "@/lib/ai/prompts";
import type { Niche } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorize(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  if (authHeader === `Bearer ${cronSecret}`) return true;
  const querySecret = req.nextUrl.searchParams.get("secret");
  return querySecret === cronSecret;
}

function parseForcedNiche(value: string | null): Niche | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  return CRON_NICHE_ORDER.includes(upper as Niche) ? (upper as Niche) : undefined;
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error:
          "GROQ_API_KEY is not configured on the server. Add it in Vercel (free key at console.groq.com), then redeploy.",
      },
      { status: 500 }
    );
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (settings && !settings.cronEnabled) {
    return NextResponse.json({ skipped: true, reason: "Cron disabled in admin settings" });
  }

  const publishAll = req.nextUrl.searchParams.get("all") === "1";
  const forcedNiche = parseForcedNiche(req.nextUrl.searchParams.get("niche"));

  try {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      return NextResponse.json({ error: "No admin user found. Run db:seed" }, { status: 500 });
    }

    const autoPublish = settings?.autoPublish ?? true;

    if (publishAll) {
      const picks = await pickAllCategoriesInOrder();
      const published: {
        niche: string;
        category: string;
        slug: string;
        title: string;
        status: string;
        wordCount: number;
        url: string;
      }[] = [];
      const errors: { niche: string; error: string }[] = [];

      for (const pick of picks) {
        try {
          const { article, wordCount } = await generateArticle({
            niche: pick.category.niche,
            categoryId: pick.category.id,
            categoryName: pick.category.name,
            authorId: admin.id,
            autoPublish,
          });
          published.push({
            niche: pick.niche,
            category: pick.category.name,
            slug: article.slug,
            title: article.title,
            status: article.status,
            wordCount,
            url: `/blog/${article.slug}`,
          });
          await prisma.cronLog.create({
            data: {
              job: "generate-article",
              status: "success",
              message: `[${pick.rotationLabel}] ${article.title} (${wordCount} words)`,
              articleId: article.id,
            },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          errors.push({ niche: pick.niche, error: message });
          await prisma.cronLog.create({
            data: {
              job: "generate-article",
              status: "error",
              message: `[${pick.rotationLabel}] ${message}`,
            },
          });
        }
      }

      return NextResponse.json({
        success: published.length > 0,
        mode: "all-niches",
        provider: getAiProviderLabel(),
        publishedCount: published.length,
        errorCount: errors.length,
        rotationOrder: CRON_NICHE_ORDER,
        published,
        errors,
      });
    }

    const pick = await pickCategoryForCron(forcedNiche);

    const { article, wordCount, newsHeadline } = await generateArticle({
      niche: pick.category.niche,
      categoryId: pick.category.id,
      categoryName: pick.category.name,
      authorId: admin.id,
      autoPublish,
    });

    await prisma.cronLog.create({
      data: {
        job: "generate-article",
        status: "success",
        message: `[${pick.rotationLabel}] ${article.title} (${wordCount} words)${newsHeadline ? ` · News: ${newsHeadline.slice(0, 60)}` : ""}`,
        articleId: article.id,
      },
    });

    return NextResponse.json({
      success: true,
      mode: "rotate",
      provider: getAiProviderLabel(),
      niche: pick.niche,
      category: pick.category.name,
      rotation: pick.rotationLabel,
      nextNiche:
        CRON_NICHE_ORDER[pick.rotationIndex % CRON_NICHE_ORDER.length] ??
        CRON_NICHE_ORDER[0],
      articleId: article.id,
      slug: article.slug,
      title: article.title,
      status: article.status,
      wordCount,
      minWords: ARTICLE_MIN_WORDS,
      newsHeadline,
      url: `/blog/${article.slug}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.cronLog.create({
      data: { job: "generate-article", status: "error", message },
    });
    return NextResponse.json(
      { error: message, provider: getAiProviderLabel() },
      { status: 500 }
    );
  }
}
