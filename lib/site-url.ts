/**
 * Canonical origin, including the base path the site is served from.
 *
 * The deploy workflow fills this from the Pages configuration, so it is not
 * written down twice and moving to the church's own domain needs no code
 * change. Metadata needs it because `alternates` and `openGraph` take absolute
 * URLs — unlike `next/link`, they are not rewritten with `basePath`.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

import { htmlLang, locales, type Locale } from "./i18n";

/**
 * The canonical URL for one page, and its counterpart in the other language.
 *
 * This has to be set per page rather than once in the layout: metadata is
 * inherited by nested routes, so a `canonical` declared in the locale layout
 * would make every page claim to be the homepage, and every page would
 * advertise the homepage as its translation.
 *
 * `route` is the path below the locale — "" for the homepage, "about", and so
 * on. Trailing slashes match `trailingSlash: true` in next.config.ts.
 */
export function alternatesFor(locale: Locale, route: string) {
  const suffix = route ? `${route}/` : "";
  return {
    canonical: `${siteUrl}/${locale}/${suffix}`,
    languages: Object.fromEntries(
      locales.map((l) => [htmlLang[l], `${siteUrl}/${l}/${suffix}`])
    ),
  };
}
