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
    update: { cronEnabled: true, autoPublish: true, aiModel: "llama-3.3-70b-versatile" },
    create: {
      id: "default",
      siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "ViralHotshots",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      cronEnabled: true,
      autoPublish: true,
      aiModel: "llama-3.3-70b-versatile",
    },
  });

  const sampleArticles = [
    {
      slug: "best-budgeting-apps-2026",
      title: "Best Budgeting Apps in 2026: Expert Picks for Every Wallet",
      excerpt:
        "We tested the top money apps for tracking spending, saving automatically, and hitting financial goals without spreadsheet headaches.",
      metaDescription:
        "Compare the best budgeting apps in 2026. Expert reviews of features, fees, and who each app is best for.",
      content: `## Why a budgeting app matters

A solid budgeting app turns vague New Year's resolutions into daily habits. The best tools connect to your bank, categorize transactions, and surface insights you would miss in a monthly statement.

## Our top picks

**1. All-around winner** — Great for couples and solo users who want automation plus manual overrides.

**2. Best for beginners** — Clean UI, gentle onboarding, and clear weekly spending summaries.

**3. Best for investors** — Ties cash flow to portfolio goals without feeling like a trading platform.

## How we tested

We used each app for 30 days with real accounts, comparing sync reliability, notification quality, and export options.

## Bottom line

Pick the app that matches how you actually manage money — daily check-ins vs. set-and-forget rules.`,
      featuredImage: "https://images.unsplash.com/photo-1554224311-beee415c201f?w=1200&q=80",
      categorySlug: "personal-finance",
      tags: ["budgeting", "finance", "apps"],
    },
    {
      slug: "ai-writing-tools-compared",
      title: "AI Writing Tools Compared: Which One Fits Your Workflow?",
      excerpt:
        "From blog drafts to ad copy, we break down speed, accuracy, and pricing across the leading AI writing assistants.",
      metaDescription:
        "AI writing tools compared for bloggers and marketers. Features, pricing, and real-world workflow tips.",
      content: `## The AI writing landscape

Generative AI has moved from novelty to daily driver for content teams. The question is not whether to use it — it is which tool fits your quality bar.

## What we evaluated

- Output quality on long-form outlines
- Tone controls and brand voice
- Integration with Google Docs and WordPress
- Price per 100k words

## Standout use cases

**Bloggers** benefit from research-aware drafts and SEO-oriented headings.

**E-commerce teams** need product description templates at scale.

**Newsrooms** should prioritize citation and fact-check workflows.

## Final recommendation

Use one primary tool for drafting and a separate editor for human polish — the combo beats any single autopilot.`,
      featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
      categorySlug: "ai-tools",
      tags: ["ai", "writing", "productivity"],
    },
    {
      slug: "morning-wellness-routine-guide",
      title: "The 20-Minute Morning Wellness Routine That Actually Sticks",
      excerpt:
        "A realistic, science-backed morning stack for energy and focus — no 5 a.m. ice baths required.",
      metaDescription:
        "Build a sustainable morning wellness routine in 20 minutes. Expert tips on hydration, movement, and mental clarity.",
      content: `## Start smaller than you think

Most routines fail because they are designed for an ideal version of you, not Tuesday morning you.

## The 20-minute stack

**Minutes 0–5:** Hydrate and daylight — a full glass of water and two minutes by a window.

**Minutes 5–15:** Light movement — mobility or a brisk walk, not a full gym session.

**Minutes 15–20:** Intention setting — three priorities, not a twenty-item list.

## Why it works

Consistency beats intensity. Twenty minutes is short enough to repeat and long enough to shift mood.

## Track what matters

Note energy at noon for two weeks. Adjust one variable at a time.`,
      featuredImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",
      categorySlug: "wellness",
      tags: ["wellness", "health", "habits"],
    },
  ];

  for (const sample of sampleArticles) {
    const category = await prisma.category.findUnique({
      where: { slug: sample.categorySlug },
    });
    if (!category) continue;

    await prisma.article.upsert({
      where: { slug: sample.slug },
      update: {
        title: sample.title,
        excerpt: sample.excerpt,
        metaDescription: sample.metaDescription,
        content: sample.content,
        featuredImage: sample.featuredImage,
        status: "PUBLISHED",
        publishedAt: new Date(),
        tags: sample.tags,
        readingTimeMinutes: 6,
        seoScore: 75,
      },
      create: {
        title: sample.title,
        slug: sample.slug,
        excerpt: sample.excerpt,
        metaDescription: sample.metaDescription,
        content: sample.content,
        featuredImage: sample.featuredImage,
        status: "PUBLISHED",
        publishedAt: new Date(),
        tags: sample.tags,
        readingTimeMinutes: 6,
        seoScore: 75,
        categoryId: category.id,
        authorId: admin.id,
      },
    });
  }

  const existing = await prisma.affiliateLink.count();
  if (existing === 0) {
    await prisma.affiliateLink.createMany({
      data: [
        { name: "budgeting app", url: "https://example.com/budget-app", network: "custom", niche: "FINANCE" },
        { name: "wireless earbuds", url: "https://amazon.com", network: "amazon", asin: "B0EXAMPLE", niche: "TECH" },
      ],
    });
  }

  const published = await prisma.article.count({ where: { status: "PUBLISHED" } });
  console.log("Seed complete!");
  console.log(`Admin: ${email} / ${password}`);
  console.log(`Admin ID: ${admin.id}`);
  console.log(`Published articles: ${published}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
