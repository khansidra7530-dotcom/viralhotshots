import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
  compact,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "hero-mesh relative overflow-hidden border-b border-border",
        compact ? "py-12 sm:py-14" : "py-16 sm:py-20 lg:py-24",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-accent-secondary/15 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {eyebrow && <p className="section-label mb-4 w-fit">{eyebrow}</p>}
        <h1
          className={cn(
            "font-display font-bold tracking-tight",
            compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl lg:text-6xl"
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
