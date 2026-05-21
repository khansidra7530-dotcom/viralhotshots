import { NextRequest, NextResponse } from "next/server";
import { authorizeCron } from "@/lib/marketing/cron-auth";
import { publishDueSocialPosts } from "@/lib/marketing/social/publisher";
import { runSocialMediaAgent } from "@/lib/marketing/agents/social-media-agent";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articleId = req.nextUrl.searchParams.get("articleId");
  if (articleId) {
    const generated = await runSocialMediaAgent({ articleId });
    if (!generated.ok) {
      return NextResponse.json({ error: generated.error }, { status: 500 });
    }
  }

  const result = await publishDueSocialPosts(20);
  return NextResponse.json({ ok: true, ...result });
}
