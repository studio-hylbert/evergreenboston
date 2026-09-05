import type { Locale } from "./i18n";

/**
 * Dates arrive from `lib/youtube.ts` as `YYYY-MM-DD`. Korean writes them
 * `2026. 8. 23.`, without the leading zeros a raw substitution would leave;
 * English gets the month by name so it is not read the other way round.
 */
const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDate(iso: string, locale: Locale): string {
  // A full timestamp is accepted as well as a bare date. Splitting one on "-"
  // would otherwise put "04T22:52:31Z" where the day goes and print NaN.
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (locale === "en") {
    return `${EN_MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
  }
  return `${year}. ${Number(month)}. ${Number(day)}.`;
}
