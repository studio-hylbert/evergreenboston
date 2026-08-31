/**
 * Dates arrive from `lib/youtube.ts` as `YYYY-MM-DD` and are shown the Korean
 * way, without the leading zeros a raw substitution would leave behind.
 */
export function formatKoreanDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${year}. ${Number(month)}. ${Number(day)}.`;
}
