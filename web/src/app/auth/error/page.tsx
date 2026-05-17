import Link from "next/link";
import { getAuthConfigProblems } from "@/lib/auth-env";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const configProblems = getAuthConfigProblems();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Sign-in unavailable</h1>
      <p className="mt-3 text-muted-foreground">
        Authentication is not configured correctly on the server.
        {params.error && (
          <span className="mt-2 block text-sm">Error code: {params.error}</span>
        )}
      </p>

      {configProblems.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-semibold">Fix in Vercel → Settings → Environment Variables:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {configProblems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="mt-3">
            Required: <code className="text-xs">AUTH_SECRET</code>,{" "}
            <code className="text-xs">AUTH_URL</code> or{" "}
            <code className="text-xs">NEXTAUTH_URL</code> ={" "}
            <code className="text-xs">https://viralhotshots.com</code>
          </p>
          <p className="mt-2 text-xs">Then redeploy the project.</p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium">
          Home
        </Link>
        <Link
          href="/api/auth/status"
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium"
        >
          Auth status (JSON)
        </Link>
      </div>
    </div>
  );
}
