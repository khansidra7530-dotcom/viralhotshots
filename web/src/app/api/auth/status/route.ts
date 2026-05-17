import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/** Safe auth diagnostics (no secrets exposed). */
export async function GET() {
  const session = await auth();
  return NextResponse.json({
    authSecretConfigured: Boolean(
      process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
    ),
    loggedIn: Boolean(session?.user?.id),
    email: session?.user?.email ?? null,
    role: (session?.user as { role?: string })?.role ?? null,
  });
}
