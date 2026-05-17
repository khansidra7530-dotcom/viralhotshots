import Link from "next/link";
import { Flame } from "lucide-react";
import { loginAction } from "./actions";
import { safeCallbackUrl } from "@/lib/safe-callback-url";
import { SITE_NAME } from "@/lib/constants";

const errors: Record<string, string> = {
  credentials: "Invalid email or password.",
  missing: "Email and password are required.",
  created: "Account created. Please sign in.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params.error ? errors[params.error] : null;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  const hadBadCallback =
    params.callbackUrl?.includes("/admin/register") ?? false;

  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <div className="hero-mesh relative hidden flex-col justify-between border-r border-border p-12 lg:flex">
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-secondary">
            <Flame className="h-6 w-6 text-accent-foreground" />
          </span>
          <h2 className="mt-8 font-display text-3xl font-bold">{SITE_NAME}</h2>
          <p className="mt-4 max-w-sm text-muted-foreground">
            Save articles, subscribe to topics, and get the stories that matter.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Join thousands of curious readers.</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <form
          action={loginAction}
          className="w-full max-w-md space-y-5 rounded-3xl border border-border bg-card p-8 shadow-xl"
        >
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to like articles and manage your subscriptions.
          </p>
          {hadBadCallback && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Admin accounts use{" "}
              <Link href="/admin/login" className="font-medium underline">
                admin login
              </Link>
              .
            </p>
          )}
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
          <button type="submit" className="btn-primary h-12 w-full justify-center">
            Sign in
          </button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="font-semibold text-accent hover:underline">
              Register free
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
