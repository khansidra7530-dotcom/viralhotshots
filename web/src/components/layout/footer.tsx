import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { SocialLinks } from "@/components/layout/social-links";
import { Flame } from "lucide-react";

const footerLinks = {
  Explore: [
    { href: "/blog", label: "All Articles" },
    { href: "/categories", label: "Categories" },
    { href: "/search", label: "Search" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/author/editorial-team", label: "Authors" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
  ],
};

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border bg-foreground text-background">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-accent-secondary/10" />
      <div className="relative mx-auto w-full max-w-screen-2xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-secondary">
                <Flame className="h-5 w-5 text-accent-foreground" />
              </span>
              <span className="font-display text-lg font-bold">{SITE_NAME}</span>
            </Link>
            <p className="mt-4 text-sm text-background/70">
              Trending stories and expert guides — fresh every day.
            </p>
            <SocialLinks className="mt-6" />
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-background/50">
                {title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-background/80 transition hover:text-accent-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 border-t border-background/10 pt-8 text-center text-xs text-background/50">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
