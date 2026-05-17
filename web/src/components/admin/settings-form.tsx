"use client";

import { useState } from "react";
// import { NICHES } from "@/lib/constants"; // used by AI settings (disabled)

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
      {/* AI / cron settings disabled for deploy-only mode
      <label className="block text-sm">
        Default niche for AI generation
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
        Auto-publish AI articles
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.cronEnabled}
          onChange={(e) => setForm({ ...form, cronEnabled: e.target.checked })}
        />
        Enable cron generation
      </label>
      <label className="block text-sm">
        OpenAI model
        <input
          value={form.openaiModel}
          onChange={(e) => setForm({ ...form, openaiModel: e.target.value })}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-4"
        />
      </label>
      */}
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
