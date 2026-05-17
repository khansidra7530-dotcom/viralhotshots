export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Viral Hotshots";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viralhotshots.com";
export const SITE_TAGLINE = "Trending news and expert guides daily";

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
    href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ?? "https://www.facebook.com/viralhotshots",
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
