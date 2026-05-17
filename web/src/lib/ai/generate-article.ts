/** AI article generation disabled — deploy-only mode. */
import type { Niche } from "@/generated/prisma/client";

export type GeneratedArticle = {
  title: string;
  metaDescription: string;
  slug: string;
  excerpt: string;
  featuredImagePrompt: string;
  tags: string[];
  content: string;
  faq: { question: string; answer: string }[];
  sources: { title: string; url: string }[];
  internalLinkSuggestions: { anchor: string; topic: string }[];
  affiliateProducts?: {
    name: string;
    price?: string;
    rating?: number;
    url: string;
    badge?: string;
  }[];
};

export async function generateArticle(_input: {
  niche: Niche;
  categoryId: string;
  categoryName: string;
  authorId: string;
  topic?: string;
  autoPublish?: boolean;
}): Promise<never> {
  throw new Error("AI article generation is disabled.");
}

/*
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { buildArticlePrompt } from "@/lib/ai/prompts";
import { slugify, estimateReadingTime } from "@/lib/utils";
import { calculateSeoScore } from "@/lib/seo";
import { comparisonTableMarkdown } from "@/lib/affiliate";
import type { Prisma } from "@/generated/prisma/client";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateArticle(input: {
  niche: Niche;
  categoryId: string;
  categoryName: string;
  authorId: string;
  topic?: string;
  autoPublish?: boolean;
}) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const model = settings?.openaiModel ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const affiliates = await prisma.affiliateLink.findMany({
    where: { isActive: true, OR: [{ niche: input.niche }, { niche: null }] },
    take: 5,
  });

  const prompt = buildArticlePrompt({
    niche: input.niche,
    category: input.categoryName,
    topic: input.topic,
    affiliateKeywords: affiliates.map((a) => a.name),
  });

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a senior content strategist. Output only valid JSON, no markdown fences.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.85,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty AI response");

  const parsed = JSON.parse(raw) as GeneratedArticle;

  let content = parsed.content.trim();
  if (parsed.affiliateProducts?.length) {
    content += comparisonTableMarkdown(parsed.affiliateProducts);
  }

  content += "\n\n## References\n\n";
  for (const source of parsed.sources ?? []) {
    content += `- [${source.title}](${source.url})\n`;
  }

  const baseSlug = slugify(parsed.slug || parsed.title);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const seoScore = calculateSeoScore({
    title: parsed.title,
    metaDescription: parsed.metaDescription,
    content,
    slug,
    tags: parsed.tags ?? [],
    hasFeaturedImage: Boolean(parsed.featuredImagePrompt),
    hasFaq: (parsed.faq?.length ?? 0) > 0,
    hasSources: (parsed.sources?.length ?? 0) > 0,
  });

  const shouldPublish = input.autoPublish ?? settings?.autoPublish ?? false;
  const status = shouldPublish ? "PUBLISHED" : "PENDING";

  const article = await prisma.article.create({
    data: {
      title: parsed.title,
      slug,
      excerpt: parsed.excerpt,
      content,
      metaDescription: parsed.metaDescription,
      featuredImagePrompt: parsed.featuredImagePrompt,
      tags: parsed.tags ?? [],
      faq: parsed.faq as Prisma.InputJsonValue,
      sources: parsed.sources as Prisma.InputJsonValue,
      internalLinks: parsed.internalLinkSuggestions as Prisma.InputJsonValue,
      affiliateBlocks: (parsed.affiliateProducts ?? []) as Prisma.InputJsonValue,
      readingTimeMinutes: estimateReadingTime(content),
      seoScore,
      status,
      publishedAt: shouldPublish ? new Date() : null,
      isAiGenerated: true,
      categoryId: input.categoryId,
      authorId: input.authorId,
    },
  });

  return article;
}
*/
