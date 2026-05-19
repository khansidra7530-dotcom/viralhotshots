import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-helpers";
import { calculateSeoScore } from "@/lib/seo";
import { publishArticleToSocial } from "@/lib/social/publish-article";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED", "SCHEDULED"]).optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().url().nullable().optional(),
  featuredImagePrompt: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const data = updateSchema.parse(body);

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const content = data.content ?? existing.content;
  const title = data.title ?? existing.title;
  const metaDescription = data.metaDescription ?? existing.metaDescription;

  const featuredImage =
    data.featuredImage !== undefined ? data.featuredImage : existing.featuredImage;

  const seoScore = calculateSeoScore({
    title,
    metaDescription,
    content,
    slug: existing.slug,
    tags: existing.tags,
    hasFeaturedImage: Boolean(featuredImage),
    hasFaq: Boolean(existing.faq),
    hasSources: Boolean(existing.sources),
  });

  const newlyPublished =
    data.status === "PUBLISHED" && existing.status !== "PUBLISHED";

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...data,
      seoScore,
      publishedAt:
        data.status === "PUBLISHED" && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
    },
  });

  const social = newlyPublished ? await publishArticleToSocial(article.id) : undefined;

  return NextResponse.json({ ...article, social });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
