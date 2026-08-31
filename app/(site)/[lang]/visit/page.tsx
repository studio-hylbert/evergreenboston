import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { asset } from "@/lib/asset";
import { ui } from "@/lib/ui";
import { t, type Locale } from "@/lib/i18n";
import type { TransitRow } from "@/lib/content";
import { alternatesFor } from "@/lib/site-url";
import site from "@/content/site.json";
import worship from "@/content/worship.json";
import visit from "@/content/visit.json";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    alternates: alternatesFor(lang, "visit"),
    title: ui[lang].visit.title,
    description: `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`,
  };
}

export default async function VisitPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const strings = ui[lang];
  const sunday = worship.services.find((service) => service.id === "sunday");
  const transit: TransitRow[] = visit.transit;

  return (
    <>
      <PageHeader title={strings.visit.title} description={strings.visit.description} />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              {strings.visit.addressLabel}
            </h2>
            <address className="mt-3 font-serif text-2xl leading-snug text-forest-deep not-italic">
              {site.address.street}
              <br />
              {site.address.city}, {site.address.state} {site.address.zip}
            </address>
            <p className="mt-3 text-sm text-ink-soft">{t(site.address.note, lang)}</p>

            <a
              href={site.address.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block rounded-md bg-forest px-5 py-3 text-sm font-medium text-paper transition hover:bg-forest-deep"
            >
              {strings.visit.mapCta}
            </a>

            <dl className="mt-10 divide-y divide-ink/10 border-t border-ink/10">
              <div className="py-5">
                <dt className="text-sm text-ink-soft">{strings.visit.timeLabel}</dt>
                <dd className="mt-1 font-serif text-lg text-forest-deep">
                  {sunday ? `${t(sunday.name, lang)} · ${t(sunday.day, lang)} ${t(sunday.time, lang)}` : null}
                </dd>
              </div>
              {sunday ? (
                <div className="py-5">
                  <dt className="text-sm text-ink-soft">{strings.visit.placeLabel}</dt>
                  <dd className="mt-1 font-serif text-lg text-forest-deep">
                    {t(sunday.location, lang)}
                  </dd>
                </div>
              ) : null}
              {/*
                Rows appear only once the church has confirmed the detail.
                Nothing is written here to stand in for information we do not
                have — an empty list simply renders nothing.
              */}
              {transit.map((item) => (
                <div key={item.mode.ko} className="py-5">
                  <dt className="text-sm text-ink-soft">{t(item.mode, lang)}</dt>
                  <dd className="mt-1 leading-relaxed">{t(item.detail, lang)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure>
            <picture>
              <source media="(min-width: 768px)" srcSet={asset("/images/church-exterior.jpg")} />
              <img
                src={asset("/images/church-exterior-sm.jpg")}
                alt={strings.visit.buildingAlt}
                className="w-full rounded-lg"
              />
            </picture>
            {/*
              CC BY-SA 4.0 requires the photographer, the licence and a link
              back. See IMAGE-CREDITS.md — this notice can go when the church
              supplies its own photograph.
            */}
            <figcaption className="mt-3 text-xs text-ink-soft">
              {strings.visit.photoCredit}:{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:All_Saints_Parish_Church_1773_Beacon_Street_Brookline_Massachusetts.jpg"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                EgorovaSvetlana
              </a>
              ,{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                CC BY-SA 4.0
              </a>
            </figcaption>
          </figure>
        </div>
      </div>
    </>
  );
}
