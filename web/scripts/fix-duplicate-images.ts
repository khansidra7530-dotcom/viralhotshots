/**
 * Reassign featured images for articles that share the same photo.
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
    where: { featuredImage: { not: null } },
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
  const duplicates = articles.filter((a) => {
    if (!a.featuredImage) return false;
    const fp = imageFingerprint(a.featuredImage);
    if (seen.has(fp)) return true;
    seen.add(fp);
    return false;
  });

  if (!duplicates.length) {
    console.log("No duplicate featured images found.");
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  console.log(`Fixing ${duplicates.length} article(s) with duplicate images...\n`);

  for (const article of duplicates) {
    const used = await getUsedImageFingerprints();
    const query =
      article.featuredImagePrompt?.trim() ||
      `${article.title} ${article.category.name}`.slice(0, 80);

    const newUrl = await fetchHeroImageUrl({
      niche: article.category.niche,
      query,
      uniqueSeed: `fix-${article.slug}-${Date.now()}`,
      excludeUrls: used,
    });

    used.add(imageFingerprint(newUrl));

    await prisma.article.update({
      where: { id: article.id },
      data: { featuredImage: newUrl },
    });

    console.log(`✓ ${article.title}`);
    console.log(`  ${newUrl}\n`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main();
