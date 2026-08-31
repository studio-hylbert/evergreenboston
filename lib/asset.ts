/**
 * Prefixes a path in `public/` with the base path the site is served from.
 *
 * `next/image` and `next/link` apply `basePath` themselves, but a plain `<img>`
 * or a `<picture>` source does not, and a project repository on GitHub Pages is
 * served from `/<repo>` rather than `/`. Art-directed images are authored as
 * `<picture>` (see app/page.tsx), so they need this.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${basePath}${path}`;
}
