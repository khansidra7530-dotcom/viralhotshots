import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/admin/article-editor";

export const dynamic = "force-dynamic";

export default async function AdminArticleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!article) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Article</h1>
      <p className="text-sm text-muted-foreground">SEO Score: {article.seoScore}/100</p>
      <ArticleEditor article={article} />
    </div>
  );
}
