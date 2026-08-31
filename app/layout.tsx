import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import site from "@/content/site.json";
import "./globals.css";

/*
 * Both families are downloaded at build time and served from the site's own
 * origin, so no visitor is handed a request to Google.
 */
const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name.ko} | ${site.name.en}`,
    template: `%s | ${site.name.ko}`,
  },
  description: site.mission,
  openGraph: {
    title: `${site.name.ko} ${site.name.en}`,
    description: site.mission,
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${notoSerifKr.variable}`}>
      <body className="font-sans flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
