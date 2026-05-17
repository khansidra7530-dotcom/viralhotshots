import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  await requireAdminPage();

  const articles = await prisma.article.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Articles</h1>
        <div className="flex gap-4">
          <Link
            href="/admin/articles/new"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            New article
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-accent">
            View site →
          </Link>
        </div>
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">SEO</th>
              <th className="p-4">Views</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-border/50">
                <td className="p-4">
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="font-medium hover:text-accent"
                  >
                    {a.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{a.category.name}</p>
                </td>
                <td className="p-4">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {a.status}
                  </span>
                </td>
                <td className="p-4">{a.seoScore}/100</td>
                <td className="p-4">{a.viewCount}</td>
                <td className="p-4 text-muted-foreground">
                  {formatDate(a.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
