import Link from "next/link";
import { ArticleCard } from "@/components/blog/article-card";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import { getPublishedArticles, getTrendingArticles } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { websiteJsonLd } from "@/lib/seo";
import { ArrowRight, Sparkles, TrendingUp, Zap, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

const nicheGradients = [
  "from-rose-500/20 to-orange-500/10",
  "from-violet-500/20 to-fuchsia-500/10",
  "from-cyan-500/20 to-blue-500/10",
  "from-emerald-500/20 to-teal-500/10",
  "from-amber-500/20 to-yellow-500/10",
  "from-pink-500/20 to-rose-500/10",
  "from-indigo-500/20 to-purple-500/10",
  "from-sky-500/20 to-indigo-500/10",
];

export default async function HomePage() {
  const [latest, trending, categories, publishedCount] = await Promise.all([
    getPublishedArticles({ limit: 7 }),
    getTrendingArticles(5),
    prisma.category.findMany({ orderBy: { name: "asc" }, take: 8 }),
    prisma.article.count({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } } }),
  ]);

  const [featured, ...rest] = latest;

  const websiteLd = websiteJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <section className="hero-mesh relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-accent-secondary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="section-label">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Fresh daily · Expert verified
              </p>
              <p className="mt-6 font-display text-sm font-bold uppercase tracking-[0.2em] text-accent">
                {SITE_NAME}
              </p>
              <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-gradient">Trending news</span>
                <br />
                <span className="text-foreground">& expert guides daily</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Breaking trends, in-depth guides, and honest reviews across finance, tech,
                AI, health, and more — written for real readers.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/blog" className="btn-primary">
                  Read latest <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/categories" className="btn-secondary">
                  Explore niches
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap gap-8 border-t border-border/60 pt-8">
                <div>
                  <p className="font-display text-3xl font-bold text-accent">{categories.length}+</p>
                  <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Niches
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold">{publishedCount}</p>
                  <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Stories
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold">Daily</p>
                  <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Updates
                  </p>
                </div>
              </div>
            </div>

            {featured && (
              <div className="relative hidden lg:block">
                <div className="animate-float">
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
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label w-fit">
              <BookOpen className="h-3.5 w-3.5" />
              Latest
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Hot off the press</h2>
          </div>
          <Link
            href="/blog"
            className="hidden items-center gap-1 text-sm font-semibold text-accent hover:underline sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
            No articles yet. Publish from admin or run the AI cron.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="section-label w-fit">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              Trending
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold">Most read this week</h2>
            <ul className="mt-8 space-y-1">
              {trending.map((a, i) => (
                <li key={a.id}>
                  <Link
                    href={`/blog/${a.slug}`}
                    className="group flex items-start gap-4 rounded-2xl p-4 transition hover:bg-card"
                  >
                    <span className="font-display text-3xl font-bold text-accent/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold leading-snug group-hover:text-accent">{a.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{a.category.name}</p>
                    </div>
                  </Link>
                </li>
              ))}
              {trending.length === 0 && (
                <p className="text-sm text-muted-foreground">Trending posts appear as readers engage.</p>
              )}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-xl">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
            <Zap className="h-8 w-8 text-accent" />
            <h2 className="mt-4 font-display text-2xl font-bold">Never miss a story</h2>
            <p className="mt-2 text-muted-foreground">
              Weekly roundup of our best guides — no spam, unsubscribe anytime.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="section-label w-fit">Browse</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Explore by niche</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`card-elevated group relative overflow-hidden bg-gradient-to-br p-6 ${nicheGradients[i % nicheGradients.length]}`}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-accent">{cat.niche}</p>
              <p className="mt-3 font-display text-lg font-bold group-hover:text-accent">{cat.name}</p>
              <ArrowRight className="mt-4 h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-accent" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
