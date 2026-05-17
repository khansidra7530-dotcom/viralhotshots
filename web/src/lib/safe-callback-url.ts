/** Only allow same-site relative paths for customer sign-in redirects. */
export function safeCallbackUrl(raw: string | null | undefined): string {
  const fallback = "/account";
  if (!raw) return fallback;

  let path = raw.trim();

  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      path = url.pathname + url.search;
    } catch {
      return fallback;
    }
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  if (path === "/admin/register" || path.startsWith("/admin/register/")) {
    return "/account";
  }

  if (path.startsWith("/admin")) {
    return "/account";
  }

  return path;
}
