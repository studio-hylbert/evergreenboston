import { read } from "./gallery";
import { readVideos } from "./youtube";
import type { Locale } from "./i18n";
import { ui } from "./ui";

/**
 * When each of the site's outside sources last changed, shown in the footer to
 * the minute.
 *
 * It answers one question: is this thing still working? A sermon went up on
 * Sunday and the footer still says three weeks ago — something broke, and
 * nobody had to go and read a workflow log to find out.
 *
 * **This is when the content last changed, not when it was last checked.** The
 * distinction is forced by the site being static. A page only changes when a
 * deploy happens, and a deploy only happens when a source actually changed, so
 * a "checked 20 minutes ago" stamp could never be true of the page you are
 * looking at — it would have to rebuild the whole site on every check, dozens
 * of times a day, to keep a line of text honest. "Last changed" needs no extra
 * work and carries the same signal.
 */
export type Freshness = { label: string; at: string };

export function freshnessFor(locale: Locale): Freshness[] {
  const strings = ui[locale];

  const sources: Array<{ label: string; times: string[] }> = [
    {
      label: strings.nav.sermons,
      // Dropped rather than defaulted when absent: a source with no timestamp
      // is simply not listed, which is the same thing that happens to a source
      // with no content. Inventing one would be worse than saying nothing.
      times: readVideos().flatMap((video) => (video.published ? [video.published] : [])),
    },
    { label: strings.nav.news, times: read("news").map((entry) => entry.modified) },
    { label: strings.nav.gallery, times: read("gallery").map((entry) => entry.modified) },
  ];

  return sources
    .filter((source) => source.times.length > 0)
    .map((source) => ({
      label: source.label,
      // Sorted rather than taken from the front: the feed's order is YouTube's
      // to decide, and an album's order is alphabetical by folder name.
      at: source.times.slice().sort().at(-1) as string,
    }));
}
