/** Shared hero aspect ratio (900×560). */
export const HERO_ASPECT = 900 / 560;

/** Stable ID for dedup — same Unsplash photo with different ?w= counts as one image. */
export function imageFingerprint(url: string): string {
  const unsplash = url.match(/photo-[\d]+-[\da-f]+/i);
  if (unsplash) return unsplash[0].toLowerCase();
  const picsum = url.match(/picsum\.photos\/seed\/([^/?]+)/i);
  if (picsum) return `picsum:${picsum[1]}`;
  return url.split("?")[0].toLowerCase();
}

/** Hosts allowed for Next.js Image optimization. */
export function isNextImageOptimizableHost(url: string): boolean {
  if (!url || url.startsWith("/")) return true;
  try {
    const host = new URL(url).hostname;
    return (
      host === "images.unsplash.com" ||
      host === "picsum.photos" ||
      host === "placehold.co" ||
      host.endsWith(".amazon.com") ||
      host.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

export function heroHeight(width: number): number {
  return Math.round(width / HERO_ASPECT);
}

/** Request appropriately sized remote images (Unsplash / Picsum). */
export function resizeImageUrl(url: string, width: number, height?: number): string {
  if (!url || url.startsWith("/")) return url;

  const h = height ?? heroHeight(width);

  if (url.includes("images.unsplash.com")) {
    const base = url.split("?")[0];
    return `${base}?w=${width}&h=${h}&fit=crop&q=85&auto=format`;
  }

  if (url.includes("picsum.photos")) {
    return url.replace(/\/\d+\/\d+(?=\?|$)/, `/${width}/${h}`);
  }

  return url;
}
