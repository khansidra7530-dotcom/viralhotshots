/**
 * Publish one article for every niche in order (local use).
 * Usage: npx tsx scripts/publish-all-niches.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { generateArticle } from "../src/lib/ai/generate-article";
import { pickAllCategoriesInOrder } from "../src/lib/ai/pick-category";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No admin user. Run npm run db:seed");

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const picks = await pickAllCategoriesInOrder();

  console.log(`Publishing ${picks.length} articles (one per niche)...\n`);

  const delayMs = Number(process.env.PUBLISH_DELAY_MS ?? 45_000);

  for (let i = 0; i < picks.length; i++) {
    const pick = picks[i];
    if (i > 0) {
      console.log(`Waiting ${delayMs / 1000}s (Groq rate limit)...\n`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
    console.log(`→ ${pick.rotationLabel} — ${pick.category.name}`);
    try {
      const { article, wordCount } = await generateArticle({
        niche: pick.category.niche,
        categoryId: pick.category.id,
        categoryName: pick.category.name,
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
