"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Category = { id: string; name: string };

export function NewArticleForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        excerpt: form.get("excerpt"),
        metaDescription: form.get("metaDescription"),
        content: form.get("content"),
        categoryId: form.get("categoryId"),
        status: form.get("status"),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not create article");
      return;
    }
    const article = await res.json();
    router.push(`/admin/articles/${article.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-3xl space-y-4">
      <input
        name="title"
        required
        placeholder="Title"
        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-lg font-semibold"
      />
      <textarea
        name="excerpt"
        required
        rows={2}
        placeholder="Excerpt"
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
      />
      <input
        name="metaDescription"
        required
        maxLength={160}
        placeholder="Meta description (max 160 chars)"
        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
      />
      <select
        name="categoryId"
        required
        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        name="status"
        defaultValue="DRAFT"
        className="h-11 rounded-xl border border-border bg-background px-4 text-sm"
      >
        <option value="DRAFT">Draft</option>
        <option value="PENDING">Pending</option>
        <option value="PUBLISHED">Published</option>
      </select>
      <textarea
        name="content"
        required
        rows={16}
        placeholder="Article content (Markdown)"
        className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground"
      >
        {saving ? "Creating…" : "Create article"}
      </button>
    </form>
  );
}
