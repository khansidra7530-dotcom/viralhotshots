import { ArticleCard } from "@/components/blog/article-card";
import { getPublishedArticles } from "@/lib/articles";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Search",
  description: "Search articles across all categories.",
  path: "/search",
});

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const articles = query
    ? await getPublishedArticles({ search: query, limit: 24 })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-bold">Search</h1>
      {query ? (
        <p className="mt-2 text-muted-foreground">
          {articles.length} results for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <p className="mt-2 text-muted-foreground">Enter a search term above.</p>
      )}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
