import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      /*
       * The site is a static export with `images.unoptimized`, so `next/image`
       * never optimizes anything here. Images are authored at the sizes they
       * are served at, and the art-directed ones are `<picture>` so that a
       * phone fetches exactly one file. The rule has nothing left to catch.
       */
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
