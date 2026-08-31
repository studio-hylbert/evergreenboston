import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Prose from "@/components/Prose";
import { loadPage } from "@/lib/content";
import { ui } from "@/lib/ui";
import { t, type Locale } from "@/lib/i18n";
import { alternatesFor } from "@/lib/site-url";
import site from "@/content/site.json";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const page = loadPage("about", lang);
  return {
    alternates: alternatesFor(lang, "about"),
    title: page.title,
    description: page.description,
  };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const page = loadPage("about", lang);
  const strings = ui[lang];

  return (
    <>
      <PageHeader title={page.title} description={page.description} />
      <div className="mx-auto max-w-5xl px-6 py-14">
        <Prose html={page.html} />

        <dl className="mt-14 max-w-2xl divide-y divide-ink/10 border-t border-ink/10 text-sm">
          <div className="flex gap-6 py-4">
            <dt className="w-28 shrink-0 text-ink-soft">
              {lang === "ko" ? "교단" : "Denomination"}
            </dt>
            <dd>
              <a
                href={site.denomination.url}
                target="_blank"
                rel="noreferrer"
                className="text-forest underline underline-offset-4"
              >
                {t(site.denomination.name, lang)}
              </a>
            </dd>
          </div>
          <div className="flex gap-6 py-4">
            <dt className="w-28 shrink-0 text-ink-soft">{strings.visit.placeLabel}</dt>
            <dd>
              {site.address.street}, {site.address.city}, {site.address.state} {site.address.zip}
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
