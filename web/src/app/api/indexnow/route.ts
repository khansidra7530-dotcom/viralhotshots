import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyIndexNow } from "@/lib/indexnow";
import { SITE_URL } from "@/lib/constants";
import { absoluteUrl, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

function authorize(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;
  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;
  return req.nextUrl.searchParams.get("secret") === cronSecret;
}

/** Submit published URLs to IndexNow (Bing, Yandex, etc.). */
export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { urls?: string[]; all?: boolean };
  const base = SITE_URL.replace(/\/$/, "");

  let urls: string[] = [];

  if (body.urls?.length) {
    urls = body.urls.map((u) => (u.startsWith("http") ? u : absoluteUrl(u, SITE_URL)));
  } else if (body.all !== false) {
    const [articles, categories, authors] = await Promise.all([
      prisma.article.findMany({
        where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
        select: { slug: true },
      }),
      prisma.category.findMany({ select: { slug: true } }),
      prisma.user.findMany({
        where: { articles: { some: { status: "PUBLISHED" } } },
        select: { id: true, name: true },
      }),
    ]);

    const staticPaths = [
      "/",
      "/blog",
      "/categories",
      "/authors",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
      "/affiliate-disclosure",
    ];

    urls = [
      ...staticPaths.map((p) => `${base}${p === "/" ? "" : p}`),
      ...categories.map((c) => `${base}/category/${c.slug}`),
      ...authors.map((a) => `${base}/author/${slugify(a.name)}`),
      ...articles.map((a) => `${base}/blog/${a.slug}`),
    ];
  }

  const result = await notifyIndexNow(urls);

  return NextResponse.json({
    ...result,
    keyLocation: result.skipped?.includes("INDEXNOW_KEY") ? undefined : `${base}/indexnow-key.txt`,
    hint: result.skipped?.includes("INDEXNOW_KEY")
      ? "Set INDEXNOW_KEY in env, deploy, then retry."
      : undefined,
  });
}
