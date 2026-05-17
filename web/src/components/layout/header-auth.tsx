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
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground"
        >
          Register
        </Link>
      </div>
    );
  }

  if (isAdminRole(session.user.role)) {
    return (
      <Link
        href="/admin"
        className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
      >
        Admin
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      title="Your profile"
      className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
    >
      My profile
    </Link>
  );
}
