import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Niche } from "@/generated/prisma/client";
import { z } from "zod";

const schema = z.object({
  siteName: z.string().optional(),
  siteUrl: z.string().optional(),
  siteDescription: z.string().optional(),
  defaultNiche: z.nativeEnum(Niche).optional(),
  autoPublish: z.boolean().optional(),
  cronEnabled: z.boolean().optional(),
  amazonAssociateTag: z.string().nullable().optional(),
  openaiModel: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = schema.parse(body);

  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  return NextResponse.json(settings);
}
