/**
 * Publish one article for specific niches (with delay to avoid Groq rate limits).
 * Usage: npx tsx scripts/publish-niches.ts TECH HEALTH
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, type Niche } from "../src/generated/prisma/client";
import { generateArticle } from "../src/lib/ai/generate-article";

const delayMs = Number(process.env.PUBLISH_DELAY_MS ?? 45_000);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const niches = process.argv.slice(2).map((n) => n.toUpperCase()) as Niche[];
  if (!niches.length) {
    console.error("Usage: npx tsx scripts/publish-niches.ts FINANCE TECH ...");
    process.exit(1);
  }

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No admin user. Run npm run db:seed");

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });

  for (let i = 0; i < niches.length; i++) {
    const niche = niches[i];
    const category = await prisma.category.findFirst({ where: { niche } });
    if (!category) {
      console.error(`No category for niche ${niche}`);
      continue;
    }

    if (i > 0) {
      console.log(`Waiting ${delayMs / 1000}s before next niche...\n`);
      await new Promise((r) => setTimeout(r, delayMs));
    }

    console.log(`→ ${niche} — ${category.name}`);
    try {
      const { article, wordCount } = await generateArticle({
        niche,
        categoryId: category.id,
        categoryName: category.name,
        authorId: admin.id,
        autoPublish: settings?.autoPublish ?? true,
      });
      console.log(`  ✓ ${article.title} (${wordCount} words) — /blog/${article.slug}\n`);
    } catch (err) {
      console.error(`  ✗ ${err instanceof Error ? err.message : err}\n`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

main();
