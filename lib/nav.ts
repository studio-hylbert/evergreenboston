import { read } from "./gallery";
import type { Locale } from "./i18n";
import { ui } from "./ui";

/**
 * Navigation lives in code rather than in `content/`, because each entry pairs
 * a label with a route that only exists if a matching directory does. A CMS
 * editor renaming a route would produce a dead link with no warning.
 *
 * `news` and `gallery` are fed by Drive but still listed here, and deliberately
 * so: what the church's folders decide is what sits *under* those two entries,
 * never the shape of the header. A renamed folder changes one page's address;
 * it cannot add a tab, drop one, or reorder them.
 */
export type NavItem = { href: string; label: string };

const routes = ["about", "pastor", "worship", "sermons", "news", "gallery", "community", "visit"] as const;

/** The two Drive-fed sections have nothing to show until the church posts. */
function isLive(route: (typeof routes)[number]): boolean {
  if (route === "news" || route === "gallery") {
    return read(route).length > 0;
  }
  return true;
}

export function navFor(locale: Locale): NavItem[] {
  return routes.filter(isLive).map((route) => ({
    href: `/${locale}/${route}`,
    label: ui[locale].nav[route],
  }));
}

/** Every page, used by the sitemap and the language switcher. */
export const routePaths: readonly string[] = [
  "",
  ...routes.filter(isLive),
  // Only the gallery has a page per entry; every notice lives on /news itself.
  ...read("gallery").map((album) => `gallery/${album.slug}`),
];
