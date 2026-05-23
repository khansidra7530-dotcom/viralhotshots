"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { isNextImageOptimizableHost, resizeImageUrl } from "@/lib/image-utils";

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=750&fit=crop&q=85&auto=format";

type Props = {
  src: string | null | undefined;
  alt: string;
  width: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
};

export function FeaturedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = "",
  sizes,
  loading,
}: Props) {
  const initial = resizeImageUrl(src?.trim() || DEFAULT_FALLBACK, width, height);
  const [currentSrc, setCurrentSrc] = useState(initial);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(resizeImageUrl(src?.trim() || DEFAULT_FALLBACK, width, height));
    setFailed(false);
  }, [src, width, height]);

  function handleError() {
    if (failed) return;
    setFailed(true);
    setCurrentSrc(resizeImageUrl(DEFAULT_FALLBACK, width, height));
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      {...(fill ? { fill: true } : { width, height: height ?? Math.round(width / (900 / 560)) })}
      priority={priority}
      loading={loading}
      unoptimized={!isNextImageOptimizableHost(currentSrc)}
      className={className}
      sizes={sizes}
      onError={handleError}
    />
  );
}
