import Link from "next/link";
import { SearchBar } from "@/components/search/search-bar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const nav = [
  { href: "/blog", label: "Articles" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground">
              VH
            </span>
            <div>
              <span className="block text-lg font-bold uppercase tracking-wide group-hover:text-accent">
                {SITE_NAME}
              </span>
              <span className="block text-xs font-medium text-muted-foreground">
                {SITE_TAGLINE}
              </span>
            </div>
          </Link>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center gap-3 sm:max-w-md md:ml-auto">
          <SearchBar className="flex-1" />
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
