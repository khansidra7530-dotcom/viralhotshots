/** Auth.js v5 required env vars — see https://authjs.dev/getting-started/deployment */
export function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

export function getAuthUrl(): string | undefined {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL
  );
}

export function getAuthConfigProblems(): string[] {
  const problems: string[] = [];
  const secret = getAuthSecret();

  if (!secret) {
    problems.push("AUTH_SECRET is not set");
  } else if (secret === "dev-secret-change-in-production") {
    problems.push("AUTH_SECRET is still the dev placeholder — set a real secret in Vercel");
  }

  const url = getAuthUrl();
  if (!url) {
    problems.push("AUTH_URL or NEXTAUTH_URL is not set");
  } else if (url.includes("localhost") && process.env.VERCEL === "1") {
    problems.push("NEXTAUTH_URL points to localhost on Vercel — use https://viralhotshots.com");
  }

  return problems;
}
