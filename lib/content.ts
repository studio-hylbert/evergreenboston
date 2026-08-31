import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * Narrative copy lives as markdown with front matter rather than in TypeScript,
 * so a Git-based CMS (Sveltia, Pages CMS) can be pointed at `content/` later
 * without the pages being rewritten. Nothing here is CMS-specific; the format
 * is just what every one of them expects.
 */
const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * A row on the "찾아오시는 길" page. The list in `content/visit.json` starts
 * empty, which TypeScript widens to `never[]`, so the page annotates it with
 * this rather than inferring from the file.
 */
export type TransitRow = {
  mode: string;
  detail: string;
};

export type Page = {
  title: string;
  description?: string;
  html: string;
};

/**
 * Read at build time only. A missing or malformed file stops the build rather
 * than rendering a page with a hole in it.
 */
export function loadPage(slug: string): Page {
  const file = path.join(CONTENT_DIR, "pages", `${slug}.md`);
  if (!fs.existsSync(file)) {
    throw new Error(`Content page not found: ${file}`);
  }

  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  if (typeof data.title !== "string" || data.title.length === 0) {
    throw new Error(`Content page is missing a title in its front matter: ${file}`);
  }

  return {
    title: data.title,
    description: typeof data.description === "string" ? data.description : undefined,
    html: marked.parse(content, { async: false }),
  };
}
