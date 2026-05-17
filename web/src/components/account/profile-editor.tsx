"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { resolveAvatarUrl } from "@/lib/avatar";

type Profile = {
  name: string;
  email: string;
  bio: string | null;
  avatar: string | null;
};

export function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: profile.name,
    bio: profile.bio ?? "",
    avatar: profile.avatar ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const previewUrl = resolveAvatarUrl(form.name || profile.name, form.avatar || null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        bio: form.bio || null,
        avatar: form.avatar || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setMessage("Could not save profile. Check avatar URL is valid.");
      return;
    }
    setMessage("Profile saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-border ring-2 ring-accent/20">
          <Image
            src={previewUrl}
            alt={form.name}
            fill
            className="object-cover"
            unoptimized={previewUrl.includes("ui-avatars.com")}
          />
        </div>
        <div className="w-full flex-1 space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Display name"
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-semibold"
          />
          <input
            value={form.avatar}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            placeholder="Profile picture URL (optional)"
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
          />
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={2}
            maxLength={300}
            placeholder="Short bio (optional)"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
          />
        </div>
      </div>
      {message && (
        <p className={`text-sm ${message.includes("saved") ? "text-accent" : "text-red-600"}`}>
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
