/**
 * Reads the church's YouTube feed and writes content/cache/videos.json.
 *
 * This runs on its own schedule (.github/workflows/refresh-youtube.yml), not
 * during the site build. The build reads only the committed JSON, so a feed
 * outage can no longer stop a deploy that has nothing to do with sermons —
 * a photo added to the gallery still reaches the site while the feed is down,
 * and the previously fetched sermon list stays on the page until the next
 * successful refresh replaces it.
 *
 * The feed is read rather than the YouTube Data API: no API key, no quota, and
 * therefore no secret that has to be handed over with the site.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CHANNEL_ID = JSON.parse(
  await readFile(new URL("../content/site.json", import.meta.url), "utf8")
).youtube.channelId;

const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const OUT_PATH = join(dirname(fileURLToPath(import.meta.url)), "../content/cache/videos.json");

const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decodeEntities(text) {
  return text.replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (match) => ENTITIES[match]);
}

/**
 * Upload titles look like
 *   [보스톤늘푸른교회 - 8/23/2026 주일예배 말씀 "기이하고 가장 기이한 일" - 이진택 목사
 * but the bracket, the quote characters and the spacing all vary between
 * uploads. Every field here is therefore optional by design: an upload that
 * does not match is shown under its raw title rather than being dropped or
 * failing the refresh, because the titles are typed by hand and the site must
 * not depend on that being consistent.
 */
function parseTitle(rawTitle) {
  // Sermons are dated M/D/YYYY; other uploads tend to use the Korean form.
  const slashDate = rawTitle.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const koreanDate = rawTitle.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);

  let preachedOn = null;
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
 * The feed answers intermittently: the same request can return 200, 404 or 500
 * within a minute. These are retries of one idempotent read, not a fallback —
 * after the last attempt the error still stops the refresh, which leaves the
 * previously committed list in place and reports the failure in Actions.
 */
const ATTEMPTS = 4;

async function readFeed() {
  let lastError;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      // The headers matter. Unadorned requests from a datacentre address are
      // answered with 404 rather than the feed, which is what fails the job on
      // a CI runner while the same request succeeds from a laptop.
      const response = await fetch(FEED_URL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko,en;q=0.9",
        },
      });
      if (response.ok) {
        return await response.text();
      }
      lastError = new Error(
        `YouTube feed request failed: ${response.status} ${response.statusText}`
      );
    } catch (error) {
      // A transport failure is the same kind of flake as a 5xx here.
      lastError = error;
    }

    if (attempt < ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }

  throw new Error(
    `YouTube feed unavailable after ${ATTEMPTS} attempts (${FEED_URL}): ${String(lastError)}`
  );
}

async function fetchVideos() {
  const xml = await readFeed();
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

const videos = await fetchVideos();

await mkdir(dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, `${JSON.stringify(videos, null, 2)}\n`, "utf8");

console.log(`Wrote ${videos.length} videos to content/cache/videos.json`);
