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
  marketingEnabled: boolean;
  autoSocialEnabled: boolean;
  autoOptimizeEnabled: boolean;
  preferredLlm: string;
  n8nWebhookUrl: string | null;
  amazonAssociateTag: string | null;
  aiModel: string;
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
          Groq model
          <input
            value={form.aiModel}
            onChange={(e) => setForm({ ...form, aiModel: e.target.value })}
            placeholder="llama-3.3-70b-versatile"
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-4"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Free at console.groq.com — default: llama-3.3-70b-versatile
          </span>
        </label>
      </div>
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
        <p className="text-sm font-semibold">AI marketing automation</p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.marketingEnabled}
            onChange={(e) => setForm({ ...form, marketingEnabled: e.target.checked })}
          />
          Enable daily marketing pipeline
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.autoSocialEnabled}
            onChange={(e) => setForm({ ...form, autoSocialEnabled: e.target.checked })}
          />
          Auto-generate & schedule social posts on publish
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.autoOptimizeEnabled}
            onChange={(e) => setForm({ ...form, autoOptimizeEnabled: e.target.checked })}
          />
          Auto-optimize stale / low-SEO articles weekly
        </label>
        <label className="block text-sm">
          Preferred LLM
          <select
            value={form.preferredLlm}
            onChange={(e) => setForm({ ...form, preferredLlm: e.target.value })}
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-4"
          >
            <option value="groq">Groq (default)</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Claude (Anthropic)</option>
          </select>
        </label>
        <label className="block text-sm">
          n8n webhook URL (social publish for X/LinkedIn/Reddit)
          <input
            value={form.n8nWebhookUrl ?? ""}
            onChange={(e) => setForm({ ...form, n8nWebhookUrl: e.target.value || null })}
            placeholder="https://your-n8n.app/webhook/..."
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-4"
          />
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
