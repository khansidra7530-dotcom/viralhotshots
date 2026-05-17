import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: articleId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const likeCount = await prisma.articleLike.count({ where: { articleId } });

  if (!userId) {
    return NextResponse.json({ liked: false, subscribed: false, likeCount });
  }

  const [liked, subscribed] = await Promise.all([
    prisma.articleLike.findUnique({
      where: { userId_articleId: { userId, articleId } },
    }),
    prisma.articleSubscription.findUnique({
      where: { userId_articleId: { userId, articleId } },
    }),
  ]);

  return NextResponse.json({
    liked: Boolean(liked),
    subscribed: Boolean(subscribed),
    likeCount,
  });
}
