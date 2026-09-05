import cached from "@/content/cache/gallery.json";
import type { Localized } from "./i18n";

/**
 * Images come from one Google Drive folder the church keeps, read by
 * `scripts/refresh-gallery.mjs` on its own schedule and committed under
 * `content/cache/`. The build only reads that file, so Drive being down cannot
 * stop a deploy — see README.md, '외부 소스 갱신'.
 *
 * The folder has two sections, and they are two different things to a reader:
 *
 *   news    — a poster, a flyer, something the church is telling you now
 *   gallery — photographs of something that already happened
 *
 * Both are "a folder of images", which is why they share this code, and a
 * folder's name is the whole of its entry: `Korean School Fall_한국학교 가을학기`
 * gives both titles and the address. There is no list of them in `content/`.
 * Publishing is making a folder, which is the point — the church should not
 * need a developer to put up next term's timetable.
 */
export type Photo = {
  /** The Drive file id, stable across renames. */
  id: string;
  /** The file name the church gave it, extension included. */
  name: string;
  modified: string;
  thumbnail: Image;
  full: Image;
};

export type Image = {
  path: string;
  width: number;
  height: number;
};

export type Entry = {
  slug: string;
  title: Localized;
  /** Full ISO timestamp from Drive, used for ordering. */
  modified: string;
  /** `YYYY-MM-DD` in Boston, which is the day the site shows. */
  date: string;
  photos: Photo[];
};

export type Section = "news" | "gallery";

/**
 * Entries with no photos are left out rather than rendered empty. A folder made
 * ahead of the event it is for should not put a blank page on the site, and the
 * project's rule is that a value which is not there does not render at all.
 */
export function read(section: Section): Entry[] {
  const entries = (cached as Record<Section, Entry[]>)[section] ?? [];
  return entries.filter((entry) => entry.photos.length > 0);
}

export function find(section: Section, slug: string): Entry | undefined {
  return read(section).find((entry) => entry.slug === slug);
}

/**
 * Alt text, taken from the file name.
 *
 * Nobody writes a description when they drop photos into a folder, and inventing
 * one here would be worse than none. The file name is at least the church's own
 * words — `한국학교-2026-가을학기-시간표.jpg` describes its picture perfectly well.
 * It also gives whoever uploads a lever: name the file, and the site reads it
 * out to anyone using a screen reader.
 */
export function altFor(photo: Photo): string {
  return photo.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}
