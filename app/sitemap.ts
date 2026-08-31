import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { routePaths } from "@/lib/nav";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return locales.flatMap((locale) =>
    routePaths.map((route) => ({
      url: `${siteUrl}/${locale}${route ? `/${route}` : ""}/`,
      lastModified,
      // Each page points at its counterpart, so a search engine treats the two
      // trees as one site in two languages rather than duplicate content.
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteUrl}/${l}${route ? `/${route}` : ""}/`])
        ),
      },
    }))
  );
}
