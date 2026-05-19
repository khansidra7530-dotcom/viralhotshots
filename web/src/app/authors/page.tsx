import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { slugify } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Authors",
  description: "Meet the writers behind our guides, reviews, and trending news coverage.",
  path: "/authors",
});

export const dynamic = "force-dynamic";

export default async function AuthorsPage() {
  const authors = await prisma.user.findMany({
    where: {
      articles: { some: { status: "PUBLISHED" } },
    },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
      _count: {
        select: {
          articles: { where: { status: "PUBLISHED" } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold">Authors</h1>
      <p className="mt-3 text-muted-foreground">
        Writers and editors publishing guides across finance, tech, AI, health, and more.
      </p>

      <ul className="mt-10 space-y-6">
        {authors.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No published authors yet.
          </li>
        ) : (
          authors.map((author) => (
            <li key={author.id}>
              <Link
                href={`/author/${slugify(author.name)}`}
                className="block rounded-2xl border border-border bg-card p-6 transition hover:border-accent/40"
              >
                <h2 className="font-display text-xl font-semibold">{author.name}</h2>
                {author.bio && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{author.bio}</p>
                )}
                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-accent">
                  {author._count.articles} published{" "}
                  {author._count.articles === 1 ? "article" : "articles"}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
