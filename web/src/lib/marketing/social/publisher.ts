import { prisma } from "@/lib/prisma";
import type { SocialPost } from "@/generated/prisma/client";

async function publishToFacebook(content: string): Promise<string | null> {
  const pageId = process.env.FACEBOOK_PAGE_ID?.trim();
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
  if (!pageId || !token) return null;

  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: content, access_token: token }),
  });
  if (!res.ok) throw new Error(`Facebook API: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { id?: string };
  return data.id ?? null;
}

async function notifyN8n(post: SocialPost): Promise<void> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const webhook = settings?.n8nWebhookUrl?.trim() || process.env.N8N_WEBHOOK_URL?.trim();
  if (!webhook) return;

  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "social_post_due",
      platform: post.platform,
      content: post.content,
      threadParts: post.threadParts,
      articleId: post.articleId,
      postId: post.id,
      scheduledAt: post.scheduledAt,
    }),
  });
}

export async function publishDueSocialPosts(limit = 10): Promise<{
  published: number;
  failed: number;
  delegated: number;
}> {
  const due = await prisma.socialPost.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: new Date() },
    },
    orderBy: { scheduledAt: "asc" },
    take: limit,
  });

  let published = 0;
  let failed = 0;
  let delegated = 0;

  for (const post of due) {
    try {
      if (post.platform === "FACEBOOK") {
        const externalId = await publishToFacebook(post.content);
        if (externalId) {
          await prisma.socialPost.update({
            where: { id: post.id },
            data: { status: "PUBLISHED", publishedAt: new Date(), externalId },
          });
          if (post.articleId) {
            await prisma.article.update({
              where: { id: post.articleId },
              data: { facebookPostId: externalId },
            });
          }
          published++;
          continue;
        }
      }

      await notifyN8n(post);
      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          engagement: { delegatedTo: "n8n", platform: post.platform },
        },
      });
      delegated++;
    } catch (error) {
      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : String(error),
        },
      });
      failed++;
    }
  }

  return { published, failed, delegated };
}
