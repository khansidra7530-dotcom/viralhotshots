import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateSeoScore } from "@/lib/seo";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED", "SCHEDULED"]).optional(),
  excerpt: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const seoScore = calculateSeoScore({
    title,
    metaDescription,
    content,
    slug: existing.slug,
    tags: existing.tags,
    hasFeaturedImage: Boolean(existing.featuredImage),
    hasFaq: Boolean(existing.faq),
    hasSources: Boolean(existing.sources),
  });

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

  return NextResponse.json(article);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
