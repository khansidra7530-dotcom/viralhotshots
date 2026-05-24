import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { ORG_ID, WEBSITE_ID } from "@/lib/aeo/schema-ids";
import { absoluteUrl } from "@/lib/utils";

/** Absolute URL for Open Graph / Twitter cards — never double-prefixes https URLs. */
export function resolveSocialImageUrl(image?: string | null): string {
  if (!image?.trim()) return absoluteUrl("/opengraph-image", SITE_URL);
  return absoluteUrl(image.trim(), SITE_URL);
}

export type SeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
};

/** Google Search Console + Bing Webmaster verification meta tags. */
export function buildSiteVerification(): Pick<Metadata, "verification"> | Record<string, never> {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();

  if (!google && !bing) return {};

  return {
    verification: {
      ...(google && { google }),
      ...(bing && { other: { "msvalidate.01": bing } }),
    },
  };
}

/** SEO title length target: 50–60 characters. */
export function normalizeSeoTitle(title: string): string {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length >= 50 && clean.length <= 60) return clean;
  if (clean.length >= 30 && clean.length < 50) {
    const suffix = " | Daily Updates";
    const extended = `${clean}${suffix}`;
    if (extended.length <= 60) return extended;
  }
  if (clean.length < 50) {
    const padded = `${clean} | ${SITE_NAME} Daily`;
    return padded.length <= 60 ? padded : padded.slice(0, 60).trimEnd();
  }
  return clean.slice(0, 60).trimEnd();
}

/** Meta description target: 150–220 characters (SEO audit standard). */
export function normalizeMetaDescription(description: string): string {
  const clean = description.replace(/\s+/g, " ").trim();
  if (clean.length >= 150 && clean.length <= 220) return clean;

  if (clean.length > 220) {
    return `${clean.slice(0, 217).trimEnd()}...`;
  }

  const suffix = ` Expert guides and trending news on ${SITE_NAME}.`;
  const combined = `${clean}${suffix}`;
  if (combined.length <= 220) {
    return combined.length >= 150 ? combined : combined.padEnd(150, ".");
  }
  return combined.slice(0, 217).trimEnd() + "...";
}

export function buildMetadata(input: SeoInput): Metadata {
  const url = absoluteUrl(input.path, SITE_URL);
  const title = normalizeSeoTitle(input.title);
  const description = normalizeMetaDescription(input.description);
  const image = resolveSocialImageUrl(input.image);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
          type: image.includes(".png") ? "image/png" : "image/jpeg",
        },
      ],
      locale: "en_US",
      type: input.type === "article" ? "article" : "website",
      ...(input.publishedTime && { publishedTime: input.publishedTime }),
      ...(input.modifiedTime && { modifiedTime: input.modifiedTime }),
      ...(input.type === "article" && input.author && { authors: [input.author] }),
      ...(input.section && { section: input.section }),
      ...(input.tags?.length && { tags: input.tags.slice(0, 10) }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    ...(input.tags?.length && { keywords: input.tags }),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl?: string;
  section?: string;
  keywords?: string[];
  wordCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: normalizeSeoTitle(input.title),
    description: normalizeMetaDescription(input.description),
    image: [resolveSocialImageUrl(input.image)],
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: {
      "@type": "Person",
      name: input.authorName,
      ...(input.authorUrl && { url: input.authorUrl }),
    },
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon`,
      },
    },
    isAccessibleForFree: true,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
    ...(input.section && { articleSection: input.section }),
    ...(input.keywords?.length && { keywords: input.keywords.join(", ") }),
    ...(input.wordCount && { wordCount: input.wordCount }),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: normalizeMetaDescription(
      "Breaking trends, expert guides, and honest reviews across finance, tech, AI, health, and more."
    ),
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function calculateSeoScore(input: {
  title: string;
  metaDescription: string;
  content: string;
  slug: string;
  tags: string[];
  primaryKeyword?: string;
  hasFeaturedImage: boolean;
  hasFaq: boolean;
  hasSources: boolean;
}): number {
  let score = 0;
  const titleLen = normalizeSeoTitle(input.title).length;
  const metaLen = normalizeMetaDescription(input.metaDescription).length;
  const wordCount = input.content.split(/\s+/).filter(Boolean).length;
  const h2Count = (input.content.match(/^## /gm) ?? []).length;

  if (titleLen >= 30 && titleLen <= 60) score += 15;
  else if (titleLen > 10) score += 8;

  if (metaLen >= 120 && metaLen <= 160) score += 15;
  else if (metaLen > 50) score += 8;

  if (wordCount >= 1200) score += 20;
  else if (wordCount >= 1000) score += 16;
  else if (wordCount >= 800) score += 10;

  if (h2Count >= 3) score += 10;

  if (input.primaryKeyword) {
    const kw = input.primaryKeyword.toLowerCase();
    const inTitle = input.title.toLowerCase().includes(kw);
    const inMeta = input.metaDescription.toLowerCase().includes(kw);
    const h2WithKw = (input.content.match(/^## .+$/gm) ?? []).filter((h) =>
      h.toLowerCase().includes(kw)
    ).length;
    if (inTitle) score += 8;
    if (inMeta) score += 8;
    if (h2WithKw >= 2) score += 9;
  }

  if (input.slug.length > 3) score += 5;
  if (input.tags.length >= 3) score += 10;
  if (input.hasFeaturedImage) score += 10;
  if (input.hasFaq) score += 10;
  if (input.hasSources) score += 5;

  return Math.min(100, score);
}

const TITLE_STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "for", "to", "in", "on", "of", "is", "are", "was", "were",
  "be", "at", "by", "with", "from", "as", "it", "this", "that", "how", "what", "why", "when",
  "who", "your", "our", "best", "top", "new", "guide", "2024", "2025", "2026",
]);

/** Share of significant H1 words found in page body text (for SEO audits). */
export function titleCoverageInText(title: string, text: string): number {
  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !TITLE_STOP_WORDS.has(w));
  if (words.length === 0) return 1;
  const lower = text.toLowerCase();
  const hits = words.filter((w) => lower.includes(w)).length;
  return hits / words.length;
}

/** Prepends a short lead when the article body does not echo the H1. */
export function ensureBodyMatchesTitle(title: string, excerpt: string, content: string): string {
  const body = content.trim();
  if (titleCoverageInText(title, body) >= 0.45) return body;

  const lead = excerpt.trim()
    ? `${title}. ${excerpt.trim()}`
    : `This guide explains ${title.toLowerCase()} in plain English.`;

  if (titleCoverageInText(title, `${lead}\n\n${body}`) >= 0.45) {
    return `${lead}\n\n${body}`;
  }

  return `${lead}\n\n${body}`;
}
