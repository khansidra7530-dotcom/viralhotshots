import { NextResponse } from "next/server";

/** Clears NextAuth session cookie (use if stuck in redirect loops). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectTo = url.searchParams.get("redirect") ?? "/register";
  const response = NextResponse.redirect(new URL(redirectTo, url.origin));

  const cookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ];

  for (const name of cookieNames) {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  }

  return response;
}
