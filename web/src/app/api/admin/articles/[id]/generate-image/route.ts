import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-helpers";
import {
  fetchHeroImageUrl,
  getUsedImageFingerprintsExcept,
} from "@/lib/ai/hero-image";

const bodySchema = z.object({
  query: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = bodySchema.parse(await req.json().catch(() => ({})));
  const imageQuery =
    body.query?.trim() ||
    article.featuredImagePrompt?.trim() ||
    `${article.title} ${article.category.name}`.slice(0, 80);

  const excludeUrls = await getUsedImageFingerprintsExcept(id);
  const featuredImage = await fetchHeroImageUrl({
    niche: article.category.niche,
    query: imageQuery,
    uniqueSeed: `admin-${article.slug}-${Date.now()}`,
    excludeUrls,
  });

  return NextResponse.json({ featuredImage, featuredImagePrompt: imageQuery });
}
