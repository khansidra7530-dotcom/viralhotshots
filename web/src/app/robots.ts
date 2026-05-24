import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { buildAeoRobotsRules } from "@/lib/aeo/crawlers";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/$/, "");
  return {
    rules: buildAeoRobotsRules(),
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
