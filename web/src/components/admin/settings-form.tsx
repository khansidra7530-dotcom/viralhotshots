"use client";

import { useState } from "react";
import { NICHES } from "@/lib/constants";

type Settings = {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  defaultNiche: string;
  autoPublish: boolean;
  cronEnabled: boolean;
  amazonAssociateTag: string | null;
  openaiModel: string;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-xl space-y-4">
      <label className="block text-sm">
        Site name
        <input
          value={form.siteName}
          onChange={(e) => setForm({ ...form, siteName: e.target.value })}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-4"
        />
      </label>
      <label className="block text-sm">
        Site URL
        <input
          value={form.siteUrl}
          onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-4"
        />
      </label>
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
        <p className="text-sm font-semibold">AI article cron</p>
        <p className="text-xs text-muted-foreground">
          Publishes 1000+ word EEAT articles with news sources, SEO, images, and optional affiliates.
        </p>
        <label className="block text-sm">
          Default niche (fallback; cron rotates all categories)
          <select
            value={form.defaultNiche}
            onChange={(e) => setForm({ ...form, defaultNiche: e.target.value })}
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-4"
          >
            {NICHES.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.autoPublish}
            onChange={(e) => setForm({ ...form, autoPublish: e.target.checked })}
          />
          Auto-publish AI articles (live immediately)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.cronEnabled}
            onChange={(e) => setForm({ ...form, cronEnabled: e.target.checked })}
          />
          Enable scheduled cron (every 4 hours UTC)
        </label>
        <label className="block text-sm">
          AI model
          <input
            value={form.openaiModel}
            onChange={(e) => setForm({ ...form, openaiModel: e.target.value })}
            placeholder="llama-3.3-70b-versatile or gemini-2.0-flash"
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-4"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Groq (free): llama-3.3-70b-versatile · Gemini (free): gemini-2.0-flash
          </span>
        </label>
      </div>
      <button
        type="submit"
        className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground"
      >
        Save settings
      </button>
      {saved && <p className="text-sm text-green-600">Saved!</p>}
    </form>
  );
}
