import { ArticleCard } from "@/components/blog/article-card";
import { PageHero } from "@/components/ui/page-hero";
import { getPublishedArticles } from "@/lib/articles";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "All Articles",
  description: "Browse all published guides, reviews, and expert articles.",
  path: "/blog",
});

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const articles = await getPublishedArticles({ limit: 24 });

  return (
    <>
      <PageHero
        eyebrow="Archive"
        title="All articles"
        description="Expert guides across every category — updated daily."
        compact
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard
              key={a.id}
              slug={a.slug}
              title={a.title}
              excerpt={a.excerpt}
              featuredImage={a.featuredImage}
              category={a.category}
              publishedAt={a.publishedAt}
              readingTimeMinutes={a.readingTimeMinutes}
            />
          ))}
        </div>
      </div>
    </>
  );
}
