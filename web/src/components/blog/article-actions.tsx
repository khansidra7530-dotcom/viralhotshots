"use client";

import { Bell, BellOff, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Props = {
  articleId: string;
  isLoggedIn: boolean;
};

export function ArticleActions({ articleId, isLoggedIn }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/articles/${articleId}/engagement`);
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setSubscribed(data.subscribed);
      setLikeCount(data.likeCount);
    }
    setLoading(false);
  }, [articleId]);

  useEffect(() => {
    const run = () => load();
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(run, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(run, 100);
    return () => clearTimeout(t);
  }, [load]);

  function requireLogin() {
    router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
  }

  async function toggleLike() {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    const res = await fetch(`/api/articles/${articleId}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    }
  }

  async function toggleSubscribe() {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    const res = await fetch(`/api/articles/${articleId}/subscribe`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setSubscribed(data.subscribed);
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggleLike}
        disabled={loading}
        className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
          liked
            ? "border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
            : "border-border bg-card hover:bg-muted"
        }`}
      >
        <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        {loading ? "…" : liked ? "Liked" : "Like"}
        {likeCount > 0 && <span className="text-muted-foreground">({likeCount})</span>}
      </button>
      <button
        type="button"
        onClick={toggleSubscribe}
        disabled={loading}
        className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
          subscribed
            ? "border-accent bg-accent/10 text-accent"
            : "border-border bg-card hover:bg-muted"
        }`}
      >
        {subscribed ? (
          <>
            <BellOff className="h-4 w-4" /> Subscribed
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" /> Subscribe
          </>
        )}
      </button>
      {!isLoggedIn && (
        <p className="text-xs text-muted-foreground">
          <Link href="/register" className="text-accent hover:underline">
            Create an account
          </Link>{" "}
          to like and subscribe.
        </p>
      )}
    </div>
  );
}
