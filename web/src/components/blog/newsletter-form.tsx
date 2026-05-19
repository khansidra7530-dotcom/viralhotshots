"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm({ compact }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "flex gap-2" : "space-y-3"}>
      <div className={compact ? "flex flex-1 gap-2" : "space-y-2"}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none ring-accent/30 focus:ring-2"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-11 shrink-0 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>
      {status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">You&apos;re subscribed!</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
