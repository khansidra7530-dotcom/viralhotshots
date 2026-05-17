import { prisma } from "@/lib/prisma";
import { NICHES } from "@/lib/constants";
import type { Category, Niche } from "@/generated/prisma/client";

/** Fixed order — cron publishes one niche per run, then moves to the next. */
export const CRON_NICHE_ORDER: Niche[] = NICHES.map((n) => n.value as Niche);

export type CategoryPickResult = {
  category: Category;
  niche: Niche;
  rotationIndex: number;
  rotationTotal: number;
  rotationLabel: string;
};

async function categoryByNiche(niche: Niche): Promise<Category | null> {
  return prisma.category.findFirst({ where: { niche } });
}

/** Next niche in line after the most recently created article (round-robin). */
export async function pickCategoryForCron(forcedNiche?: Niche): Promise<CategoryPickResult> {
  const total = CRON_NICHE_ORDER.length;

  if (forcedNiche) {
    const category = await categoryByNiche(forcedNiche);
    if (!category) throw new Error(`No category for niche ${forcedNiche}. Run db:seed`);
    const rotationIndex = CRON_NICHE_ORDER.indexOf(forcedNiche) + 1;
    return {
      category,
      niche: forcedNiche,
      rotationIndex,
      rotationTotal: total,
      rotationLabel: `${rotationIndex}/${total} · ${forcedNiche}`,
    };
  }

  const lastArticle = await prisma.article.findFirst({
    orderBy: { createdAt: "desc" },
    select: { category: { select: { niche: true } } },
  });

  const lastNiche = lastArticle?.category.niche;
  const lastIndex = lastNiche ? CRON_NICHE_ORDER.indexOf(lastNiche) : -1;
  const nextIndex = (lastIndex + 1) % total;

  for (let offset = 0; offset < total; offset++) {
    const niche = CRON_NICHE_ORDER[(nextIndex + offset) % total];
    const category = await categoryByNiche(niche);
    if (category) {
      const rotationIndex = ((nextIndex + offset) % total) + 1;
      return {
        category,
        niche,
        rotationIndex,
        rotationTotal: total,
        rotationLabel: `${rotationIndex}/${total} · ${niche}`,
      };
    }
  }

  throw new Error("No categories in database. Run npm run db:seed");
}

/** All categories in niche order (for batch publish). */
export async function pickAllCategoriesInOrder(): Promise<CategoryPickResult[]> {
  const results: CategoryPickResult[] = [];
  for (let i = 0; i < CRON_NICHE_ORDER.length; i++) {
    const niche = CRON_NICHE_ORDER[i];
    const category = await categoryByNiche(niche);
    if (category) {
      results.push({
        category,
        niche,
        rotationIndex: i + 1,
        rotationTotal: CRON_NICHE_ORDER.length,
        rotationLabel: `${i + 1}/${CRON_NICHE_ORDER.length} · ${niche}`,
      });
    }
  }
  if (results.length === 0) {
    throw new Error("No categories in database. Run db:seed");
  }
  return results;
}
