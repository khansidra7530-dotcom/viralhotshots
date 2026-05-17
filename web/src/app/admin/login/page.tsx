"use client";

import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
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
      setError("Invalid credentials");
      return;
    }
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    if (session?.user?.role !== "ADMIN") {
      await signOut({ redirect: false });
      setError("Admin access only. Use customer sign in.");
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold">Admin Login</h1>
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
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="hover:underline">
            Customer sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
