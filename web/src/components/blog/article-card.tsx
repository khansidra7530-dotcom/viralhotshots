import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";

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
  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-lg ${
        featured ? "md:col-span-2 md:grid md:grid-cols-2" : ""
      }`}
    >
      <Link href={`/blog/${slug}`} className={featured ? "relative block min-h-[220px]" : "relative block aspect-[16/10]"}>
        <Image
          src={featuredImage ?? "/og-default.png"}
          alt={title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          loading="lazy"
        />
      </Link>
      <div className="flex flex-col gap-3 p-5">
        <Link
          href={`/category/${category.slug}`}
          className="text-xs font-semibold uppercase tracking-wider text-accent"
        >
          {category.name}
        </Link>
        <Link href={`/blog/${slug}`}>
          <h2
            className={`font-semibold leading-snug tracking-tight transition group-hover:text-accent ${
              featured ? "text-2xl" : "text-lg"
            }`}
          >
            {title}
          </h2>
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground">{excerpt}</p>
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          {publishedAt && <time dateTime={String(publishedAt)}>{formatDate(publishedAt)}</time>}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTimeMinutes} min read
          </span>
        </div>
      </div>
    </article>
  );
}
