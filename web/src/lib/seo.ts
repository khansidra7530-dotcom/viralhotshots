import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

export type SeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
};

/** SEO title length target: 30–60 characters. */
export function normalizeSeoTitle(title: string): string {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length >= 30 && clean.length <= 60) return clean;
  if (clean.length < 30) {
    const padded = `${clean} | ${SITE_NAME}`;
    return padded.length <= 60 ? padded : padded.slice(0, 60).trimEnd();
  }
  return clean.slice(0, 60).trimEnd();
}

/** Meta description target: 120–160 characters. */
export function normalizeMetaDescription(description: string): string {
  const clean = description.replace(/\s+/g, " ").trim();
  if (clean.length >= 120 && clean.length <= 160) return clean;

  if (clean.length > 160) {
    return `${clean.slice(0, 157).trimEnd()}...`;
  }

  const suffix = ` Expert guides and trending news on ${SITE_NAME}.`;
  const combined = `${clean}${suffix}`;
  if (combined.length <= 160) {
    return combined.length >= 120 ? combined : combined.padEnd(120, ".");
  }
  return combined.slice(0, 157).trimEnd() + "...";
}

export function buildMetadata(input: SeoInput): Metadata {
  const url = absoluteUrl(input.path, SITE_URL);
  const title = normalizeSeoTitle(input.title);
  const description = normalizeMetaDescription(input.description);
  const image = input.image
    ? absoluteUrl(input.image, SITE_URL)
    : absoluteUrl("/opengraph-image", SITE_URL);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        "en-US": url,
        "x-default": url,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: "en_US",
      type: input.type === "article" ? "article" : "website",
      ...(input.publishedTime && { publishedTime: input.publishedTime }),
      ...(input.modifiedTime && { modifiedTime: input.modifiedTime }),
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: normalizeSeoTitle(input.title),
    description: normalizeMetaDescription(input.description),
    image: input.image ? [input.image] : undefined,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: { "@type": "Person", name: input.authorName },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: normalizeMetaDescription(
      "Breaking trends, expert guides, and honest reviews across finance, tech, AI, health, and more."
    ),
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
