import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthConfigProblems, getAuthSecret, getAuthUrl } from "@/lib/auth-env";

export async function GET() {
  const session = await auth();
  const problems = getAuthConfigProblems();

  return NextResponse.json({
    ok: problems.length === 0,
    problems,
    authSecretConfigured: Boolean(getAuthSecret()),
    authUrl: getAuthUrl() ?? null,
    loggedIn: Boolean(session?.user?.id),
    email: session?.user?.email ?? null,
    role: (session?.user as { role?: string })?.role ?? null,
  });
}
