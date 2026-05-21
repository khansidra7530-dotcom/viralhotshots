import { NextRequest, NextResponse } from "next/server";
import { authorizeCron } from "@/lib/marketing/cron-auth";
import { runOptimizationAgent } from "@/lib/marketing/agents/optimization-agent";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "3");
  const result = await runOptimizationAgent({ limit: Math.min(limit, 10) });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
