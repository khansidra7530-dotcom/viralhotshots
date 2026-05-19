import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";

type Props = {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: string | null;
  categoryName: string;
  publishedAt: Date | null;
  readingTimeMinutes: number;
  savedAt: Date;
  badge: "Liked" | "Subscribed";
};

export function SavedArticleCard({
  slug,
  title,
  excerpt,
  featuredImage,
  categoryName,
  publishedAt,
  readingTimeMinutes,
  savedAt,
  badge,
}: Props) {
  return (
    <li className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-accent/40">
      <Link
        href={`/blog/${slug}`}
        className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl"
      >
        <Image
          src={featuredImage ?? "/opengraph-image"}
          alt={title}
          fill
          className="object-cover"
          sizes="112px"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {badge} · {categoryName}
        </span>
        <Link href={`/blog/${slug}`}>
          <h3 className="mt-1 font-semibold leading-snug hover:text-accent">{title}</h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{excerpt}</p>
        <p className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {publishedAt && <span>Published {formatDate(publishedAt)}</span>}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTimeMinutes} min
          </span>
          <span>{badge} {formatDate(savedAt)}</span>
        </p>
      </div>
    </li>
  );
}
