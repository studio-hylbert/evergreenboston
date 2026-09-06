"use client";

import { useEffect, useState } from "react";
import { ui } from "@/lib/ui";
import type { Locale } from "@/lib/i18n";

/**
 * When each refresh workflow last ran, read in the browser from GitHub's API.
 *
 * The question this answers is "is the automation still alive?", and the
 * timestamp has to move even on the runs that change nothing — otherwise a
 * quiet fortnight is indistinguishable from a broken pipeline, which is the
 * whole thing it exists to rule out.
 *
 * That rules out baking it into the page. A static site only changes when it
 * deploys, and it only deploys when content changes, so a "checked" time in the
 * HTML could only ever be as old as the last content change. Committing one on
 * every run instead would mean roughly thirty commits a day, eleven thousand a
 * year, in a repository meant to be handed to a church.
 *
 * So it is fetched at read time. The repository is public, so the call needs no
 * token — which matters, because a token in a static site is a token given
 * away. Unauthenticated callers get sixty requests an hour per address; this
 * makes one per page view, and when it fails the line simply does not appear.
 */
const REPO = "studio-hylbert/evergreenboston";

/** Workflow file to the part of the site it feeds. */
const WATCHED: Record<string, (strings: (typeof ui)["ko"]) => string> = {
  "refresh-youtube.yml": (strings) => strings.nav.sermons,
  "refresh-gallery.yml": (strings) => strings.footer.newsAndPhotos,
};

type Checked = { label: string; ranAt: number };

export default function LastChecked({ locale }: { locale: Locale }) {
  const strings = ui[locale];
  const [checked, setChecked] = useState<Checked[] | null>(null);

  useEffect(() => {
    const aborter = new AbortController();

    async function load() {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${REPO}/actions/runs?status=success&per_page=30`,
          { signal: aborter.signal, headers: { Accept: "application/vnd.github+json" } }
        );
        if (!response.ok) return;

        const { workflow_runs: runs } = await response.json();
        const newest = new Map<string, number>();

        for (const run of runs ?? []) {
          const file = String(run.path ?? "").split("/").pop() ?? "";
          if (!(file in WATCHED)) continue;
          // The list arrives newest first, so the first of each is the one.
          if (!newest.has(file)) newest.set(file, Date.parse(run.created_at));
        }

        setChecked(
          [...newest].map(([file, ranAt]) => ({ label: WATCHED[file](strings), ranAt }))
        );
      } catch {
        // Offline, rate-limited, or GitHub is down. The line stays away rather
        // than showing a number nobody can trust.
      }
    }

    load();
    return () => aborter.abort();
  }, [strings]);

  if (!checked || checked.length === 0) return null;

  return (
    <div className="border-t border-sage/15">
      <div className="mx-auto flex max-w-5xl flex-wrap items-baseline gap-x-4 gap-y-1 px-6 py-4 text-xs text-sage/45">
        <span>{strings.footer.checked}</span>
        {checked.map((source) => (
          <span key={source.label}>
            {source.label} {ago(source.ranAt, locale)}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Written out here rather than left to `Intl.RelativeTimeFormat`, for the same
 * reason `lib/format.ts` assembles its dates by hand: the wording should not
 * depend on which locale data the reader's browser happens to ship.
 */
function ago(at: number, locale: Locale): string {
  const minutes = Math.max(0, Math.round((Date.now() - at) / 60000));

  if (locale === "en") {
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.round(hours / 24)}일 전`;
}
