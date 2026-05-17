import Link from "next/link";
import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NewArticleForm } from "@/components/admin/new-article-form";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  await requireAdminPage();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/admin/articles" className="text-sm text-muted-foreground hover:text-accent">
        ← Back to articles
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New article</h1>
      <NewArticleForm categories={categories} />
    </div>
  );
}
