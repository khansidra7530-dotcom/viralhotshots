"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account";
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    window.location.href = callbackUrl;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8 shadow-lg"
    >
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="text-sm text-muted-foreground">
        Customer account — like articles and subscribe to updates.
      </p>
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Password"
        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
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
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
