"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={onSubmit} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search articles..."
        className="h-10 w-full rounded-full border border-border bg-muted/50 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-accent/50 focus:bg-card focus:ring-2 focus:ring-accent/20"
      />
    </form>
  );
}
