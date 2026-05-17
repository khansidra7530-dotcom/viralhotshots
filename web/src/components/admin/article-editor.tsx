"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleFeaturedImagePicker } from "@/components/admin/article-featured-image-picker";

type Article = {
  id: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  content: string;
  status: string;
  slug: string;
  featuredImage: string | null;
  featuredImagePrompt: string | null;
  category: { niche: string; name: string };
};

export function ArticleEditor({ article }: { article: Article }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: article.title,
    excerpt: article.excerpt,
    metaDescription: article.metaDescription,
    content: article.content,
    status: article.status,
    featuredImage: article.featuredImage,
    featuredImagePrompt: article.featuredImagePrompt,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    router.refresh();
  }

  async function publish() {
    const payload = { ...form, status: "PUBLISHED" };
    setForm(payload);
    await fetch(`/api/admin/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this article permanently?")) return;
    await fetch(`/api/admin/articles/${article.id}`, { method: "DELETE" });
    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <ArticleFeaturedImagePicker
        articleId={article.id}
        niche={article.category.niche}
        title={form.title}
        featuredImage={form.featuredImage}
        featuredImagePrompt={form.featuredImagePrompt}
        onChange={(featuredImage, featuredImagePrompt) =>
          setForm((f) => ({
            ...f,
            featuredImage,
            featuredImagePrompt: featuredImagePrompt ?? f.featuredImagePrompt,
          }))
        }
      />

      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-lg font-semibold"
      />
      <textarea
        value={form.excerpt}
        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        rows={2}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
        placeholder="Excerpt"
      />
      <input
        value={form.metaDescription}
        onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
        placeholder="Meta description"
      />
      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        className="h-11 rounded-xl border border-border bg-background px-4 text-sm"
      >
        <option value="DRAFT">Draft</option>
        <option value="PENDING">Pending</option>
        <option value="PUBLISHED">Published</option>
        <option value="SCHEDULED">Scheduled</option>
      </select>
      <textarea
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        rows={20}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm"
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-muted px-6 py-2.5 text-sm font-semibold"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={publish}
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground"
        >
          Approve & Publish
        </button>
        <a
          href={`/blog/${article.slug}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-border px-6 py-2.5 text-sm"
        >
          Preview
        </a>
        <button
          type="button"
          onClick={remove}
          className="rounded-xl border border-red-300 px-6 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
