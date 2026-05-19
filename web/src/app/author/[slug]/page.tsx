import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/blog/article-card";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const users = await prisma.user.findMany({
    where: { articles: { some: { status: "PUBLISHED" } } },
    include: {
      articles: {
        where: { status: "PUBLISHED" },
        include: { category: true },
        orderBy: { publishedAt: "desc" },
        take: 12,
      },
    },
  });

  const author = users.find((u) => slugify(u.name) === slug || u.id === slug);
  if (!author) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-bold">{author.name}</h1>
      {author.bio && <p className="mt-4 max-w-2xl text-muted-foreground">{author.bio}</p>}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {author.articles.map((a) => (
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

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return buildMetadata({
    title: "Author",
    description: "Articles by our editorial team.",
    path: `/author/${slug}`,
  });
}
