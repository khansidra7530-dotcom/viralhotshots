import type { Metadata } from "next";
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

export function buildMetadata(input: SeoInput): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.image ? absoluteUrl(input.image) : absoluteUrl("/og-default.png");

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "InsightPress",
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
      locale: "en_US",
      type: input.type === "article" ? "article" : "website",
      ...(input.publishedTime && { publishedTime: input.publishedTime }),
      ...(input.modifiedTime && { modifiedTime: input.modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
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
    headline: input.title,
    description: input.description,
    image: input.image ? [input.image] : undefined,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: { "@type": "Person", name: input.authorName },
    publisher: {
      "@type": "Organization",
      name: process.env.NEXT_PUBLIC_SITE_NAME ?? "InsightPress",
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
  hasFeaturedImage: boolean;
  hasFaq: boolean;
  hasSources: boolean;
}): number {
  let score = 0;
  const titleLen = input.title.length;
  const metaLen = input.metaDescription.length;
  const wordCount = input.content.split(/\s+/).filter(Boolean).length;
  const h2Count = (input.content.match(/^## /gm) ?? []).length;

  if (titleLen >= 30 && titleLen <= 65) score += 15;
  else if (titleLen > 10) score += 8;

  if (metaLen >= 120 && metaLen <= 160) score += 15;
  else if (metaLen > 50) score += 8;

  if (wordCount >= 1200) score += 20;
  else if (wordCount >= 1000) score += 16;
  else if (wordCount >= 800) score += 10;

  if (h2Count >= 3) score += 10;
  if (input.slug.length > 3) score += 5;
  if (input.tags.length >= 3) score += 10;
  if (input.hasFeaturedImage) score += 10;
  if (input.hasFaq) score += 10;
  if (input.hasSources) score += 5;

  return Math.min(100, score);
}
