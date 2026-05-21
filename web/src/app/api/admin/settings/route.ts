import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-helpers";
import { Niche } from "@/generated/prisma/client";
import { z } from "zod";

const schema = z.object({
  siteName: z.string().optional(),
  siteUrl: z.string().optional(),
  siteDescription: z.string().optional(),
  defaultNiche: z.nativeEnum(Niche).optional(),
  autoPublish: z.boolean().optional(),
  cronEnabled: z.boolean().optional(),
  marketingEnabled: z.boolean().optional(),
  autoSocialEnabled: z.boolean().optional(),
  autoOptimizeEnabled: z.boolean().optional(),
  preferredLlm: z.string().optional(),
  n8nWebhookUrl: z.string().nullable().optional(),
  amazonAssociateTag: z.string().nullable().optional(),
  aiModel: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await req.json();
  const data = schema.parse(body);

  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  return NextResponse.json(settings);
}
