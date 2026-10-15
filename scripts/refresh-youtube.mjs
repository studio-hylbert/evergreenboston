/**
 * Reads the church's YouTube feeds and writes content/cache/videos.json.
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

/**
 * YouTube keeps a channel's uploads in playlists named after the channel ID:
 * its leading "UC" becomes "UULF" for the regular videos alone and "UUSH" for
 * the Shorts alone. Reading the two separately means a Short is recognised by
 * YouTube's own reckoning rather than by "#shorts" in its title, which several
 * of the church's Shorts do not carry.
 *
 * Live streams have a playlist of their own, "UULV", which is deliberately not
 * read. The recording of a whole service repeats the sermon, and the sermon is
 * uploaded on its own afterwards.
 *
 * None of this is documented, so `readVideos` checks every entry against the
 * feed it came from, and a feed that has started mixing the two stops the
 * refresh instead of quietly filing sermons as Shorts.
 */
if (!CHANNEL_ID.startsWith("UC")) {
  throw new Error(`Expected a channel ID starting with "UC", got ${CHANNEL_ID}`);
}

function playlistFeed(prefix) {
  return `https://www.youtube.com/feeds/videos.xml?playlist_id=${prefix}${CHANNEL_ID.slice(2)}`;
}

const REGULAR_FEED = playlistFeed("UULF");
const SHORTS_FEED = playlistFeed("UUSH");

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

function isoDate(year, month, day) {
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

const PREACHER = /(?:목사|전도사|장로|선교사)$/;
const PASSAGE = /\d+:\d+/;

/**
 * A sermon upload is titled
 *   시험 좋아하시나요? | 야고보서 1:1-12 | 이진택 목사 | 보스톤늘푸른교회 2026.10.11
 * and that shape is what marks it as a sermon. The regular-uploads feed also
 * carries the odd community video, such as a youth outing, titled any way at
 * all, and those are shown under their own titles.
 *
 * Earlier sermons were titled
 *   [보스톤늘푸른교회 - 8/23/2026 주일예배 말씀 "기이하고 가장 기이한 일" - 이진택 목사
 * and the channel has since renamed most of them but not all, so that form is
 * still read. In it the bracket, the quote characters and the spacing all vary.
 *
 * The titles are typed by hand, so the passage and preacher are found by what
 * they look like rather than by position, and both are optional. A title that
 * fits neither form is not an error: it is a community video.
 */
function parseTitle(rawTitle) {
  // Hashtags at the end (#shorts, #사사기13장) are for YouTube's search, not
  // for someone reading the page.
  const bare = rawTitle.replace(/(?:\s+#[^\s#]+)+\s*$/, "");
  const parts = bare.split("|").map((part) => part.trim());

  const dottedDate = parts.at(-1).match(/(\d{4})\.(\d{1,2})\.(\d{1,2})$/);
  if (parts.length >= 3 && dottedDate) {
    const fields = parts.slice(1, -1);
    return {
      isSermon: true,
      title: parts[0],
      passage: fields.find((part) => PASSAGE.test(part)) ?? null,
      preacher: fields.find((part) => PREACHER.test(part)) ?? null,
      date: isoDate(dottedDate[1], dottedDate[2], dottedDate[3]),
    };
  }

  if (rawTitle.includes("주일예배 말씀")) {
    const slashDate = rawTitle.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    // Any of the straight or curly double-quote characters may open or close it.
    const quoted = rawTitle.match(/["“”]([^"“”]+)["“”]/);
    const preacher = rawTitle.match(/[-–]\s*([^-–]{2,20}?(?:목사|전도사|장로|선교사))\s*$/);
    return {
      isSermon: true,
      title: quoted ? quoted[1].trim() : rawTitle,
      passage: null,
      preacher: preacher ? preacher[1].trim() : null,
      date: slashDate ? isoDate(slashDate[3], slashDate[1], slashDate[2]) : null,
    };
  }

  // Shorts cut from a sermon are titled "제목 | 야고보서 1:12".
  const cited = parts.length === 2 && PASSAGE.test(parts[1]);
  const koreanDate = rawTitle.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  return {
    isSermon: false,
    title: cited ? parts[0] : bare,
    passage: cited ? parts[1] : null,
    preacher: null,
    date: koreanDate ? isoDate(koreanDate[1], koreanDate[2], koreanDate[3]) : null,
  };
}

/**
 * The feed answers intermittently: the same request can return 200, 404 or 500
 * within a minute. These are retries of one idempotent read, not a fallback —
 * after the last attempt the error still stops the refresh, which leaves the
 * previously committed list in place and reports the failure in Actions.
 *
 * The waits climb to a minute and the whole sequence spans about seven, because
 * the earlier four-attempt version gave up after nine seconds and a run that
 * failed took twenty seconds end to end. Nine seconds is not a serious attempt
 * at an endpoint that goes away for minutes at a time. Seven is cheap: the
 * repository is public, so a job that sits waiting costs nothing, and it only
 * waits at all on the runs that would otherwise have failed.
 */
const BACKOFF_SECONDS = [5, 10, 20, 40, 60, 60, 60, 60, 60, 60];

async function readFeed(url) {
  let lastError;

  for (let attempt = 0; attempt <= BACKOFF_SECONDS.length; attempt++) {
    try {
      // The headers matter. Unadorned requests from a datacentre address are
      // answered with 404 rather than the feed, which is what fails the job on
      // a CI runner while the same request succeeds from a laptop.
      const response = await fetch(url, {
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

    const wait = BACKOFF_SECONDS[attempt];
    if (wait !== undefined) {
      console.log(`Feed unavailable, retrying in ${wait}s (${String(lastError)})`);
      await new Promise((resolve) => setTimeout(resolve, wait * 1000));
    }
  }

  throw new Error(
    `YouTube feed unavailable after ${BACKOFF_SECONDS.length + 1} attempts over ` +
      `${BACKOFF_SECONDS.reduce((a, b) => a + b, 0)}s (${url}): ${String(lastError)}`
  );
}

/**
 * Reads one feed into Video records. YouTube links a Short's entry to /shorts/
 * and every other entry to /watch, and each entry is checked against the feed
 * it came from: that is what notices if a playlist stops holding what its
 * prefix says.
 */
async function readVideos(url, isShort) {
  const xml = await readFeed(url);
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g);
  if (!entries || entries.length === 0) {
    throw new Error(`YouTube feed contained no entries (${url})`);
  }

  return entries.map((entry) => {
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const rawTitleMatch = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    const link = entry.match(/<link rel="alternate" href="([^"]+)"/)?.[1];

    if (!videoId || !rawTitleMatch || !published || !link) {
      throw new Error(`YouTube feed entry is missing required fields: ${entry.slice(0, 200)}`);
    }

    const expected = isShort
      ? `https://www.youtube.com/shorts/${videoId}`
      : `https://www.youtube.com/watch?v=${videoId}`;
    if (link !== expected) {
      throw new Error(`${url} links ${videoId} to ${link}, expected ${expected}`);
    }

    const rawTitle = decodeEntities(rawTitleMatch).trim();
    const { isSermon, title, passage, preacher, date } = parseTitle(rawTitle);

    return {
      videoId,
      rawTitle,
      title,
      passage,
      preacher,
      date: date ?? published.slice(0, 10),
      // A Short cut from a sermon is still a Short: the feed decides that.
      category: isShort ? "short" : isSermon ? "sermon" : "community",
      url: link,
      // Served from YouTube rather than copied into the repository, so it
      // cannot go stale when a video is re-uploaded. A Short's upright frame
      // sits in the middle of the still, so the 16:9 hq720 is used for those:
      // the frame is 405 pixels wide there, against 202 in the 4:3 hqdefault,
      // which is too few for a card on a phone screen.
      thumbnail: `https://i.ytimg.com/vi/${videoId}/${isShort ? "hq720" : "hqdefault"}.jpg`,
    };
  });
}

const regular = await readVideos(REGULAR_FEED, false);
const shorts = await readVideos(SHORTS_FEED, true);

// This is how the last change of title format would have been caught: every
// sermon quietly became a community video, and the page lost its sermons.
if (!regular.some((video) => video.category === "sermon")) {
  throw new Error(
    `None of the ${regular.length} regular uploads reads as a sermon, so the title ` +
      `format has probably changed and parseTitle needs to learn it:\n` +
      regular.map((video) => `  ${video.rawTitle}`).join("\n")
  );
}

// hq720 is only made for uploads of 720p or more. Every Short so far is 1080p,
// but one that is not would be an empty card on the page, so it stops here.
for (const short of shorts) {
  const response = await fetch(short.thumbnail, { method: "HEAD" });
  if (!response.ok) {
    throw new Error(`No hq720 still for Short ${short.videoId}: ${response.status} ${short.thumbnail}`);
  }
}

const videos = [...regular, ...shorts];

await mkdir(dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, `${JSON.stringify(videos, null, 2)}\n`, "utf8");

const count = (category) => videos.filter((video) => video.category === category).length;
console.log(
  `Wrote ${count("sermon")} sermons, ${count("community")} community videos and ` +
    `${count("short")} Shorts to content/cache/videos.json`
);
