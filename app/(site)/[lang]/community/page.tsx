import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { ui } from "@/lib/ui";
import { t, type Locale } from "@/lib/i18n";
import { alternatesFor } from "@/lib/site-url";
import site from "@/content/site.json";
import worship from "@/content/worship.json";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    alternates: alternatesFor(lang, "community"),
    title: ui[lang].community.title,
    description: ui[lang].community.description,
  };
}

export default async function CommunityPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const strings = ui[lang];
  const dawn = worship.services.find((service) => service.id === "dawn");

  const gatherings = [
    {
      name: strings.community.kakaoName,
      meta: strings.community.kakaoMeta(worship.kakaoJoinCode),
      description: strings.community.kakaoDescription,
      href: site.social.kakaoOpenChat,
      hrefLabel: strings.community.kakaoCta,
    },
    {
      name: dawn ? t(dawn.name, lang) : "",
      meta: dawn ? `${t(dawn.day, lang)} ${t(dawn.time, lang)} · ${t(dawn.location, lang)}` : "",
      description: dawn ? t(dawn.description, lang) : "",
      href: dawn?.zoomUrl || site.social.kakaoOpenChat,
      hrefLabel: dawn?.zoomUrl ? strings.community.dawnCta : strings.community.dawnAskCta,
    },
    {
      name: strings.community.stravaName,
      meta: "Strava",
      description: strings.community.stravaDescription,
      href: site.social.strava,
      hrefLabel: strings.community.stravaCta,
    },
    {
      name: strings.community.calendarName,
      meta: "Google Sheets",
      description: strings.community.calendarDescription,
      href: site.links.ministryCalendar,
      hrefLabel: strings.community.calendarCta,
    },
  ];

  return (
    <>
      <PageHeader title={strings.community.title} description={strings.community.description} />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          {gatherings.map((gathering) => (
            <article
              key={gathering.name}
              className="flex flex-col rounded-lg border border-ink/10 bg-white p-7"
            >
              <h2 className="font-serif text-xl text-forest-deep">{gathering.name}</h2>
              <p className="mt-1 text-sm text-ink-soft">{gathering.meta}</p>
              <p className="mt-4 flex-1 leading-relaxed text-ink-soft">{gathering.description}</p>
              {gathering.href ? (
                <a
                  href={gathering.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 text-sm text-forest underline underline-offset-4"
                >
                  {gathering.hrefLabel}
                </a>
              ) : null}
            </article>
          ))}
        </div>

        <section className="mt-14 rounded-lg bg-sage/50 p-8">
          <h2 className="font-serif text-xl text-forest-deep">{strings.community.followTitle}</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
            {strings.community.followDescription}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {(["instagram", "facebook", "youtube"] as const).map((key) => (
              <a
                key={key}
                href={site.social[key]}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-forest/30 px-4 py-2.5 text-sm text-forest capitalize transition hover:bg-white"
              >
                {key}
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
