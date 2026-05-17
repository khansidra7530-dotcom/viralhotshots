import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import {
  ARTICLE_MIN_WORDS,
  buildArticlePrompt,
  buildExpandPrompt,
} from "@/lib/ai/prompts";
import { fetchNewsBrief } from "@/lib/ai/news";
import { fetchHeroImageUrl } from "@/lib/ai/hero-image";
import { slugify, estimateReadingTime, countWords } from "@/lib/utils";
import { calculateSeoScore } from "@/lib/seo";
import { comparisonTableMarkdown, buildAmazonUrl } from "@/lib/affiliate";
import type { Niche } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";

export type GeneratedArticlePayload = {
  title: string;
  metaDescription: string;
  slug: string;
  excerpt: string;
  featuredImageSearchQuery?: string;
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

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

function parseJson<T>(raw: string): T {
  const trimmed = raw.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
  return JSON.parse(trimmed) as T;
}

async function callModel(
  openai: OpenAI,
  model: string,
  system: string,
  user: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.75,
    response_format: { type: "json_object" },
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty AI response");
  return raw;
}

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
  const model = settings?.openaiModel ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const openai = getOpenAI();

  const news = await fetchNewsBrief(input.niche, input.categoryName);

  const affiliates = await prisma.affiliateLink.findMany({
    where: { isActive: true, OR: [{ niche: input.niche }, { niche: null }] },
    take: 8,
  });

  const prompt = buildArticlePrompt({
    niche: input.niche,
    category: input.categoryName,
    topic: input.topic,
    news,
    affiliateKeywords: affiliates.map((a) => a.name),
    siteName: settings?.siteName,
  });

  let raw = await callModel(
    openai,
    model,
    "You are a senior editor. Output only valid JSON.",
    prompt
  );
  let parsed = parseJson<GeneratedArticlePayload>(raw);

  let content = parsed.content.trim();

  if (countWords(content) < ARTICLE_MIN_WORDS) {
    const expandRaw = await callModel(
      openai,
      model,
      "You expand articles. Output only valid JSON.",
      buildExpandPrompt(content, ARTICLE_MIN_WORDS)
    );
    const expanded = parseJson<{ content: string }>(expandRaw);
    if (expanded.content && countWords(expanded.content) >= countWords(content)) {
      content = expanded.content.trim();
    }
  }

  const affiliateProducts = mergeAffiliateUrls(
    parsed.affiliateProducts,
    affiliates,
    settings?.amazonAssociateTag
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
    parsed.featuredImageSearchQuery ?? parsed.title ?? input.categoryName;
  const featuredImage = await fetchHeroImageUrl(input.niche, imageQuery);

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
      tags: parsed.tags ?? [],
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
