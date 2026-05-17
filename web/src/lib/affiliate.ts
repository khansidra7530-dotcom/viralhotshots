export type AffiliateProduct = {
  name: string;
  price?: string;
  rating?: number;
  pros?: string[];
  cons?: string[];
  url: string;
  image?: string;
  badge?: string;
};

export function buildAmazonUrl(asin: string, tag?: string): string {
  const associateTag = tag ?? process.env.AMAZON_ASSOCIATE_TAG ?? "";
  const params = associateTag ? `?tag=${associateTag}` : "";
  return `https://www.amazon.com/dp/${asin}${params}`;
}

export function injectAffiliateLinks(
  content: string,
  links: { keyword: string; url: string }[]
): string {
  let result = content;
  for (const link of links) {
    const regex = new RegExp(`\\b(${escapeRegex(link.keyword)})\\b(?!\\])`, "i");
    result = result.replace(
      regex,
      `[$1](${link.url})`
    );
  }
  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function comparisonTableMarkdown(products: AffiliateProduct[]): string {
  if (!products.length) return "";

  const header = "| Product | Price | Rating | Best For |\n| --- | --- | --- | --- |";
  const rows = products.map(
    (p) =>
      `| [${p.name}](${p.url}) | ${p.price ?? "—"} | ${p.rating ? `${p.rating}/5` : "—"} | ${p.badge ?? "—"} |`
  );

  return `\n\n## Product Comparison\n\n${header}\n${rows.join("\n")}\n`;
}

export function ctaBlock(text: string, url: string, label = "Check Price"): string {
  return `\n\n> **${text}** [${label} →](${url})\n`;
}
