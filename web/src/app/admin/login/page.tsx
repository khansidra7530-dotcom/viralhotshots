import Link from "next/link";
import { adminLoginAction } from "./actions";

const errors: Record<string, string> = {
  credentials: "Invalid credentials.",
  notadmin: "Admin access only. Use customer sign in at /login.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params.error ? errors[params.error] : null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form
        action={adminLoginAction}
        className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold">Admin Login</h1>
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
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="hover:underline">
            Customer sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
