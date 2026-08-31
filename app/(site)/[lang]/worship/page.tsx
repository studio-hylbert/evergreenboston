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
    alternates: alternatesFor(lang, "worship"),
    title: ui[lang].worship.title,
    description: ui[lang].worship.description,
  };
}

export default async function WorshipPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const strings = ui[lang];

  return (
    <>
      <PageHeader title={strings.worship.title} description={strings.worship.description} />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          {worship.services.map((service) => (
            <article key={service.id} className="rounded-lg border border-ink/10 bg-white p-7">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-xl text-forest-deep">{t(service.name, lang)}</h2>
                {service.recorded ? (
                  <span className="rounded-full bg-brass/15 px-2.5 py-1 text-xs text-brass">
                    {strings.worship.recordedBadge}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 font-serif text-2xl text-forest">
                {t(service.day, lang)} {t(service.time, lang)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{t(service.location, lang)}</p>
              <p className="mt-4 leading-relaxed text-ink-soft">{t(service.description, lang)}</p>

              {service.recorded ? (
                <a
                  href={site.social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block text-sm text-forest underline underline-offset-4"
                >
                  {strings.worship.watchPast}
                </a>
              ) : null}
              {/*
                No public joining link for the prayer meeting, so it is not
                published here. Whoever wants to join asks in the newcomers'
                chat instead. See CONTENT-CHECKLIST.md.
              */}
              {service.id === "dawn" ? (
                <a
                  href={service.zoomUrl || site.social.kakaoOpenChat}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block text-sm text-forest underline underline-offset-4"
                >
                  {service.zoomUrl ? strings.worship.joinZoom : strings.worship.askHowToJoin}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
