import { prisma } from "@/lib/prisma";
import type { Category } from "@/generated/prisma/client";

/** Rotate categories — pick the one with the oldest (or no) AI article. */
export async function pickCategoryForCron(): Promise<Category> {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  if (categories.length === 0) {
    throw new Error("No categories in database. Run npm run db:seed");
  }

  let chosen = categories[0];
  let oldest = new Date(0);

  for (const cat of categories) {
    const last = await prisma.article.findFirst({
      where: { categoryId: cat.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    const t = last?.createdAt ?? new Date(0);
    if (t < oldest) {
      oldest = t;
      chosen = cat;
    }
  }

  return chosen;
}
