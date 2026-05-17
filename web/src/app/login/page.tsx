import Link from "next/link";
import { loginAction } from "./actions";

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
  const callbackUrl = params.callbackUrl ?? "/account";

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
