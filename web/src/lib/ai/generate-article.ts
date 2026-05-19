import { prisma } from "@/lib/prisma";
import {
  callAiModel,
  getGroqModel,
  getGroqBodyModel,
  groqPause,
  GROQ_META_MAX_OUTPUT,
  GROQ_SAFE_MAX_OUTPUT,
} from "@/lib/ai/client";
import { parseModelJson } from "@/lib/ai/json-parse";
import {
  ARTICLE_MIN_WORDS,
  buildArticleBodyPrompt,
  buildArticlePrompt,
  buildExpandPrompt,
} from "@/lib/ai/prompts";
import { fetchNewsBrief } from "@/lib/ai/news";
import { fetchHeroImageUrl, getUsedImageFingerprints } from "@/lib/ai/hero-image";
import { applyKeywordsToArticle, buildKeywordSet } from "@/lib/ai/keywords";
import { findSimilarArticle } from "@/lib/article-dedup";
import {
  sanitizeAffiliateProducts,
  sanitizeArticleContent,
} from "@/lib/sanitize-content";
import { slugify, estimateReadingTime, countWords, stripMarkdownCodeFence } from "@/lib/utils";
import { calculateSeoScore, normalizeMetaDescription } from "@/lib/seo";
import { comparisonTableMarkdown, buildAmazonUrl } from "@/lib/affiliate";
import type { Niche } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";

export type GeneratedArticleMeta = {
  title: string;
  metaDescription: string;
  slug: string;
  excerpt: string;
  featuredImageSearchQuery?: string;
  tags: string[];
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

export type GeneratedArticlePayload = GeneratedArticleMeta & { content: string };

function mergeAffiliateUrls(
  products: GeneratedArticlePayload["affiliateProducts"],
  dbLinks: { name: string; url: string; asin: string | null; network: string }[],
  amazonTag?: string | null
) {
  if (!products?.length) return products;
  return products.map((p) => {
    const match = dbLinks.find(
      (l) => l.name.toLowerCase() === p.name.toLowerCase()
    );
    if (match) {
      const url =
        match.network === "amazon" && match.asin
          ? buildAmazonUrl(match.asin, amazonTag ?? undefined)
          : match.url;
      return { ...p, url };
    }
    return p;
  });
}

export async function generateArticle(input: {
  niche: Niche;
  categoryId: string;
  categoryName: string;
  authorId: string;
  topic?: string;
  autoPublish?: boolean;
}) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const model = getGroqModel(settings?.aiModel);

  const [news, recentArticles, usedImages] = await Promise.all([
    fetchNewsBrief(input.niche, input.categoryName),
    prisma.article.findMany({
      where: { categoryId: input.categoryId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true },
    }),
    getUsedImageFingerprints(),
  ]);

  const affiliates = await prisma.affiliateLink.findMany({
    where: { isActive: true, OR: [{ niche: input.niche }, { niche: null }] },
    take: 8,
  });

  const keywords = buildKeywordSet({
    niche: input.niche,
    categoryName: input.categoryName,
    newsHeadline: news?.headline,
  });

  const prompt = buildArticlePrompt({
    niche: input.niche,
    category: input.categoryName,
    topic: input.topic,
    news,
    affiliateKeywords: affiliates.map((a) => a.name),
    siteName: settings?.siteName,
    recentTitles: recentArticles.map((a) => a.title),
    keywords,
  });

  const metaRaw = await callAiModel(
    model,
    "Output only valid JSON. Simple English.",
    prompt,
    { maxTokens: GROQ_META_MAX_OUTPUT }
  );
  const meta = parseModelJson<GeneratedArticleMeta>(metaRaw);

  const duplicate = await findSimilarArticle(meta.title, input.categoryId);
  if (duplicate) {
    throw new Error(
      `Skipped duplicate topic (${Math.round(duplicate.score * 100)}% similar to "${duplicate.article.title}"): /blog/${duplicate.article.slug}`
    );
  }

  const bodyPrompt = buildArticleBodyPrompt({
    title: meta.title,
    excerpt: meta.excerpt,
    niche: input.niche,
    category: input.categoryName,
    keywords,
    news,
  });

  await groqPause(2500);

  const bodyModel = getGroqBodyModel();
  const bodyRaw = await callAiModel(
    bodyModel,
    "Output only valid JSON: {\"content\":\"markdown\"}. Simple English.",
    bodyPrompt,
    { maxTokens: GROQ_SAFE_MAX_OUTPUT }
  );
  const body = parseModelJson<{ content: string }>(bodyRaw);

  const parsed: GeneratedArticlePayload = {
    ...meta,
    content: body.content ?? "",
  };

  const optimized = applyKeywordsToArticle({
    title: parsed.title,
    metaDescription: parsed.metaDescription,
    content: parsed.content.trim(),
    keywords,
  });
  parsed.title = optimized.title;
  parsed.metaDescription = normalizeMetaDescription(optimized.metaDescription);

  let content = sanitizeArticleContent(stripMarkdownCodeFence(optimized.content));

  if (countWords(content) < ARTICLE_MIN_WORDS) {
    await groqPause(2000);
    const expandRaw = await callAiModel(
      getGroqBodyModel(),
      "Expand article. Output only valid JSON.",
      buildExpandPrompt(content, ARTICLE_MIN_WORDS),
      { maxTokens: GROQ_SAFE_MAX_OUTPUT }
    );
    const expanded = parseModelJson<{ content: string }>(expandRaw);
    if (expanded.content && countWords(expanded.content) >= countWords(content)) {
      content = expanded.content.trim();
    }
  }

  const affiliateProducts = sanitizeAffiliateProducts(
    mergeAffiliateUrls(parsed.affiliateProducts, affiliates, settings?.amazonAssociateTag)
  );

  if (affiliateProducts?.length) {
    content += comparisonTableMarkdown(affiliateProducts);
  }

  const allSources = [
    ...(news?.sources ?? []),
    ...(parsed.sources ?? []),
  ];
  const seen = new Set<string>();
  const uniqueSources = allSources.filter((s) => {
    if (!s.url || seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });

  if (uniqueSources.length) {
    content += "\n\n## Sources & further reading\n\n";
    for (const source of uniqueSources.slice(0, 8)) {
      content += `- [${source.title}](${source.url})\n`;
    }
  }

  content +=
    "\n\n---\n\n*This article is for informational purposes only. We may earn a commission from links on this page at no extra cost to you.*\n";

  const imageQuery =
    parsed.featuredImageSearchQuery?.trim() ||
    `${parsed.title} ${input.categoryName}`.slice(0, 80);
  const featuredImage = await fetchHeroImageUrl({
    niche: input.niche,
    query: imageQuery,
    uniqueSeed: `${parsed.title}-${parsed.slug}-${Date.now()}`,
    excludeUrls: usedImages,
  });

  const baseSlug = slugify(parsed.slug || parsed.title);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const mergedTags = [
    ...new Set([keywords.primary, ...(parsed.tags ?? []), ...keywords.secondary.slice(0, 3)]),
  ].slice(0, 10);

  const seoScore = calculateSeoScore({
    title: parsed.title,
    metaDescription: parsed.metaDescription,
    content,
    slug,
    tags: mergedTags,
    primaryKeyword: keywords.primary,
    hasFeaturedImage: true,
    hasFaq: (parsed.faq?.length ?? 0) > 0,
    hasSources: uniqueSources.length > 0,
  });

  const shouldPublish = input.autoPublish ?? settings?.autoPublish ?? true;
  const status = shouldPublish ? "PUBLISHED" : "PENDING";
  const wordCount = countWords(content);

  if (wordCount < ARTICLE_MIN_WORDS) {
    throw new Error(`Article too short: ${wordCount} words (min ${ARTICLE_MIN_WORDS})`);
  }

  const article = await prisma.article.create({
    data: {
      title: parsed.title,
      slug,
      excerpt: parsed.excerpt,
      content,
      metaDescription: parsed.metaDescription,
      featuredImage,
      featuredImagePrompt: imageQuery,
      tags: mergedTags,
      faq: (parsed.faq ?? []) as Prisma.InputJsonValue,
      sources: uniqueSources as Prisma.InputJsonValue,
      internalLinks: (parsed.internalLinkSuggestions ?? []) as Prisma.InputJsonValue,
      affiliateBlocks: (affiliateProducts ?? []) as Prisma.InputJsonValue,
      readingTimeMinutes: estimateReadingTime(content),
      seoScore,
      status,
      publishedAt: shouldPublish ? new Date() : null,
      isAiGenerated: true,
      categoryId: input.categoryId,
      authorId: input.authorId,
    },
  });

  return { article, wordCount, newsHeadline: news?.headline ?? null };
}
