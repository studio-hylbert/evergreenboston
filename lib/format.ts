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

/**
 * The church's clock. The site is built on a runner set to UTC, so anything
 * shown to the minute has to name a zone or it will be four or five hours out.
 */
export const CHURCH_TIME_ZONE = "America/New_York";

/**
 * A full timestamp, to the minute, in Boston time.
 *
 * `Intl` is used only to move the instant into the church's zone and read back
 * the numbers; every word is placed here. Handing `Intl` the formatting as well
 * produced "오전 1:17" on a laptop and "AM 1:17" on the CI runner, whose locale
 * data is not the same — and the site is built on the runner. Numbers do not
 * vary that way, so this takes the numbers and writes the rest itself, which is
 * the same reason `formatDate` above is assembled by hand.
 */
export function formatDateTime(iso: string, locale: Locale): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CHURCH_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));

  const at = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const [year, month, day, hour24, minute] = [
    at("year"), at("month"), at("day"), at("hour"), at("minute"),
  ];

  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const clock = `${hour12}:${String(minute).padStart(2, "0")}`;

  if (locale === "en") {
    const meridiem = hour24 < 12 ? "AM" : "PM";
    return `${EN_MONTHS[month - 1]} ${day}, ${year} at ${clock} ${meridiem}`;
  }
  return `${year}. ${month}. ${day}. ${hour24 < 12 ? "오전" : "오후"} ${clock}`;
}
