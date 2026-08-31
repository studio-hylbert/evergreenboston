import Link from "next/link";
import { defaultLocale, htmlLang, locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site-url";

/**
 * `/` picks a language and forwards.
 *
 * A static export has no server, so there is nothing to negotiate
 * `Accept-Language` against, and `middleware` does not run under
 * `output: export`. The choice is therefore made in the browser.
 *
 * The script is inlined rather than run from a `useEffect` so that it fires
 * while the document is parsing, before React hydrates — a redirect a reader
 * waits for is a redirect they notice.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const redirectScript = `
(function () {
  var supported = ${JSON.stringify(locales)};
  var chosen = null;

  try {
    var saved = window.localStorage.getItem("locale");
    if (supported.indexOf(saved) !== -1) chosen = saved;
  } catch (e) {
    /* Private browsing can refuse storage; fall through to the browser. */
  }

  if (!chosen) {
    var prefs = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < prefs.length && !chosen; i++) {
      var tag = String(prefs[i]).toLowerCase();
      for (var j = 0; j < supported.length; j++) {
        if (tag === supported[j] || tag.indexOf(supported[j] + "-") === 0) {
          chosen = supported[j];
          break;
        }
      }
    }
  }

  /* Korean is what the congregation worships in, so an unrecognised browser
     setting gets Korean. */
  location.replace(${JSON.stringify(basePath)} + "/" + (chosen || ${JSON.stringify(defaultLocale)}) + "/");
})();
`;

export const metadata = {
  alternates: {
    canonical: `${siteUrl}/${defaultLocale}/`,
    languages: Object.fromEntries(
      locales.map((l) => [htmlLang[l], `${siteUrl}/${l}/`])
    ),
  },
};

export default function EntryPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      {/* Without JavaScript the reader chooses. */}
      <noscript>
        <p>
          <Link href="/ko">한국어로 보기</Link>
        </p>
        <p>
          <Link href="/en">View in English</Link>
        </p>
      </noscript>
    </>
  );
}
