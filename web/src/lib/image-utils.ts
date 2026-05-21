/** Shared hero aspect ratio (900×560). */
export const HERO_ASPECT = 900 / 560;

export function heroHeight(width: number): number {
  return Math.round(width / HERO_ASPECT);
}

/** Request appropriately sized remote images (Unsplash / Picsum). */
export function resizeImageUrl(url: string, width: number, height?: number): string {
  if (!url || url.startsWith("/")) return url;

  const h = height ?? heroHeight(width);

  if (url.includes("images.unsplash.com")) {
    const base = url.split("?")[0];
    return `${base}?w=${width}&h=${h}&fit=crop&q=80&auto=format`;
  }

  if (url.includes("picsum.photos")) {
    return url.replace(/\/\d+\/\d+(?=\?|$)/, `/${width}/${h}`);
  }

  return url;
}
