import type { Locale } from "./i18n";
import { ui } from "./ui";

/**
 * Navigation lives in code rather than in `content/`, because each entry pairs
 * a label with a route that only exists if a matching directory does. A CMS
 * editor renaming a route would produce a dead link with no warning.
 */
export type NavItem = { href: string; label: string };

const routes = ["about", "worship", "sermons", "community", "visit"] as const;

export function navFor(locale: Locale): NavItem[] {
  return routes.map((route) => ({
    href: `/${locale}/${route}`,
    label: ui[locale].nav[route],
  }));
}

/** Every page, used by the sitemap and the language switcher. */
export const routePaths: readonly string[] = ["", ...routes];
