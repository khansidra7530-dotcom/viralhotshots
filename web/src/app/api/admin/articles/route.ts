import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-helpers";
import { calculateSeoScore } from "@/lib/seo";
import { estimateReadingTime, slugify } from "@/lib/utils";

const createSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(10),
  metaDescription: z.string().min(10).max(160),
  content: z.string().min(50),
  categoryId: z.string(),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
});

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdminApi();
  if (error) return error;

  const body = await req.json();
  const data = createSchema.parse(body);

  let slug = slugify(data.title);
  let suffix = 1;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${slugify(data.title)}-${suffix++}`;
  }

  const seoScore = calculateSeoScore({
    title: data.title,
    metaDescription: data.metaDescription,
    content: data.content,
    slug,
    tags: [],
    hasFeaturedImage: false,
    hasFaq: false,
    hasSources: false,
  });

  const published = data.status === "PUBLISHED";
  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      metaDescription: data.metaDescription,
      tags: [],
      seoScore,
      readingTimeMinutes: estimateReadingTime(data.content),
      status: data.status,
      publishedAt: published ? new Date() : null,
      categoryId: data.categoryId,
      authorId: session!.user!.id!,
    },
  });

  return NextResponse.json(article, { status: 201 });
}
