export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Viral Hotshots";
export const SITE_TAGLINE = "Trending news and expert guides daily";

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
