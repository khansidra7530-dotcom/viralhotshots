import Link from "next/link";
import { loginAction } from "./actions";
import { safeCallbackUrl } from "@/lib/safe-callback-url";

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
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <form
        action={loginAction}
        className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Customer account — like articles and subscribe to updates.
        </p>
        {hadBadCallback && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            Admin accounts are not self-registered. Use{" "}
            <Link href="/register" className="font-medium underline">
              customer register
            </Link>{" "}
            or{" "}
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
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
        />
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
        />
        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-accent font-semibold text-accent-foreground"
        >
          Sign in
        </button>
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Register
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/admin/login" className="hover:underline">
            Admin login
          </Link>
        </p>
      </form>
    </div>
  );
}
