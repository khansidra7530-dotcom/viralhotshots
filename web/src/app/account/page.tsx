import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Bell, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold">My account</h1>
        <p className="mt-3 text-muted-foreground">
          Sign in to save liked articles and manage your subscriptions.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/login?callbackUrl=/account"
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-border px-6 py-3 text-sm font-semibold hover:bg-muted"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  const userId = session.user.id;

  const [likes, subscriptions] = await Promise.all([
    prisma.articleLike.findMany({
      where: { userId },
      include: { article: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.articleSubscription.findMany({
      where: { userId },
      include: { article: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My account</h1>
          <p className="mt-1 text-muted-foreground">{session.user.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Sign out
          </button>
        </form>
      </div>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Heart className="h-5 w-5 text-red-500" /> Liked articles
        </h2>
        {likes.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            You have not liked any articles yet.{" "}
            <Link href="/blog" className="text-accent hover:underline">
              Browse articles
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {likes.map(({ article, createdAt }) => (
              <li key={article.id} className="rounded-xl border border-border bg-card p-4">
                <Link href={`/blog/${article.slug}`} className="font-medium hover:text-accent">
                  {article.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {article.category.name} · Liked {formatDate(createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Bell className="h-5 w-5 text-accent" /> Subscribed articles
        </h2>
        {subscriptions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Subscribe on any article page to get updates when we publish related content.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {subscriptions.map(({ article, createdAt }) => (
              <li key={article.id} className="rounded-xl border border-border bg-card p-4">
                <Link href={`/blog/${article.slug}`} className="font-medium hover:text-accent">
                  {article.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {article.category.name} · Subscribed {formatDate(createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
