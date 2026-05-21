export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Viral Hotshots";

/** Apex (non-www) URL — must match the domain users land on after redirects. */
function normalizeSiteUrl(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
    }
    return url.origin;
  } catch {
    return raw.replace(/\/$/, "");
  }
}

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://viralhotshots.com"
);
export const SITE_TAGLINE = "Trending news and expert guides daily";

/** Google Analytics 4 measurement ID (e.g. G-XXXXXXXXXX). Leave unset to disable. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-JJW7BMNGRR";

/** Public social profiles — set in env or update defaults to your real URLs. */
export const SOCIAL_LINKS = [
  {
    id: "x",
    label: "X (Twitter)",
    href: process.env.NEXT_PUBLIC_SOCIAL_X ?? "https://x.com/viralhotshots",
  },
  {
    id: "facebook",
    label: "Facebook",
    href:
      process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ??
      "https://www.facebook.com/profile.php?id=61573902383633",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? "https://www.linkedin.com/company/viralhotshots",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? "https://www.instagram.com/viralhotshots",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE ?? "https://www.youtube.com/@viralhotshots",
  },
].filter((link) => link.href.startsWith("http"));

export const NICHES = [
  { value: "FINANCE", label: "Finance" },
  { value: "TECH", label: "Tech" },
  { value: "AI", label: "AI" },
  { value: "HEALTH", label: "Health" },
  { value: "GAMING", label: "Gaming" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "BUSINESS", label: "Business" },
  { value: "TRAVEL", label: "Travel" },
] as const;

export const ARTICLE_STATUSES = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "SCHEDULED",
] as const;

export const WORD_COUNT_MIN = 1000;
export const WORD_COUNT_MAX = 2500;
