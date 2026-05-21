import Image from "next/image";
import { resizeImageUrl } from "@/lib/image-utils";

/** Matches AI-generated hero assets (900×560). */
export const ARTICLE_FEATURED_WIDTH = 900;
export const ARTICLE_FEATURED_HEIGHT = 560;

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

/** Fixed aspect hero on article pages — same proportions on every post. */
export function ArticleFeaturedImage({
  src,
  alt,
  priority = false,
  className = "",
}: Props) {
  const optimizedSrc = resizeImageUrl(src, 768);

  return (
    <div
      className={`relative mt-8 aspect-[900/560] w-full overflow-hidden rounded-2xl bg-muted shadow-lg ring-1 ring-border sm:rounded-3xl ${className}`}
    >
      <Image
        src={optimizedSrc}
        alt={alt}
        fill
        priority={priority}
        className="object-cover object-center"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 768px"
      />
    </div>
  );
}
