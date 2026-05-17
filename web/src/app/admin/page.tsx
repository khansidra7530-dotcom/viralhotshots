import { requireAdminPage } from "@/lib/auth-helpers";
import { FIXED_ADMIN } from "@/lib/admin-constants";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await requireAdminPage();

  const [articleCount, pendingCount, customerCount, subscriberCount, topArticles, cronLogs] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.newsletterSubscriber.count(),
      prisma.article.findMany({
        orderBy: { viewCount: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, viewCount: true, seoScore: true },
      }),
      prisma.cronLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
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

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Recent AI cron jobs</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cronLogs.length === 0 ? (
              <li className="text-muted-foreground">No cron runs yet.</li>
            ) : (
              cronLogs.map((log) => (
                <li key={log.id} className="flex justify-between gap-2 border-b border-border/50 pb-2">
                  <span className={log.status === "error" ? "text-red-600" : ""}>
                    {log.message ?? log.status}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
