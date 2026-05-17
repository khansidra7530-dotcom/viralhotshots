import { requireAdminPage } from "@/lib/auth-helpers";
import { FIXED_ADMIN } from "@/lib/admin-constants";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await requireAdminPage();

  const [articleCount, pendingCount, customerCount, subscriberCount, topArticles] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.newsletterSubscriber.count(),
      // prisma.cronLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.article.findMany({
        orderBy: { viewCount: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, viewCount: true, seoScore: true },
      }),
    ]);

  const stats = [
    { label: "Total Articles", value: articleCount },
    { label: "Pending Review", value: pendingCount },
    { label: "Customers", value: customerCount },
    { label: "Newsletter Subscribers", value: subscriberCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome back, {session.user?.name}</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Fixed admin account
        </p>
        <p className="mt-2 font-semibold">{FIXED_ADMIN.name}</p>
        <p className="text-sm text-muted-foreground">{FIXED_ADMIN.email}</p>
        <p className="mt-2 text-sm text-muted-foreground">{FIXED_ADMIN.bio}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Top articles by views</h2>
          <ul className="mt-4 space-y-3">
            {topArticles.map((a) => (
              <li key={a.id} className="flex justify-between text-sm">
                <Link href={`/admin/articles/${a.id}`} className="hover:text-accent">
                  {a.title}
                </Link>
                <span className="text-muted-foreground">
                  {a.viewCount} views · SEO {a.seoScore}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Cron log section disabled for deploy-only mode
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Recent cron jobs</h2>
          ...
        </section>
        */}
      </div>
    </div>
  );
}
