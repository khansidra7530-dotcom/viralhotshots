"use client";

import { Link2, Share2 } from "lucide-react";
import { absoluteUrl } from "@/lib/utils";

export function SocialShare({ title, slug }: { title: string; slug: string }) {
  const url = absoluteUrl(`/blog/${slug}`);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
  }

  const links = [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Share</span>
      {links.map(({ label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center justify-center rounded-full border border-border px-3 text-xs font-medium transition hover:bg-muted"
          aria-label={`Share on ${label}`}
        >
          {label}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition hover:bg-muted"
        aria-label="Copy link"
      >
        <Link2 className="h-4 w-4" />
      </button>
      <Share2 className="hidden" aria-hidden />
    </div>
  );
}
