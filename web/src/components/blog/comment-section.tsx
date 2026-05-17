"use client";

import { FormEvent, useState } from "react";

type Comment = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

export function CommentSection({
  articleId,
  initialComments,
}: {
  articleId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, name, email, content }),
    });
    if (res.ok) {
      setMessage("Thanks! Your comment is awaiting moderation.");
      setContent("");
    } else {
      setMessage("Could not submit comment.");
    }
  }

  return (
    <section className="mt-12 border-t border-border pt-10">
      <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
      <ul className="mt-6 space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="rounded-xl border border-border bg-card p-4">
            <p className="font-medium">{c.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{c.content}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="h-11 rounded-xl border border-border bg-background px-4 text-sm"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="h-11 rounded-xl border border-border bg-background px-4 text-sm"
          />
        </div>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Your comment"
          rows={4}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground"
        >
          Post Comment
        </button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </form>
    </section>
  );
}
