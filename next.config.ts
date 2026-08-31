import type { NextConfig } from "next";

/**
 * Deployed as a static export to GitHub Pages.
 *
 * Under an organisation's project repository the site is served from a
 * subdirectory, so `basePath` has to match the repository name. It is read from
 * the environment rather than hard-coded, which keeps `npm run dev` serving from
 * `/` and means moving to the church's own domain later needs no code change.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  /*
   * Emit `worship/index.html` rather than `worship.html`. GitHub Pages will
   * serve either, but a directory index does not depend on its extension
   * fallback.
   */
  trailingSlash: true,
  images: {
    /*
     * A static export ships no image optimizer, so images are authored at the
     * sizes they are served at.
     */
    unoptimized: true,
  },
};

export default nextConfig;
