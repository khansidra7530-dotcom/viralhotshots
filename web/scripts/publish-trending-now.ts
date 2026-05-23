/**
 * Research global trending topics and publish one EEAT SEO article.
 * Usage: npx tsx scripts/publish-trending-now.ts [--low-competition]
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, type Niche } from "../src/generated/prisma/client";
import { generateArticle } from "../src/lib/ai/generate-article";
import { fetchAllTrendSources } from "../src/lib/marketing/trends/sources";
import { scoreTrendItems, rankLowCompetitionTrends } from "../src/lib/marketing/trends/scorer";
import type { ScoredTrend } from "../src/lib/marketing/types";

const NICHE_FOR_WORLD_NEWS: Niche = "BUSINESS";
const lowCompetitionMode = process.argv.includes("--low-competition");

async function pickBestTrend() {
  const raw = await fetchAllTrendSources();
  const trends = await scoreTrendItems(raw, { limit: 40 });
  const ranked = [...trends].sort((a, b) => b.overallScore - a.overallScore);

  if (lowCompetitionMode) {
    const lowComp = filterSiteRelevantTrends(rankLowCompetitionTrends(trends));
    const pick =
      lowComp.find((t) => t.source === "GOOGLE_TRENDS" && nicheForTrend(t.title)) ??
      lowComp.find((t) => t.source === "GOOGLE_TRENDS") ??
      lowComp[0] ??
      ranked[0];
    return { pick, ranked: lowComp.length ? lowComp : ranked, mode: "low-competition" as const };
  }

  const googleFirst = ranked.find((t) => t.source === "GOOGLE_TRENDS");
  const pick = googleFirst ?? ranked[0];
  return { pick, ranked, mode: "top-trend" as const };
}

function nicheForTrend(title: string): Niche | null {
  const lower = title.toLowerCase();
  if (/ vs | fc | athletic| score|cubs |yankees |lsg vs|pbks|celtic |dunfermline|open 202/i.test(lower)) return null;
  if (/ai|chatgpt|openai|llm|machine learning/.test(lower)) return "AI";
  if (/bitcoin|crypto|ethereum|blockchain/.test(lower)) return "CRYPTO";
  if (/stock|market|gold|silver|fed|inflation|economy|finance|entergy|utility|medi-cal/.test(lower)) return "FINANCE";
  if (/game|gaming|xbox|playstation|nintendo|esports/.test(lower)) return "GAMING";
  if (/health|virus|covid|fitness|wellness|medical/.test(lower)) return "HEALTH";
  if (/travel|flight|airline|hotel|vacation|formula 1|f1 schedule|tourism/.test(lower)) return "TRAVEL";
  if (/iphone|apple|google|microsoft|nvidia|tech|software|appletv|duffer brothers|solo leveling/.test(lower)) return "TECH";
  if (/business|startup|marketing|walmart|ceo|executive|entrepreneur/.test(lower)) return "BUSINESS";
  return null;
}

function filterSiteRelevantTrends(trends: ScoredTrend[]): ScoredTrend[] {
  return trends.filter((t) => {
    const title = t.title.toLowerCase();
    if (/ vs | fc | score today|game today| lsg vs | pbks/.test(title)) return false;
    return true;
  });
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const { pick, ranked, mode } = await pickBestTrend();

  console.log(
    mode === "low-competition"
      ? "Finding trending topics with low competition...\n"
      : "Researching global trending topics...\n"
  );

  console.log(
    mode === "low-competition"
      ? "Top 10 low-competition trending keywords:\n"
      : "Top 10 trending topics worldwide:\n"
  );
  for (const t of ranked.slice(0, 10)) {
    console.log(
      `  traffic:${t.trafficScore.toFixed(1)} comp:${t.competitionScore.toFixed(1)} | ${t.source.padEnd(14)} | ${t.niche ?? "GENERAL"} | ${t.title.slice(0, 60)}`
    );
  }

  const niche = nicheForTrend(pick.title) ?? NICHE_FOR_WORLD_NEWS;

  const category = await prisma.category.findFirst({ where: { niche } });
  if (!category) throw new Error(`No category for niche ${niche}`);

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No admin user. Run npm run db:seed");

  const topic = `Breaking global trend: ${pick.title}. Write ONLY about this story — do not mix unrelated news. ${pick.summary ?? ""}`.slice(0, 400);

  console.log(`\nSelected ${mode === "low-competition" ? "low-competition keyword" : "top trend"}: "${pick.title}"`);
  console.log(`Niche: ${niche} (${category.name})`);
  console.log(`Source: ${pick.source} | Traffic: ${pick.trafficScore.toFixed(1)} | Competition score: ${pick.competitionScore.toFixed(1)}`);
  console.log("\nGenerating 1000+ word EEAT article...\n");

  const { article, wordCount, newsHeadline } = await generateArticle({
    niche,
    categoryId: category.id,
    categoryName: category.name,
    authorId: admin.id,
    topic,
    autoPublish: true,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.viralhotshots.com";
  console.log("✓ Published successfully\n");
  console.log(`  Title:     ${article.title}`);
  console.log(`  Words:     ${wordCount}`);
  console.log(`  Slug:      /blog/${article.slug}`);
  console.log(`  URL:       ${siteUrl}/blog/${article.slug}`);
  console.log(`  News hook: ${newsHeadline ?? pick.title}`);
  console.log(`  Image:     ${article.featuredImage ?? "(none)"}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
