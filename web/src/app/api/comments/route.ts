import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  articleId: z.string(),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  content: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const limit = rateLimit(`comment:${ip}`, 10, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);
    await prisma.comment.create({
      data: {
        articleId: data.articleId,
        name: data.name,
        email: data.email,
        content: data.content,
        approved: false,
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }
}
