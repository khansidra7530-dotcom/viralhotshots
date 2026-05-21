import { getIndexNowKey } from "@/lib/indexnow";

/** IndexNow key file — must be reachable at /indexnow-key.txt */
export async function GET() {
  const key = getIndexNowKey();
  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
