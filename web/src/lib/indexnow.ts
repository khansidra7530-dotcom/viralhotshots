import { SITE_URL } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_KEY_PATH = "/indexnow-key.txt";

export function getIndexNowKey(): string | undefined {
  return process.env.INDEXNOW_KEY?.trim() || undefined;
}

export function isIndexNowEnabled(): boolean {
  return Boolean(getIndexNowKey());
}

export function getIndexNowKeyLocation(): string {
  return absoluteUrl(INDEXNOW_KEY_PATH, SITE_URL);
}

/** Notify Bing, Yandex, and other IndexNow partners about new or updated URLs. */
export async function notifyIndexNow(urls: string[]): Promise<{
  ok: boolean;
  submitted: number;
  skipped?: string;
  status?: number;
}> {
  const key = getIndexNowKey();
  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];

  if (!key) {
    return { ok: false, submitted: 0, skipped: "INDEXNOW_KEY not configured" };
  }
  if (unique.length === 0) {
    return { ok: true, submitted: 0, skipped: "No URLs to submit" };
  }

  const host = new URL(SITE_URL).host;

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: getIndexNowKeyLocation(),
        urlList: unique.slice(0, 10_000),
      }),
      cache: "no-store",
    });

    // 200 = accepted, 202 = accepted for processing
    if (res.ok || res.status === 202) {
      return { ok: true, submitted: unique.length, status: res.status };
    }

    const detail = await res.text().catch(() => "");
    console.error(`[indexnow] ${res.status}: ${detail.slice(0, 200)}`);
    return { ok: false, submitted: 0, status: res.status };
  } catch (err) {
    console.error("[indexnow]", err instanceof Error ? err.message : err);
    return { ok: false, submitted: 0 };
  }
}

/** Fire-and-forget — never blocks publish flows. */
export function scheduleIndexNow(urls: string[]): void {
  void notifyIndexNow(urls).then((result) => {
    if (result.ok && result.submitted > 0) {
      console.info(`[indexnow] Submitted ${result.submitted} URL(s)`);
    } else if (result.skipped && result.skipped !== "No URLs to submit") {
      console.info(`[indexnow] Skipped: ${result.skipped}`);
    }
  });
}

export function articleIndexNowUrl(slug: string): string {
  return absoluteUrl(`/blog/${slug}`, SITE_URL);
}
