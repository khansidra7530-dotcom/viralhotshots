import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateArticle } from "@/lib/ai/generate-article";
import type { Niche } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (settings && !settings.cronEnabled) {
    return NextResponse.json({ skipped: true, reason: "Cron disabled" });
  }

  try {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      return NextResponse.json({ error: "No admin user found" }, { status: 500 });
    }

    const niche = (settings?.defaultNiche ?? "TECH") as Niche;
    const category = await prisma.category.findFirst({
      where: { niche },
      orderBy: { updatedAt: "desc" },
    });

    if (!category) {
      return NextResponse.json({ error: "No category for niche" }, { status: 500 });
    }

    const article = await generateArticle({
      niche: category.niche,
      categoryId: category.id,
      categoryName: category.name,
      authorId: admin.id,
      autoPublish: settings?.autoPublish,
    });

    await prisma.cronLog.create({
      data: {
        job: "generate-article",
        status: "success",
        message: `Generated: ${article.title}`,
        articleId: article.id,
      },
    });

    return NextResponse.json({
      success: true,
      articleId: article.id,
      slug: article.slug,
      status: article.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.cronLog.create({
      data: { job: "generate-article", status: "error", message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
