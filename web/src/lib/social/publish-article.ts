import { prisma } from "@/lib/prisma";
import { createFacebookPagePost, isFacebookPublishEnabled } from "@/lib/social/facebook";

export type PublishSocialResult = {
  facebook?: { ok: boolean; postId?: string; error?: string; skipped?: string };
};

/**
 * Post a newly published article to the Facebook Page (once per article).
 * Safe to call multiple times — skips if already posted or not configured.
 */
export async function publishArticleToSocial(
  articleId: string
): Promise<PublishSocialResult> {
  const result: PublishSocialResult = {};

  if (!isFacebookPublishEnabled()) {
    result.facebook = { ok: false, skipped: "Facebook not configured" };
    return result;
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { category: true },
  });

  if (!article) {
    result.facebook = { ok: false, error: "Article not found" };
    return result;
  }

  if (article.status !== "PUBLISHED") {
    result.facebook = { ok: false, skipped: "Article is not published" };
    return result;
  }

  if (article.facebookPostId) {
    result.facebook = { ok: true, postId: article.facebookPostId, skipped: "Already posted" };
    return result;
  }

  try {
    const { postId } = await createFacebookPagePost({
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      categoryName: article.category.name,
      tags: article.tags,
      featuredImage: article.featuredImage,
    });

    await prisma.article.update({
      where: { id: articleId },
      data: { facebookPostId: postId },
    });

    await prisma.analyticsEvent.create({
      data: {
        type: "facebook_post",
        path: `/blog/${article.slug}`,
        metadata: { postId, articleId, title: article.title },
      },
    });

    result.facebook = { ok: true, postId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Facebook post failed";
    result.facebook = { ok: false, error: message };
  }

  return result;
}

/** Fire-and-forget wrapper for API routes (logs errors, never throws). */
export function schedulePublishArticleToSocial(articleId: string): void {
  void publishArticleToSocial(articleId).then((res) => {
    if (res.facebook?.ok && res.facebook.postId && !res.facebook.skipped) {
      console.info(`[facebook] Posted article ${articleId} → ${res.facebook.postId}`);
    } else if (res.facebook?.error) {
      console.error(`[facebook] ${articleId}: ${res.facebook.error}`);
    }
  });
}
