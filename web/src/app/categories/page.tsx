import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { NICHES } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "Categories",
  description: "Browse articles by category and niche.",
  path: "/categories",
});

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-bold">Categories</h1>
      <p className="mt-2 text-muted-foreground">
        Explore content across {NICHES.length} niches
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="rounded-2xl border border-border bg-card p-6 transition hover:border-accent/50"
          >
            <p className="text-xs font-semibold uppercase text-accent">{cat.niche}</p>
            <h2 className="mt-2 text-xl font-semibold">{cat.name}</h2>
            {cat.description && (
              <p className="mt-2 text-sm text-muted-foreground">{cat.description}</p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              {cat._count.articles} articles
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
