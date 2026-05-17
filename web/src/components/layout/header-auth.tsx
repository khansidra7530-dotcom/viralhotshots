import Link from "next/link";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

export async function HeaderAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/login"
          className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          Sign in
        </Link>
        <Link href="/register" className="btn-primary !px-4 !py-2 text-xs">
          Join free
        </Link>
      </div>
    );
  }

  if (isAdminRole(session.user.role)) {
    return (
      <Link
        href="/admin"
        className="shrink-0 rounded-full border border-border bg-muted px-4 py-2 text-sm font-semibold transition hover:border-accent/40"
      >
        Admin
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      title="Your profile"
      className="shrink-0 rounded-full border border-border bg-muted px-4 py-2 text-sm font-semibold transition hover:border-accent/40"
    >
      Profile
    </Link>
  );
}
