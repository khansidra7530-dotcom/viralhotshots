"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { startTransition, useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-11 w-11 shrink-0" aria-hidden />;

  function toggleTheme() {
    startTransition(() => {
      setTheme(theme === "dark" ? "light" : "dark");
    });
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
