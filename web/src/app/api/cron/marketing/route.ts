import { NextRequest, NextResponse } from "next/server";
import { authorizeCron } from "@/lib/marketing/cron-auth";
import { runDailyMarketingPipeline } from "@/lib/marketing/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Daily autonomous marketing pipeline (research → write → social → optimize). */
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await runDailyMarketingPipeline();
    return NextResponse.json({ ok: true, report });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Marketing pipeline failed" },
      { status: 500 }
    );
  }
}
