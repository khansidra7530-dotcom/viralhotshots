import { NextRequest, NextResponse } from "next/server";
import { authorizeCron } from "@/lib/marketing/cron-auth";
import { runTrendResearchAgent } from "@/lib/marketing/agents/trend-research-agent";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const niche = req.nextUrl.searchParams.get("niche") ?? undefined;
  const result = await runTrendResearchAgent({
    niche: niche as never,
    limit: 30,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
