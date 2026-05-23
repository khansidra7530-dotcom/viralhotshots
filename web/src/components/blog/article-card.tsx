"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { FeaturedImage } from "@/components/blog/featured-image";
import { Clock, ArrowUpRight } from "lucide-react";

type ArticleCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: string | null;
  category: { name: string; slug: string };
  publishedAt: Date | string | null;
  readingTimeMinutes: number;
  featured?: boolean;
};

export function ArticleCard({
  slug,
  title,
  excerpt,
  featuredImage,
  category,
  publishedAt,
  readingTimeMinutes,
  featured,
}: ArticleCardProps) {
  const imageWidth = featured ? 640 : 384;

  return (
    <article
      className={`group card-elevated overflow-hidden ${
        featured ? "md:grid md:grid-cols-2 md:items-stretch" : ""
      }`}
    >
      <Link
        href={`/blog/${slug}`}
        className="relative block w-full min-h-0 overflow-hidden aspect-[900/560]"
      >
        <FeaturedImage
          src={featuredImage}
          alt={title}
          width={imageWidth}
          fill
          className="object-cover object-center transition duration-700 group-hover:scale-105"
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 640px"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
          }
          loading={featured ? "eager" : "lazy"}
          priority={featured}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-accent-foreground shadow-lg sm:text-xs sm:py-1">
          {category.name}
        </span>
        {featured && (
          <span className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            Featured
          </span>
        )}
      </Link>
      <div className="flex flex-col gap-3 p-5 sm:p-6">
        <Link href={`/blog/${slug}`} className="group/title">
          <h2
            className={`font-display font-bold leading-snug tracking-tight transition group-hover/title:text-accent ${
              featured ? "text-2xl sm:text-3xl" : "text-lg"
            }`}
          >
            {title}
            <ArrowUpRight className="ml-1 inline h-4 w-4 opacity-0 transition group-hover/title:opacity-100" />
          </h2>
        </Link>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
        <div className="mt-auto flex items-center gap-3 border-t border-border pt-4 text-sm text-muted-foreground sm:text-xs">
          {publishedAt && (
            <time dateTime={String(publishedAt)} className="font-medium">
              {formatDate(publishedAt)}
            </time>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readingTimeMinutes} min
          </span>
        </div>
      </div>
    </article>
  );
}
