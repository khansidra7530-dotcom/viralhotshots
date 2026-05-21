import { prisma } from "@/lib/prisma";
import { callMarketingLlm } from "@/lib/marketing/llm/router";
import { parseModelJson } from "@/lib/ai/json-parse";
import { absoluteUrl } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import type { AgentResult, SocialPostDraft } from "@/lib/marketing/types";
import type { SocialPlatform } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";

const PLATFORMS: SocialPlatform[] = ["TWITTER", "THREADS", "LINKEDIN", "REDDIT", "FACEBOOK"];

type GeneratedSocial = {
  twitter: string;
  threads: string[];
  linkedin: string;
  reddit: string;
  facebook: string;
};

export async function generateSocialContent(input: {
  title: string;
  excerpt: string;
  slug: string;
  categoryName: string;
  settingsModel?: string | null;
  settingsPreferred?: string | null;
}): Promise<SocialPostDraft[]> {
  const url = absoluteUrl(`/blog/${input.slug}`);
  const system = `You write viral but authentic social copy for ${SITE_NAME}. Human tone, no hashtag spam. Return JSON only.`;
  const user = `Article: "${input.title}"
Category: ${input.categoryName}
Excerpt: ${input.excerpt}
URL: ${url}

Return:
{
  "twitter": "max 260 chars with hook + URL",
  "threads": ["tweet 1/3", "tweet 2/3", "tweet 3/3"],
  "linkedin": "professional 2-3 sentences + URL",
  "reddit": "community-friendly title + 2 sentence summary (no URL in body)",
  "facebook": "engaging caption with emoji sparingly + URL"
}`;

  const { text } = await callMarketingLlm(system, user, {
    settingsModel: input.settingsModel,
    settingsPreferred: input.settingsPreferred,
    jsonMode: true,
  });
  const parsed = parseModelJson<GeneratedSocial>(text);

  const now = Date.now();
  return [
    { platform: "TWITTER", content: parsed.twitter, scheduledAt: new Date(now + 30 * 60_000) },
    {
      platform: "THREADS",
      content: parsed.threads?.[0] ?? parsed.twitter,
      threadParts: parsed.threads ?? [parsed.twitter],
      scheduledAt: new Date(now + 60 * 60_000),
    },
    { platform: "LINKEDIN", content: parsed.linkedin, scheduledAt: new Date(now + 90 * 60_000) },
    { platform: "REDDIT", content: parsed.reddit, scheduledAt: new Date(now + 120 * 60_000) },
    { platform: "FACEBOOK", content: parsed.facebook, scheduledAt: new Date(now + 150 * 60_000) },
  ];
}

export async function runSocialMediaAgent(input: {
  articleId: string;
  settingsModel?: string | null;
  settingsPreferred?: string | null;
}): Promise<AgentResult<{ postIds: string[] }>> {
  const started = Date.now();
  try {
    const article = await prisma.article.findUnique({
      where: { id: input.articleId },
      include: { category: true, socialPosts: { select: { platform: true } } },
    });
    if (!article) throw new Error("Article not found");

    const existing = new Set(article.socialPosts.map((p) => p.platform));
    const missingPlatforms = PLATFORMS.filter((p) => !existing.has(p));
    if (missingPlatforms.length === 0) {
      return { agent: "social_media", ok: true, data: { postIds: [] }, durationMs: Date.now() - started };
    }

    const drafts = await generateSocialContent({
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      categoryName: article.category.name,
      settingsModel: input.settingsModel,
      settingsPreferred: input.settingsPreferred,
    });

    const postIds: string[] = [];
    for (const draft of drafts.filter((d) => missingPlatforms.includes(d.platform))) {
      const post = await prisma.socialPost.create({
        data: {
          articleId: article.id,
          platform: draft.platform,
          content: draft.content,
          threadParts: (draft.threadParts ?? undefined) as Prisma.InputJsonValue | undefined,
          status: "SCHEDULED",
          scheduledAt: draft.scheduledAt ?? new Date(),
        },
      });
      postIds.push(post.id);
    }

    return { agent: "social_media", ok: true, data: { postIds }, durationMs: Date.now() - started };
  } catch (error) {
    return {
      agent: "social_media",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - started,
    };
  }
}
