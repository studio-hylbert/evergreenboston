import type { Metadata } from "next";
import "../globals.css";

/**
 * A second root layout, for `/` alone. Route groups let the locale tree keep
 * its own root layout in `(site)/[lang]`, which is what sets `<html lang>` per
 * language — something a shared root could not do.
 */
export const metadata: Metadata = {
  title: "보스톤늘푸른교회 | The Evergreen Church of Boston",
  // This page only forwards; the two language trees are what should be indexed.
  robots: { index: false, follow: true },
};

export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
