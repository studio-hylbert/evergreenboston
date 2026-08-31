import site from "@/content/site.json";

/**
 * Sermon videos come from the channel's Atom feed rather than the YouTube Data
 * API: the feed needs no API key and has no quota, which keeps the deployment
 * free of secrets that would have to be handed over with the site.
 *
 * The feed only carries the 15 most recent uploads. That is the whole of what
 * the site shows, so no pagination or archive is involved.
 */
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${site.youtube.channelId}`;

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

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decodeEntities(text: string): string {
  return text.replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (match) => ENTITIES[match]);
}

/**
 * Upload titles look like
 *   [보스톤늘푸른교회 - 8/23/2026 주일예배 말씀 "기이하고 가장 기이한 일" - 이진택 목사
 * but the bracket, the quote characters and the spacing all vary between
 * uploads. Every field here is therefore optional by design: an upload that
 * does not match is shown under its raw title rather than being dropped or
 * failing the build, because the titles are typed by hand and the site must not
 * depend on that being consistent.
 */
function parseTitle(rawTitle: string): {
  title: string | null;
  preacher: string | null;
  preachedOn: string | null;
} {
  // Sermons are dated M/D/YYYY; other uploads tend to use the Korean form.
  const slashDate = rawTitle.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const koreanDate = rawTitle.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);

  let preachedOn: string | null = null;
  if (slashDate) {
    preachedOn = `${slashDate[3]}-${slashDate[1].padStart(2, "0")}-${slashDate[2].padStart(2, "0")}`;
  } else if (koreanDate) {
    preachedOn = `${koreanDate[1]}-${koreanDate[2].padStart(2, "0")}-${koreanDate[3].padStart(2, "0")}`;
  }

  // Any of the straight or curly double-quote characters may open or close it.
  const titleMatch = rawTitle.match(/["“”]([^"“”]+)["“”]/);
  const title = titleMatch ? titleMatch[1].trim() : null;

  const preacherMatch = rawTitle.match(/[-–]\s*([^-–]{2,20}?(?:목사|전도사|장로|선교사))\s*$/);
  const preacher = preacherMatch ? preacherMatch[1].trim() : null;

  return { title, preacher, preachedOn };
}

/**
 * Read at build time by the sermons page and the homepage. A scheduled rebuild
 * is what keeps the list current — see .github/workflows/deploy.yml.
 *
 * A failure here stops the build rather than publishing an empty list, which
 * leaves the previously deployed site in place.
 */
export async function fetchVideos(): Promise<Video[]> {
  const response = await fetch(FEED_URL);
  if (!response.ok) {
    throw new Error(
      `YouTube feed request failed: ${response.status} ${response.statusText} (${FEED_URL})`
    );
  }

  const xml = await response.text();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g);
  if (!entries || entries.length === 0) {
    throw new Error(`YouTube feed contained no entries (${FEED_URL})`);
  }

  return entries.map((entry) => {
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const rawTitleMatch = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];

    if (!videoId || !rawTitleMatch || !published) {
      throw new Error(`YouTube feed entry is missing required fields: ${entry.slice(0, 200)}`);
    }

    const rawTitle = decodeEntities(rawTitleMatch).trim();
    const { title, preacher, preachedOn } = parseTitle(rawTitle);

    return {
      videoId,
      rawTitle,
      title,
      preacher,
      date: preachedOn ?? published.slice(0, 10),
      isSermon: rawTitle.includes("주일예배 말씀"),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      // Served from YouTube rather than copied into the repository, so it
      // cannot go stale when a video is re-uploaded.
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  });
}
