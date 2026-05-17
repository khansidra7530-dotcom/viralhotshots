import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id: articleId } = await params;
  const { error, session } = await requireAuthApi();
  if (error) return error;

  const userId = session!.user!.id!;
  const article = await prisma.article.findFirst({
    where: { id: articleId, status: "PUBLISHED" },
  });
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const existing = await prisma.articleSubscription.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existing) {
    await prisma.articleSubscription.delete({ where: { id: existing.id } });
    return NextResponse.json({ subscribed: false });
  }

  await prisma.articleSubscription.create({ data: { userId, articleId } });
  return NextResponse.json({ subscribed: true });
}
