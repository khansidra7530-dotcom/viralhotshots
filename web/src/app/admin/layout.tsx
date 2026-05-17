import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";
import {
  BarChart3,
  FileText,
  Link2,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/affiliates", label: "Affiliates", icon: Link2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-6 lg:block">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-accent" />
            Admin
          </Link>
          <nav className="mt-8 space-y-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
            className="mt-8"
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </aside>
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
