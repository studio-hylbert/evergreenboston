/**
 * Reads the church's Google Drive gallery and writes content/cache/gallery.json,
 * downloading each photo into public/images/gallery/.
 *
 * Runs on its own schedule (.github/workflows/refresh-gallery.yml), separately
 * from the sermon refresh and from the build. Drive being unreachable fails this
 * job and nothing else.
 *
 * Two sources are involved and neither needs a credential:
 *
 *   listing — an Apps Script web app in the church's Drive (scripts/apps-script/),
 *             deployed to run as its owner, so the folder's structure is
 *             readable without an API key.
 *   photos  — Google's own CDN, which resizes on request. The folder is shared
 *             link-readable, so `drive.google.com/thumbnail?id=…&sz=w600` answers
 *             directly. Serving the bytes through Apps Script instead was
 *             measured at 88 seconds per photo against half a second here.
 *
 * A photo is downloaded once, ever. The resized copies are committed, so the
 * build needs no network and the church keeps an archive that outlives the Drive
 * folder.
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE_DIR = join(ROOT, "public/images/gallery");
const CACHE_PATH = join(ROOT, "content/cache/gallery.json");

/** The grid thumbnail and the size a photo opens at. */
const WIDTHS = [600, 1600];

/**
 * Drive reports times in UTC, and the site is read in Boston. A notice posted
 * on a Sunday evening is 00:xx UTC on Monday, so taking the date off the
 * timestamp would show the congregation a day they were not there for.
 */
const CHURCH_TIME_ZONE = "America/New_York";

const churchDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: CHURCH_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const LISTING_URL = process.env.GALLERY_URL;
if (!LISTING_URL) {
  throw new Error(
    "GALLERY_URL is not set. It is the Apps Script web app's /exec address; " +
      "in CI it comes from the GALLERY_URL secret."
  );
}

/**
 * Both endpoints are Google's and answer from a datacentre without complaint,
 * unlike the YouTube feed. These retries cover ordinary transport flakes only —
 * after the last attempt the error still stops the job.
 */
const ATTEMPTS = 3;

async function get(url, expect) {
  let lastError;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (response.ok) {
        const type = response.headers.get("content-type") ?? "";
        if (!type.includes(expect)) {
          // A Drive error is served as an HTML page with a 200, so the content
          // type is the only thing that distinguishes it from a real answer.
          throw new Error(`Expected ${expect} from ${url}, got ${type}`);
        }
        return response;
      }
      lastError = new Error(`${response.status} ${response.statusText} from ${url}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  throw new Error(`Failed after ${ATTEMPTS} attempts: ${String(lastError)}`);
}

/**
 * The formats Drive's resizer hands back.
 *
 * It does not convert: a PNG screenshot comes back a PNG, and a small one comes
 * back untouched at its original size. So nothing here can assume JPEG — an
 * earlier version did, and the first PNG anyone uploaded stopped the job.
 *
 * Dimensions are read from the bytes because the pages need the aspect ratio to
 * reserve space before the image loads, and asking Drive would not help: it
 * resizes to fit a width, so the height is only knowable from what arrived.
 */
const FORMATS = [
  { ext: "jpg", magic: [0xff, 0xd8, 0xff], size: jpegSize, hasExif: jpegHasExif, strip: jpegStrip },
  { ext: "png", magic: [0x89, 0x50, 0x4e, 0x47], size: pngSize, hasExif: pngHasExif, strip: pngStrip },
];

function formatOf(buffer) {
  return FORMATS.find((format) => format.magic.every((byte, i) => buffer[i] === byte));
}

function jpegSize(buffer) {
  let offset = 2; // Past the SOI marker.

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      throw new Error("Malformed JPEG: expected a marker");
    }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);

    // SOF0..SOF15, excluding the DHT/JPG/DAC markers interleaved in that range.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }

    offset += 2 + length;
  }

  throw new Error("Malformed JPEG: no frame header found");
}

/** IHDR is required to be the first chunk, so its position is fixed. */
function pngSize(buffer) {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function jpegHasExif(buffer) {
  return buffer[2] === 0xff && buffer[3] === 0xe1;
}

function pngHasExif(buffer) {
  let offset = 8; // Past the signature.

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    if (buffer.toString("latin1", offset + 4, offset + 8) === "eXIf") {
      return true;
    }
    offset += 12 + length; // length + type + data + CRC
  }

  return false;
}

/**
 * Removes the metadata a camera or a screenshot leaves behind, then checks the
 * removal worked.
 *
 * Google's resizer does not do this for us. It was assumed it did — it
 * re-encodes, and a re-encode usually drops everything — but the first PNG
 * anyone uploaded came back byte-for-byte identical to the original, `eXIf`
 * chunk and all: below a certain size Drive simply hands the file back. Phone
 * photographs record where they were taken, and a church posts photographs of
 * where its people are, so this cannot be left to chance.
 *
 * Whole segments are dropped rather than rewritten, so the image data is
 * untouched and nothing has to be re-encoded or re-checksummed. What was
 * removed is printed, because quietly altering someone's file is its own kind
 * of surprise. The check afterwards is what makes it safe to be quiet about the
 * rest: if anything survives, the job stops rather than publishing it.
 */
function cleanMetadata(format, buffer, label) {
  const cleaned = format.strip(buffer);

  if (cleaned.length !== buffer.length) {
    console.log(`  stripped ${buffer.length - cleaned.length} bytes of metadata from ${label}`);
  }
  if (format.hasExif(cleaned)) {
    throw new Error(`${label} still carries Exif metadata after stripping.`);
  }

  return cleaned;
}

/** Text chunks are dropped alongside Exif: they carry comments and locations too. */
const PNG_DROP = ["eXIf", "iTXt", "tEXt", "zTXt"];

function pngStrip(buffer) {
  const keep = [buffer.subarray(0, 8)];
  let offset = 8;

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("latin1", offset + 4, offset + 8);
    const end = offset + 12 + length;

    if (!PNG_DROP.includes(type)) {
      keep.push(buffer.subarray(offset, end));
    }
    offset = end;
    if (type === "IEND") break;
  }

  return Buffer.concat(keep);
}

/**
 * APP1 holds Exif and XMP; COM holds a free-text comment. APP0 (JFIF) and APP2
 * (the colour profile) stay, or the picture would come out looking wrong.
 */
function jpegStrip(buffer) {
  const keep = [buffer.subarray(0, 2)];
  let offset = 2;

  while (offset + 4 <= buffer.length) {
    const marker = buffer[offset + 1];

    // Everything from the start of scan onwards is image data, not segments.
    if (marker === 0xda) {
      keep.push(buffer.subarray(offset));
      break;
    }

    const end = offset + 2 + buffer.readUInt16BE(offset + 2);
    if (marker !== 0xe1 && marker !== 0xfe) {
      keep.push(buffer.subarray(offset, end));
    }
    offset = end;
  }

  return Buffer.concat(keep);
}

/**
 * An album's folder name carries everything the site needs to show it:
 *
 *   Korean School_한국학교
 *
 * English first, because that half becomes the URL — `korean-school`. Writing
 * it this way means whoever adds an album types two names they already know and
 * never has to think about what a URL slug is, and it means adding an album is
 * making a folder rather than asking a developer to edit the repository.
 *
 * A name that does not parse stops the job. The alternative — quietly skipping
 * the folder — would leave someone staring at a website that ignored the album
 * they just made, with nothing anywhere saying why. Stopping is loud: the run
 * fails, the mail goes out, and the folder can be renamed in Drive in seconds.
 * The cost is that one malformed folder holds up the other albums until then.
 */
function parseAlbumName(name) {
  const parts = name.split("_").map((part) => part.trim());

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      `Album folder "${name}" is not named "English Name_한국어이름". ` +
        `Rename it in Drive — the English half becomes the web address.`
    );
  }

  const [en, ko] = parts;
  const slug = en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  if (!slug) {
    throw new Error(
      `Album folder "${name}" has no letters or digits in its English half, ` +
        `so there is nothing to build a web address from.`
    );
  }

  return { slug, title: { ko, en } };
}

async function download(id, width, directory, stem, label) {
  const response = await get(`https://drive.google.com/thumbnail?id=${id}&sz=w${width}`, "image/");
  const buffer = Buffer.from(await response.arrayBuffer());

  const format = formatOf(buffer);
  if (!format) {
    throw new Error(
      `${label} came back in a format this does not handle ` +
        `(${response.headers.get("content-type")}). Handled: ${FORMATS.map((f) => f.ext).join(", ")}.`
    );
  }
  const cleaned = cleanMetadata(format, buffer, label);

  const file = `${stem}.${format.ext}`;
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, file), cleaned);

  return { file, ...format.size(cleaned) };
}

/** Reads a file already committed, so a photo is only ever fetched once. */
async function measure(directory, file) {
  const buffer = await readFile(join(directory, file));
  const format = formatOf(buffer);
  if (!format) {
    throw new Error(`${join(directory, file)} is not an image this handles`);
  }
  return format.size(buffer);
}

/**
 * The two parts of the site the folder feeds. Sections are fixed here rather
 * than discovered: each one needs a route that exists in `app/`, so a third
 * folder appearing in Drive is a mistake to report, not a page to invent.
 */
const SECTIONS = ["news", "gallery"];

const listing = await (await get(LISTING_URL, "application/json")).json();

if (listing.ok === false) {
  throw new Error(`Gallery listing failed: ${listing.error}`);
}
if (!Array.isArray(listing.sections)) {
  throw new Error("Gallery listing did not contain a sections array");
}

const cache = Object.fromEntries(SECTIONS.map((section) => [section, []]));
const keep = new Set();

for (const section of listing.sections) {
  const { slug: sectionSlug } = parseAlbumName(section.name);

  if (!SECTIONS.includes(sectionSlug)) {
    throw new Error(
      `Drive has a folder "${section.name}" at the top level, which is not one ` +
        `of the site's sections (${SECTIONS.join(", ")}). Albums go inside those, ` +
        `not beside them.`
    );
  }

  if (section.loose > 0) {
    throw new Error(
      `"${section.name}" has ${section.loose} image(s) sitting directly in it. ` +
        `Photos go inside a folder, because that folder's name is what gives ` +
        `them a title and an address. Make a folder named ` +
        `"English Name_한국어이름" and move them into it.`
    );
  }

  for (const item of section.items) {
    const { slug, title } = parseAlbumName(item.name);
    const directory = join(IMAGE_DIR, sectionSlug, slug);
    // The extension follows whatever Drive hands back, so what is already on
    // disk is found by listing rather than by guessing a file name.
    const present = new Set(await readdir(directory).catch(() => []));
    const photos = [];

    for (const photo of item.photos) {
      const sizes = {};

      for (const width of WIDTHS) {
        // Named for the Drive file id, not the file name. Names carry spaces and
        // Korean characters, and renaming a photo in Drive would otherwise orphan
        // what is already committed.
        const stem = `${photo.id}-w${width}`;
        const existing = [...present].find((file) => file.startsWith(`${stem}.`));
        const label = `${sectionSlug}/${slug}/${photo.name}`;

        const { file, width: w, height: h } = existing
          ? { file: existing, ...(await measure(directory, existing)) }
          : await download(photo.id, width, directory, stem, label);

        keep.add(`${sectionSlug}/${slug}/${file}`);
        sizes[width] = { path: `/images/gallery/${sectionSlug}/${slug}/${file}`, width: w, height: h };

        if (!existing) {
          console.log(`Fetched ${sectionSlug}/${slug}/${file} (${w}x${h})`);
        }
      }

      photos.push({
        id: photo.id,
        /** The Drive file name, which is what the church typed. */
        name: photo.name,
        modified: photo.modified,
        thumbnail: sizes[600],
        full: sizes[1600],
      });
    }

    cache[sectionSlug].push({
      slug,
      title,
      /** Full precision, used for ordering. */
      modified: item.modified,
      /** The calendar day in Boston, which is what gets shown. */
      date: churchDate.format(new Date(item.modified)),
      photos,
    });
  }
}

/*
 * Newest first for news, because an announcement is read once and the one that
 * matters is the latest. The gallery keeps the folder order it came in, which
 * is alphabetical — an archive is browsed, not caught up on.
 */
cache.news.sort((a, b) => b.modified.localeCompare(a.modified));

// A photo removed from Drive should leave the site, and its bytes should leave
// the repository too rather than accumulating forever.
for (const section of await readdir(IMAGE_DIR).catch(() => [])) {
  for (const album of await readdir(join(IMAGE_DIR, section)).catch(() => [])) {
    for (const file of await readdir(join(IMAGE_DIR, section, album)).catch(() => [])) {
      const relative = `${section}/${album}/${file}`;
      // Covers a photo deleted in Drive, an album renamed, and a file whose
      // format changed under the same id.
      if (!keep.has(relative)) {
        await rm(join(IMAGE_DIR, relative));
        console.log(`Removed ${relative}, no longer in Drive`);
      }
    }
  }
}

await mkdir(dirname(CACHE_PATH), { recursive: true });
await writeFile(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, "utf8");

for (const section of SECTIONS) {
  const items = cache[section];
  const photos = items.reduce((total, item) => total + item.photos.length, 0);
  console.log(`${section}: ${items.length} items, ${photos} photos`);
}
