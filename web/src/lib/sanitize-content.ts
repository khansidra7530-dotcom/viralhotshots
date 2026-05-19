/** Hostnames that AI often invents — strip links to these, keep anchor text. */
const BLOCKED_LINK_HOSTS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "aiwriter.com",
  "aiassistant.com",
  "aianalytics.com",
  "placeholder.com",
  "yoursite.com",
  "test.com",
]);

function isBlockedUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return [...BLOCKED_LINK_HOSTS].some(
      (blocked) => host === blocked || host.endsWith(`.${blocked}`)
    );
  } catch {
    return true;
  }
}

/** Remove or neutralize placeholder / fake outbound links in markdown. */
export function sanitizeArticleContent(content: string): string {
  let result = content.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi,
    (match, text: string, url: string) => (isBlockedUrl(url) ? text : match)
  );

  result = result.replace(/https?:\/\/[^\s)]+/gi, (url) =>
    isBlockedUrl(url) ? "" : url
  );

  return result.replace(/\n{3,}/g, "\n\n").trim();
}

/** Drop affiliate rows with untrusted URLs. */
export function sanitizeAffiliateProducts<
  T extends { name: string; url: string },
>(products: T[] | undefined): T[] | undefined {
  if (!products?.length) return products;
  const filtered = products.filter((p) => p.url && !isBlockedUrl(p.url));
  return filtered.length ? filtered : undefined;
}
