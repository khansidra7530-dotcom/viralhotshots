import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const limit = rateLimit(`newsletter:${ip}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email } = schema.parse(body);
    await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      create: { email: email.toLowerCase() },
      update: {},
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
}
