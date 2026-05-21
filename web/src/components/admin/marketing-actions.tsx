"use client";

import { useState } from "react";

type Props = {
  cronSecretConfigured: boolean;
};

export function MarketingActions({ cronSecretConfigured }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");

  async function run(path: string, label: string) {
    if (!cronSecretConfigured) {
      setResult("Set CRON_SECRET in .env to trigger agents from admin.");
      return;
    }
    const secret = prompt("Enter CRON_SECRET to run this agent:");
    if (!secret) return;

    setLoading(label);
    setResult("");
    try {
      const res = await fetch(`${path}?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Request failed");
    } finally {
      setLoading(null);
    }
  }

  const buttons = [
    { label: "Run daily pipeline", path: "/api/cron/marketing" },
    { label: "Research trends", path: "/api/cron/research-trends" },
    { label: "Publish social", path: "/api/cron/social-publish" },
    { label: "Optimize articles", path: "/api/cron/optimize" },
    { label: "Generate article only", path: "/api/cron/generate" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-semibold">Run agents manually</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Triggers the same cron endpoints Vercel uses. Requires your CRON_SECRET.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {buttons.map((b) => (
          <button
            key={b.path}
            type="button"
            disabled={loading !== null}
            onClick={() => run(b.path, b.label)}
            className="rounded-full border border-border bg-muted/50 px-4 py-2 text-sm font-medium transition hover:border-accent/40 disabled:opacity-50"
          >
            {loading === b.label ? "Running…" : b.label}
          </button>
        ))}
      </div>
      {result && (
        <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-muted/40 p-4 text-xs">{result}</pre>
      )}
    </div>
  );
}
