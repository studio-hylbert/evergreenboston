import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { asset } from "@/lib/asset";
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
        {/*
          Above the times rather than below them. Someone who has never been
          asks "what is it like?" before "what time?", and this is the only
          answer the page can give without them coming.
        */}
        <figure>
          <picture>
            {/* One file per viewport: the phone never downloads the 1600px crop. */}
            <source media="(min-width: 768px)" srcSet={asset("/images/worship-service.jpg")} />
            <img
              src={asset("/images/worship-service-sm.jpg")}
              alt={strings.worship.sceneAlt}
              width={1600}
              height={900}
              className="w-full rounded-lg"
            />
          </picture>
        </figure>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {worship.services.map((service) => (
            <article key={service.id} className="rounded-lg border border-ink/10 bg-card p-7">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-xl text-heading">{t(service.name, lang)}</h2>
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
                No public joining link for the prayer meeting; whoever wants to
                come asks in the newcomers' chat. Setting `zoomUrl` in
                content/worship.json restores a direct link.
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
