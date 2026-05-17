import { SOCIAL_LINKS } from "@/lib/constants";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const iconMap = {
  x: XIcon,
  facebook: Facebook,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
} as const;

type Props = {
  className?: string;
  iconClassName?: string;
};

export function SocialLinks({ className = "", iconClassName = "h-5 w-5" }: Props) {
  if (!SOCIAL_LINKS.length) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {SOCIAL_LINKS.map((link) => {
        const Icon = iconMap[link.id as keyof typeof iconMap];
        if (!Icon) return null;
        return (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-background/20 bg-background/10 text-background/90 transition hover:border-accent-secondary hover:bg-accent/20 hover:text-accent-secondary"
          >
            <Icon className={iconClassName} />
          </a>
        );
      })}
    </div>
  );
}
