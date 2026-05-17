import Link from "next/link";
import { ArticleCard } from "@/components/blog/article-card";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import { getPublishedArticles, getTrendingArticles } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latest, trending, categories] = await Promise.all([
    getPublishedArticles({ limit: 7 }),
    getTrendingArticles(5),
    prisma.category.findMany({ orderBy: { name: "asc" }, take: 8 }),
  ]);

  const [featured, ...rest] = latest;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-accent/10 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Expert guides · EEAT-optimized · AdSense-ready
            </p>
            <p className="text-sm font-bold uppercase tracking-widest text-accent">
              {SITE_NAME}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {SITE_TAGLINE}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              In-depth guides, honest comparisons, and expert analysis across finance,
              tech, health, and more. Built for organic growth.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
              >
                Explore articles <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold transition hover:bg-muted"
              >
                Browse categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Latest articles</h2>
            <p className="mt-1 text-muted-foreground">Fresh expert content, updated regularly</p>
          </div>
          <Link href="/blog" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No articles yet. Add articles from the admin panel.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured && (
              <ArticleCard
                slug={featured.slug}
                title={featured.title}
                excerpt={featured.excerpt}
                featuredImage={featured.featuredImage}
                category={featured.category}
                publishedAt={featured.publishedAt}
                readingTimeMinutes={featured.readingTimeMinutes}
                featured
              />
            )}
            {rest.map((article) => (
              <ArticleCard
                key={article.id}
                slug={article.slug}
                title={article.title}
                excerpt={article.excerpt}
                featuredImage={article.featuredImage}
                category={article.category}
                publishedAt={article.publishedAt}
                readingTimeMinutes={article.readingTimeMinutes}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <TrendingUp className="h-5 w-5 text-accent" /> Trending this week
            </h2>
            <ul className="mt-6 space-y-4">
              {trending.map((a, i) => (
                <li key={a.id}>
                  <Link href={`/blog/${a.slug}`} className="group flex gap-4">
                    <span className="text-2xl font-bold text-muted-foreground/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-medium group-hover:text-accent">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.category.name}</p>
                    </div>
                  </Link>
                </li>
              ))}
              {trending.length === 0 && (
                <p className="text-sm text-muted-foreground">Trending posts appear as readers engage.</p>
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-xl font-bold">Stay in the loop</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Weekly roundup of our best guides—no fluff.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">Explore by niche</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="rounded-2xl border border-border bg-card p-6 transition hover:border-accent/50 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                {cat.niche}
              </p>
              <p className="mt-2 text-lg font-semibold">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
