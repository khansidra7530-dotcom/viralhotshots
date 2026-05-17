import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { resolveAvatarUrl } from "@/lib/avatar";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ProfileEditor } from "@/components/account/profile-editor";
import { SavedArticleCard } from "@/components/account/saved-article-card";
import { Bell, Heart, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold">My profile</h1>
        <p className="mt-3 text-muted-foreground">
          Sign in to manage your profile, likes, and subscriptions.
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

  const [user, likes, subscriptions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, bio: true, avatar: true, createdAt: true },
    }),
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

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Account not found.</p>
        <Link href="/login" className="mt-4 inline-block text-accent hover:underline">
          Sign in again
        </Link>
      </div>
    );
  }

  const avatarUrl = resolveAvatarUrl(user.name, user.avatar);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold">My profile</h1>
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

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-6">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-accent/30">
            <Image
              src={avatarUrl}
              alt={user.name}
              fill
              className="object-cover"
              unoptimized={avatarUrl.includes("ui-avatars.com")}
            />
          </div>
          <div>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
        <ProfileEditor profile={user} />
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-3xl font-bold text-red-500">{likes.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">Liked articles</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-3xl font-bold text-accent">{subscriptions.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">Subscriptions</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <Link href="/blog" className="text-sm font-semibold text-accent hover:underline">
            Browse all articles →
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Heart className="h-5 w-5 text-red-500" /> Liked articles
        </h2>
        {likes.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No likes yet. Open an article and tap <strong>Like</strong>.{" "}
            <Link href="/blog" className="text-accent hover:underline">
              Browse articles
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {likes.map(({ article, createdAt }) => (
              <SavedArticleCard
                key={article.id}
                slug={article.slug}
                title={article.title}
                excerpt={article.excerpt}
                featuredImage={article.featuredImage}
                categoryName={article.category.name}
                publishedAt={article.publishedAt}
                readingTimeMinutes={article.readingTimeMinutes}
                savedAt={createdAt}
                badge="Liked"
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Bell className="h-5 w-5 text-accent" /> Subscribed articles
        </h2>
        {subscriptions.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No subscriptions yet. On any article page, tap <strong>Subscribe</strong> for updates.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {subscriptions.map(({ article, createdAt }) => (
              <SavedArticleCard
                key={article.id}
                slug={article.slug}
                title={article.title}
                excerpt={article.excerpt}
                featuredImage={article.featuredImage}
                categoryName={article.category.name}
                publishedAt={article.publishedAt}
                readingTimeMinutes={article.readingTimeMinutes}
                savedAt={createdAt}
                badge="Subscribed"
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
