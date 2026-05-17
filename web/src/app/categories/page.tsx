import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { NICHES } from "@/lib/constants";
import { ArrowRight } from "lucide-react";

export const metadata = buildMetadata({
  title: "Categories",
  description: "Browse articles by category and niche.",
  path: "/categories",
});

export const dynamic = "force-dynamic";

const nicheGradients = [
  "from-rose-500/20 to-orange-500/10",
  "from-violet-500/20 to-fuchsia-500/10",
  "from-cyan-500/20 to-blue-500/10",
  "from-emerald-500/20 to-teal-500/10",
  "from-amber-500/20 to-yellow-500/10",
  "from-pink-500/20 to-rose-500/10",
];

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHero
        eyebrow="Topics"
        title="Categories"
        description={`Explore content across ${NICHES.length} niches`}
        compact
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`card-elevated group bg-gradient-to-br p-6 ${nicheGradients[i % nicheGradients.length]}`}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-accent">{cat.niche}</p>
              <h2 className="mt-2 font-display text-xl font-bold group-hover:text-accent">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
              )}
              <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                {cat._count.articles} articles
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1 group-hover:text-accent" />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
