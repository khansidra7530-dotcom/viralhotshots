import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

const schema = z.object({
  type: z.string().min(1).max(64),
  path: z.string().max(512).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    await prisma.analyticsEvent.create({
      data: {
        type: body.type,
        path: body.path,
        metadata: (body.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
