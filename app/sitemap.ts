import type { MetadataRoute } from "next";
import { nav } from "@/lib/nav";

/**
 * `NEXT_PUBLIC_SITE_URL` is filled by the deploy workflow from the Pages
 * configuration, so the canonical origin is not written down twice. Moving to
 * the church's own domain needs no change here.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", ...nav.map((item) => item.href)];

  return routes.map((route) => ({
    url: `${siteUrl}${route}/`,
    lastModified: new Date(),
  }));
}
