import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/blog/article-card";
import { prisma } from "@/lib/prisma";
import { getPublishedArticles } from "@/lib/articles";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return {};
  return buildMetadata({
    title: `${cat.name} Articles`,
    description: cat.description ?? `Expert ${cat.name} guides and reviews.`,
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const articles = await getPublishedArticles({ categorySlug: slug, limit: 24 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase text-accent">{category.niche}</p>
      <h1 className="mt-2 font-serif text-4xl font-bold">{category.name}</h1>
      {category.description && (
        <p className="mt-4 max-w-2xl text-muted-foreground">{category.description}</p>
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
