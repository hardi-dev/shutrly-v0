import type { MetadataRoute } from "next";

import { isLandingOnly } from "@/composition/app-stage/app-stage";

export const dynamic = "force-dynamic";

// Production lets crawlers index the landing page only (A-6, AC-LND-004); "/$" matches `/` alone.
// Staging and development ask crawlers to stay out entirely.
export default async function robots(): Promise<MetadataRoute.Robots> {
  if (await isLandingOnly()) return { rules: { userAgent: "*", allow: "/$", disallow: "/" } };
  return { rules: { userAgent: "*", disallow: "/" } };
}
