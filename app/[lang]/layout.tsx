import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import site from "@/content/site.json";
import { htmlLang, isLocale, locales, t, type Locale } from "@/lib/i18n";
import "../globals.css";

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

/* Both language trees are generated at build time; nothing is resolved later. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const name = t(site.name, lang);
  return {
    title: { default: `${name} | ${t(site.name, lang === "ko" ? "en" : "ko")}`, template: `%s | ${name}` },
    description: t(site.mission, lang),
    openGraph: { title: name, description: t(site.mission, lang), locale: lang === "ko" ? "ko_KR" : "en_US", type: "website" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  return (
    <html lang={htmlLang[locale]} className={`${notoSansKr.variable} ${notoSerifKr.variable}`}>
      <body className="font-sans flex min-h-screen flex-col">
        <SiteHeader locale={locale} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
