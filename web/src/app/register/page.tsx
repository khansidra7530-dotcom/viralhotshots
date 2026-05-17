import Link from "next/link";
import { registerAction } from "./actions";

const errors: Record<string, string> = {
  invalid: "Please fill all fields. Password must be at least 8 characters.",
  exists: "This email is already registered.",
  reserved: "This email is reserved.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params.error ? errors[params.error] : null;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <form
        action={registerAction}
        className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold">Create account</h1>
        <input
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your name"
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
        />
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
          minLength={8}
          autoComplete="new-password"
          placeholder="Password (min 8 characters)"
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
        />
        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-accent font-semibold text-accent-foreground"
        >
          Register
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
