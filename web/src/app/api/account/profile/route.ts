import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(300).optional().nullable(),
  avatar: z.union([z.string().url().max(500), z.literal("")]).optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const { error, session } = await requireAuthApi();
  if (error) return error;

  const body = await req.json();
  const data = schema.parse(body);

  const user = await prisma.user.update({
    where: { id: session!.user!.id! },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.bio !== undefined && { bio: data.bio || null }),
      ...(data.avatar !== undefined && { avatar: data.avatar || null }),
    },
    select: { id: true, name: true, email: true, bio: true, avatar: true },
  });

  return NextResponse.json({ user });
}

export async function GET() {
  const { error, session } = await requireAuthApi();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id! },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatar: true,
      createdAt: true,
      _count: { select: { articleLikes: true, articleSubscriptions: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
