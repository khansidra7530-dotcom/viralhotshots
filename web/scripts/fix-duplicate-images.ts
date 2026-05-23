/**
 * Reassign featured images for articles with missing or duplicate photos.
 * Usage: npx tsx scripts/fix-duplicate-images.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  fetchHeroImageUrl,
  getUsedImageFingerprints,
  imageFingerprint,
} from "../src/lib/ai/hero-image";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      featuredImage: true,
      featuredImagePrompt: true,
      category: { select: { niche: true, name: true } },
    },
  });

  const seen = new Set<string>();
  const toFix = articles.filter((a) => {
    if (!a.featuredImage) return true;
    const fp = imageFingerprint(a.featuredImage);
    if (seen.has(fp)) return true;
    seen.add(fp);
    return false;
  });

  if (!toFix.length) {
    console.log("No missing or duplicate featured images found.");
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  console.log(`Fixing ${toFix.length} article(s) with missing or duplicate images...\n`);

  for (const article of toFix) {
    const used = await getUsedImageFingerprints();
    const query =
      article.featuredImagePrompt?.trim() ||
      `${article.title} ${article.category.name}`.slice(0, 80);

    const newUrl = await fetchHeroImageUrl({
      niche: article.category.niche,
      query,
      uniqueSeed: `fix-${article.slug}-${Date.now()}`,
      excludeUrls: used,
      categoryName: article.category.name,
      title: article.title,
    });

    used.add(imageFingerprint(newUrl));

    await prisma.article.update({
      where: { id: article.id },
      data: { featuredImage: newUrl, featuredImagePrompt: query },
    });

    console.log(`✓ ${article.title}`);
    console.log(`  ${newUrl}\n`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main();
