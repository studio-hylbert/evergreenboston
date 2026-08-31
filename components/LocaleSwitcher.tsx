"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeLabels, locales, otherLocale, type Locale } from "@/lib/i18n";

/**
 * Swaps the locale segment of the current path, so the switch lands on the same
 * page rather than sending the reader back to the homepage.
 *
 * The choice is remembered, and `/` reads it back: someone who has picked a
 * language once is not sent somewhere else by their browser settings on the
 * next visit. See public/index.html.
 */
export default function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const target = otherLocale(locale);
  const href = pathname.replace(
    new RegExp(`^/(${locales.join("|")})`),
    `/${target}`
  );

  return (
    <Link
      href={href}
      hrefLang={target}
      onClick={() => {
        try {
          window.localStorage.setItem("locale", target);
        } catch {
          // Private browsing can refuse storage; the switch itself still works.
        }
      }}
      className="text-sm text-ink-soft underline underline-offset-4 hover:text-forest"
    >
      {localeLabels[target]}
    </Link>
  );
}
