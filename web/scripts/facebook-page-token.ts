/**
 * Exchange a short-lived User access token for your Page access token.
 *
 * Usage:
 *   FACEBOOK_USER_ACCESS_TOKEN=... FACEBOOK_PAGE_ID=61573902383633 npx tsx scripts/facebook-page-token.ts
 *
 * Token must include: pages_show_list, pages_manage_posts
 */
import "dotenv/config";

const pageId = process.env.FACEBOOK_PAGE_ID?.trim() || "571859719347744";
const userToken =
  process.env.FACEBOOK_USER_ACCESS_TOKEN?.trim() || process.argv[2]?.trim();

if (!userToken) {
  console.error("Set FACEBOOK_USER_ACCESS_TOKEN or pass token as argv[2]");
  process.exit(1);
}

async function main() {
  const url = new URL("https://graph.facebook.com/v21.0/me/accounts");
  url.searchParams.set("fields", "id,name,access_token,tasks");
  url.searchParams.set("access_token", userToken);

  const res = await fetch(url);
  const data = (await res.json()) as {
    data?: { id: string; name: string; access_token: string; tasks?: string[] }[];
    error?: { message: string; code: number };
  };

  if (data.error) {
    console.error("Graph API error:", data.error.message);
    console.error("\nFix: In Graph API Explorer → Add Permission → pages_manage_posts + pages_show_list");
    console.error("Then: User or Page → Get Page Access Token → Viral Hot Shots");
    process.exit(1);
  }

  const page = data.data?.find((p) => p.id === pageId);
  if (!page?.access_token) {
    console.error(`Page ${pageId} not found. Pages on this token:`);
    for (const p of data.data ?? []) {
      console.error(`  - ${p.name} (${p.id})`);
    }
    process.exit(1);
  }

  console.log("Page:", page.name, `(${page.id})`);
  console.log("\nAdd to .env and Vercel as FACEBOOK_PAGE_ACCESS_TOKEN:\n");
  console.log(page.access_token);
}

main();
