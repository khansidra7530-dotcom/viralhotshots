import Link from "next/link";
import { HeaderAuth } from "@/components/layout/header-auth";
import { SearchBar } from "@/components/search/search-bar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SITE_NAME } from "@/lib/constants";
import { Flame, Search } from "lucide-react";

const nav = [
  { href: "/blog", label: "Articles" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 lg:bg-background/70 lg:backdrop-blur-xl lg:backdrop-saturate-150">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="relative flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-secondary shadow-lg shadow-accent/25 transition group-hover:scale-105 group-hover:shadow-accent/40">
            <Flame className="h-5 w-5 text-accent-foreground" strokeWidth={2.5} />
          </span>
          <span className="hidden font-display text-xl font-bold tracking-tight sm:block">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <Link
            href="/search"
            className="inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-border bg-card text-foreground sm:hidden"
            aria-label="Search articles"
          >
            <Search className="h-5 w-5" />
          </Link>
          <SearchBar className="hidden max-w-xs flex-1 sm:flex lg:max-w-sm" />
          <HeaderAuth />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-t border-border/40 px-4 py-2 lg:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex min-h-11 shrink-0 touch-manipulation items-center rounded-full bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
