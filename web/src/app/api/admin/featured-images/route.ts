import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import {
  getAllCuratedImages,
  getNicheImagePool,
  searchFeaturedImages,
} from "@/lib/ai/hero-image";
import type { Niche } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const niche = req.nextUrl.searchParams.get("niche") as Niche | null;
  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1") || 1;

  const pool = niche ? getNicheImagePool(niche) : getAllCuratedImages();
  const search =
    query.length >= 2 ? await searchFeaturedImages(query, page) : [];

  return NextResponse.json({ pool, search, hasUnsplash: Boolean(process.env.UNSPLASH_ACCESS_KEY) });
}
