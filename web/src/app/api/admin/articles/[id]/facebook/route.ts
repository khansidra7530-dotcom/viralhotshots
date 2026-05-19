import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { publishArticleToSocial } from "@/lib/social/publish-article";

/** Manually post (or retry) Facebook share for a published article. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (article.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Article must be published first" }, { status: 400 });
  }

  if (article.facebookPostId) {
    await prisma.article.update({
      where: { id },
      data: { facebookPostId: null },
    });
  }

  const social = await publishArticleToSocial(id);
  return NextResponse.json(social);
}
