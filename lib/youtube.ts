import cached from "@/content/cache/videos.json";

/**
 * Sermon videos come from the church's YouTube feed, but not during the build.
 * `scripts/refresh-youtube.mjs` reads the feed on its own schedule and commits
 * the result to `content/cache/videos.json`; the build only reads that file.
 *
 * Keeping the network out of the build is what stops the two content sources
 * from interfering. A feed outage fails the refresh job alone, and the site
 * still deploys — with the last successfully fetched sermon list — whenever the
 * gallery or anything else changes.
 *
 * The cached file carries the 15 most recent uploads, which is the whole of
 * what the site shows, so no pagination or archive is involved.
 */
export type Video = {
  videoId: string;
  /** The upload title exactly as it appears on YouTube. */
  rawTitle: string;
  /** Sermon title alone, when the upload title follows the usual pattern. */
  title: string | null;
  /** Preacher, when the upload title names one. Many uploads do not. */
  preacher: string | null;
  /** Date it was preached, taken from the title, else the upload date. */
  date: string;
  /** The channel also carries occasional non-sermon uploads. */
  isSermon: boolean;
  url: string;
  thumbnail: string;
};

/**
 * Read by the sermons page and the homepage. An empty or malformed cache stops
 * the build rather than publishing a sermons page with nothing on it, which
 * would look like the church had stopped preaching.
 */
export function readVideos(): Video[] {
  const videos = cached as Video[];

  if (videos.length === 0) {
    throw new Error(
      "content/cache/videos.json is empty. Run `npm run refresh:youtube` to fill it."
    );
  }

  return videos;
}
