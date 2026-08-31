/**
 * The site ships as two static trees, /ko and /en, both generated at build
 * time. There is no server to negotiate `Accept-Language` — a static export
 * has no middleware — so `/` is a shim that redirects in the browser. See
 * public/index.html.
 */
export const locales = ["ko", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ko";

/** A value the church supplies in both languages. */
export type Localized<T = string> = Record<Locale, T>;

export function t<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}

/** The language a switcher should offer, given the one being displayed. */
export function otherLocale(locale: Locale): Locale {
  return locale === "ko" ? "en" : "ko";
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const localeLabels: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
};

export const htmlLang: Record<Locale, string> = {
  ko: "ko",
  en: "en",
};
