import { NextRequest } from "next/server";

export function authorizeCron(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;
  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;
  return req.nextUrl.searchParams.get("secret") === cronSecret;
}
