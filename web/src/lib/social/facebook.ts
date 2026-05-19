import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

const GRAPH_API = "https://graph.facebook.com/v21.0";

export function getFacebookPageId(): string | undefined {
  return process.env.FACEBOOK_PAGE_ID?.trim() || undefined;
}

export function getFacebookPageAccessToken(): string | undefined {
  return process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim() || undefined;
}

export function isFacebookPublishEnabled(): boolean {
  if (process.env.FACEBOOK_PUBLISH_ENABLED === "false") return false;
  return Boolean(getFacebookPageId() && getFacebookPageAccessToken());
}

export type FacebookPostInput = {
  title: string;
  excerpt: string;
  slug: string;
  categoryName?: string;
  tags?: string[];
  featuredImage?: string | null;
};

/** Marketing-style caption for Page feed (link preview from OG tags). */
export function buildFacebookPostMessage(input: FacebookPostInput): string {
  const url = absoluteUrl(`/blog/${input.slug}`, SITE_URL);
  const hook = input.categoryName ? `${input.categoryName} · ` : "";
  const excerpt =
    input.excerpt.length > 220 ? `${input.excerpt.slice(0, 217).trimEnd()}…` : input.excerpt;

  const hashtags = [
    "ViralHotshots",
    input.categoryName?.replace(/\s+/g, "") ?? "",
    ...(input.tags ?? []).slice(0, 2).map((t) => t.replace(/\s+/g, "")),
  ]
    .filter(Boolean)
    .slice(0, 4)
    .map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, "")}`)
    .join(" ");

  return [
    `🔥 ${hook}${input.title}`,
    "",
    excerpt,
    "",
    `👉 Read the full story: ${url}`,
    "",
    hashtags,
    "",
    `— ${SITE_NAME}`,
  ]
    .join("\n")
    .trim();
}

export async function createFacebookPagePost(
  input: FacebookPostInput
): Promise<{ postId: string }> {
  const pageId = getFacebookPageId();
  const accessToken = getFacebookPageAccessToken();

  if (!pageId || !accessToken) {
    throw new Error(
      "Facebook is not configured. Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN in env."
    );
  }

  const message = buildFacebookPostMessage(input);
  const link = absoluteUrl(`/blog/${input.slug}`, SITE_URL);

  const body: Record<string, string> = {
    message,
    link,
    access_token: accessToken,
  };

  // Photo + link: use feed with link for OG preview; optional picture if image is public HTTPS
  if (input.featuredImage?.startsWith("https://")) {
    body.picture = input.featuredImage;
  }

  const res = await fetch(`${GRAPH_API}/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as { id?: string; error?: { message: string; code?: number } };

  if (!res.ok || !data.id) {
    const detail = data.error?.message ?? res.statusText;
    throw new Error(`Facebook API error: ${detail}`);
  }

  return { postId: data.id };
}
