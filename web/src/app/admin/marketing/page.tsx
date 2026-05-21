import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getMarketingDashboardData } from "@/lib/marketing/agents/analytics-agent";
import { MarketingActions } from "@/components/admin/marketing-actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  await requireAdminPage();

  const [snapshot, trends, socialPosts, researchRuns, optimizations] = await Promise.all([
    getMarketingDashboardData(),
    prisma.trendCandidate.findMany({
      orderBy: { overallScore: "desc" },
      take: 12,
      include: { article: { select: { slug: true, title: true } } },
    }),
    prisma.socialPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { article: { select: { title: true, slug: true } } },
    }),
    prisma.marketingResearchRun.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
    prisma.articleOptimizationRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { article: { select: { title: true, slug: true } } },
    }),
  ]);

  const stats = [
    { label: "Total views", value: snapshot.totalViews.toLocaleString() },
    { label: "Published", value: snapshot.publishedArticles },
    { label: "Avg SEO score", value: snapshot.avgSeoScore },
    { label: "Trend queue", value: snapshot.trendCandidates },
    { label: "Social scheduled", value: snapshot.socialScheduled },
    { label: "Social published", value: snapshot.socialPublished },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">AI Marketing Hub</h1>
        <p className="text-muted-foreground">
          Autonomous trend research, SEO writing, social scheduling, and content optimization.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <MarketingActions cronSecretConfigured={Boolean(process.env.CRON_SECRET)} />

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Top performing articles</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {snapshot.topArticles.map((a) => (
              <li key={a.id} className="flex justify-between gap-3">
                <Link href={`/blog/${a.slug}`} className="hover:text-accent">
                  {a.title}
                </Link>
                <span className="shrink-0 text-muted-foreground">
                  {a.views} views · SEO {a.seoScore}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Trend research queue</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {trends.length === 0 ? (
              <li className="text-muted-foreground">Run trend research to populate.</li>
            ) : (
              trends.map((t) => (
                <li key={t.id} className="border-b border-border/50 pb-2">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.source} · score {t.overallScore.toFixed(1)} · traffic {t.trafficScore.toFixed(1)} ·
                    competition {t.competitionScore.toFixed(1)}
                    {t.article ? ` · → ${t.article.title}` : ""}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Social posts</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {socialPosts.map((p) => (
              <li key={p.id} className="rounded-xl border border-border/60 p-3">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold uppercase text-accent">{p.platform}</span>
                  <span className="text-xs text-muted-foreground">{p.status}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-muted-foreground">{p.content}</p>
                {p.article && (
                  <Link href={`/blog/${p.article.slug}`} className="mt-1 block text-xs hover:text-accent">
                    {p.article.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Agent activity</h2>
          <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Research runs
          </h3>
          <ul className="mt-2 space-y-2 text-sm">
            {researchRuns.map((r) => (
              <li key={r.id}>
                {r.status} · {new Date(r.startedAt).toLocaleString()}
                {r.error ? ` · ${r.error}` : ""}
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Optimizations
          </h3>
          <ul className="mt-2 space-y-2 text-sm">
            {optimizations.map((o) => (
              <li key={o.id}>
                {o.article.title}: {o.beforeScore} → {o.afterScore ?? "—"} ({o.status})
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Agent architecture</p>
        <p className="mt-2">
          Trend Research → Writing → SEO → Social Media → Analytics → Optimization. Configure LLM
          provider, n8n webhook, and Facebook credentials in Settings / environment variables.
        </p>
      </section>
    </div>
  );
}
