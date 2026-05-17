import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAiProviderLabel, isAiConfigured } from "@/lib/ai/client";
import { generateArticle } from "@/lib/ai/generate-article";
import { pickCategoryForCron } from "@/lib/ai/pick-category";
import { ARTICLE_MIN_WORDS } from "@/lib/ai/prompts";

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

  try {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      return NextResponse.json({ error: "No admin user found. Run db:seed" }, { status: 500 });
    }

    const category = await pickCategoryForCron();

    const { article, wordCount, newsHeadline } = await generateArticle({
      niche: category.niche,
      categoryId: category.id,
      categoryName: category.name,
      authorId: admin.id,
      autoPublish: settings?.autoPublish ?? true,
    });

    await prisma.cronLog.create({
      data: {
        job: "generate-article",
        status: "success",
        message: `Published: ${article.title} (${wordCount} words)${newsHeadline ? ` · News: ${newsHeadline.slice(0, 80)}` : ""}`,
        articleId: article.id,
      },
    });

    return NextResponse.json({
      success: true,
      provider: getAiProviderLabel(),
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
