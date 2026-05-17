import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Personal Finance", slug: "personal-finance", niche: "FINANCE" as const, description: "Budgeting, investing, and money management" },
  { name: "Gadgets & Gear", slug: "gadgets", niche: "TECH" as const, description: "Tech reviews and buying guides" },
  { name: "AI Tools", slug: "ai-tools", niche: "AI" as const, description: "AI software and productivity" },
  { name: "Wellness", slug: "wellness", niche: "HEALTH" as const, description: "Health and fitness insights" },
  { name: "Gaming", slug: "gaming", niche: "GAMING" as const, description: "Games, hardware, and esports" },
  { name: "Crypto", slug: "crypto", niche: "CRYPTO" as const, description: "Blockchain and digital assets" },
  { name: "Entrepreneurship", slug: "entrepreneurship", niche: "BUSINESS" as const, description: "Startups and business growth" },
  { name: "Travel Guides", slug: "travel", niche: "TRAVEL" as const, description: "Destinations and travel tips" },
];

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@viralhotshots.com";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const hash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", name: process.env.ADMIN_NAME ?? "Viral Hotshots Editorial" },
    create: {
      email,
      name: process.env.ADMIN_NAME ?? "Viral Hotshots Editorial",
      passwordHash: hash,
      role: "ADMIN",
      bio: "Official editorial account for Viral Hotshots.",
    },
  });

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "ViralHotshots",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    },
  });

  const existing = await prisma.affiliateLink.count();
  if (existing === 0) {
    await prisma.affiliateLink.createMany({
      data: [
        { name: "budgeting app", url: "https://example.com/budget-app", network: "custom", niche: "FINANCE" },
        { name: "wireless earbuds", url: "https://amazon.com", network: "amazon", asin: "B0EXAMPLE", niche: "TECH" },
      ],
    });
  }

  console.log("Seed complete!");
  console.log(`Admin: ${email} / ${password}`);
  console.log(`Admin ID: ${admin.id}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
