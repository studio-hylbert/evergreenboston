import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import SermonCard from "@/components/SermonCard";
import CardRail, { RailItem } from "@/components/CardRail";
import { asset } from "@/lib/asset";
import { readVideos } from "@/lib/youtube";
import { read, altFor } from "@/lib/gallery";
import SocialIcon from "@/components/SocialIcon";
import { socialLinks } from "@/lib/social";
import { ui } from "@/lib/ui";
import { otherLocale, t, type Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import { alternatesFor } from "@/lib/site-url";
import site from "@/content/site.json";
import worship from "@/content/worship.json";
import staff from "@/content/staff.json";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return { alternates: alternatesFor(lang, "") };
}

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const strings = ui[lang];
  const videos = readVideos();
  // The rail scrolls, so the cap is about how much is worth catching up on
  // rather than about how much fits.
  const sermons = videos.filter((video) => video.isSermon).slice(0, 6);
  const news = read("news").slice(0, 6);
  const sunday = worship.services.find((service) => service.id === "sunday");
  const dawn = worship.services.find((service) => service.id === "dawn");
  const vision = staff.seniorPastor.quotes.find((quote) => quote.id === "vision");

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <picture>
          {/* One file per viewport: the phone never downloads the 2000px crop. */}
          <source media="(min-width: 768px)" srcSet={asset("/images/hero-forest.jpg")} />
          <img
            src={asset("/images/hero-forest-sm.jpg")}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-deep/85 via-deep/70 to-deep/90" />

        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
          {/* The other language's name, mirroring the header, so neither page
              repeats its own title twice. */}
          <p className="text-sm tracking-[0.2em] text-sage/80">
            {t(site.name, otherLocale(lang))}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-on-deep sm:text-5xl">
            {t(site.name, lang)}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-loose text-sage">{t(site.mission, lang)}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={`/${lang}/visit`}
              className="rounded-md bg-on-deep px-5 py-3 text-sm font-medium text-deep transition hover:bg-sage"
            >
              {strings.home.visitCta}
            </Link>
            <Link
              href={`/${lang}/sermons`}
              className="rounded-md border border-sage/40 px-5 py-3 text-sm font-medium text-on-deep transition hover:border-sage hover:bg-white/10"
            >
              {strings.home.sermonsCta}
            </Link>
          </div>
        </div>
      </section>

      {/*
        The church's stated mission is to reach 나그네 — people newly arrived in
        Boston. The most useful thing the homepage can do is answer "can I come
        this Sunday?", so that sits above everything else.
      */}
      <section className="border-b border-ink/10 bg-tint">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 sm:grid-cols-3">
          <div>
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              {strings.home.sundayLabel}
            </h2>
            <p className="mt-2 font-serif text-2xl text-heading">
              {sunday ? t(sunday.time, lang) : null}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{sunday ? t(sunday.day, lang) : null}</p>
          </div>
          <div>
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              {strings.home.locationLabel}
            </h2>
            <p className="mt-2 font-serif text-lg leading-snug text-heading">
              {site.address.street}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {site.address.city}, {site.address.state} {site.address.zip}
            </p>
            {sunday ? (
              <p className="mt-1 text-sm text-forest">{t(sunday.location, lang)}</p>
            ) : null}
          </div>
          <div>
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              {strings.home.firstTimeLabel}
            </h2>
            <Link
              href={`/${lang}/visit`}
              className="mt-2 inline-block font-serif text-lg text-forest underline underline-offset-4"
            >
              {strings.home.firstTimeCta}
            </Link>
          </div>
        </div>

        {/*
          Sits with the practical information rather than at the foot of the
          page: when, where, how to get here, and where the news is.
        */}
        <div className="mx-auto max-w-5xl px-6 pb-12">
          <div className="border-t border-ink/10 pt-6">
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              {strings.home.followHere}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
              {socialLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-forest hover:underline hover:underline-offset-4"
                  >
                    <SocialIcon name={link.key} className="h-4 w-4" />
                    {t(link.label, lang)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow={strings.home.sermonsEyebrow}
            title={strings.home.sermonsTitle}
            description={strings.home.sermonsDescription}
          />
          <Link href={`/${lang}/sermons`} className="text-sm text-forest underline underline-offset-4">
            {strings.home.viewAll}
          </Link>
        </div>
        <div className="mt-8">
          <CardRail label={strings.home.sermonsTitle}>
            {sermons.map((video) => (
              <RailItem key={video.videoId}>
                <SermonCard video={video} locale={lang} />
              </RailItem>
            ))}
          </CardRail>
        </div>
      </section>

      {/*
        News sits with the sermons and reads the same way — a row you glance
        along, not a banner demanding to be dealt with. A church notice is
        usually a poster about something a few weeks out; it deserves to be
        seen on the way past, and to be easy to ignore.
      */}
      {news.length > 0 ? (
        <section className="border-t border-ink/10 bg-paper-sunk">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow={strings.home.newsEyebrow}
                title={strings.home.newsTitle}
              />
              <Link
                href={`/${lang}/news`}
                className="text-sm text-forest underline underline-offset-4"
              >
                {strings.home.viewAll}
              </Link>
            </div>
            <div className="mt-8">
              <CardRail label={strings.home.newsTitle}>
                {news.map((item) => (
                  <RailItem key={item.slug}>
                    <Link
                      href={`/${lang}/news#${item.slug}`}
                      className="group block overflow-hidden rounded-lg border border-ink/10 bg-card transition hover:border-forest/40 hover:shadow-sm"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-paper-sunk">
                        <img
                          src={asset(item.photos[0].thumbnail.path)}
                          alt={altFor(item.photos[0])}
                          width={item.photos[0].thumbnail.width}
                          height={item.photos[0].thumbnail.height}
                          loading="lazy"
                          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-ink-soft">{formatDate(item.date, lang)}</p>
                        <h3 className="mt-1.5 font-serif text-base leading-snug text-heading">
                          {t(item.title, lang)}
                        </h3>
                      </div>
                    </Link>
                  </RailItem>
                ))}
              </CardRail>
            </div>
          </div>
        </section>
      ) : null}

      {/*
        The pastor's stated vision, in his own words. It says the same thing as
        /about — every generation in one room, in Korean — but a sentence
        someone signed his name to carries it further than a list of values,
        and it gives the homepage a door to who leads the church.
      */}
      {vision ? (
        <section className="border-y border-ink/10 bg-tint">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              {strings.home.visionEyebrow}
            </h2>
            <blockquote className="mt-4 max-w-3xl font-serif text-2xl leading-relaxed text-heading sm:text-3xl">
              “{t(vision.text, lang)}”
            </blockquote>
            <p className="mt-6 text-sm text-ink-soft">
              {strings.pastor.byline(
                t(staff.seniorPastor.name, lang),
                t(staff.seniorPastor.role, lang)
              )}
            </p>
            <Link
              href={`/${lang}/pastor`}
              className="mt-2 inline-block text-sm text-forest underline underline-offset-4"
            >
              {strings.home.pastorCta}
            </Link>
          </div>
        </section>
      ) : null}

      <section className="border-t border-ink/10 bg-paper-sunk">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <SectionHeading
            eyebrow={strings.home.gatherEyebrow}
            title={strings.home.gatherTitle}
            description={strings.home.gatherDescription}
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <article className="rounded-lg border border-ink/10 bg-card p-6">
              <h3 className="font-serif text-lg text-heading">
                {dawn ? t(dawn.name, lang) : null}
              </h3>
              <p className="mt-1 text-sm text-ink-soft">
                {dawn ? `${t(dawn.day, lang)} ${t(dawn.time, lang)} · ${t(dawn.location, lang)}` : null}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {dawn ? t(dawn.description, lang) : null}
              </p>
            </article>
            <article className="rounded-lg border border-ink/10 bg-card p-6">
              <h3 className="font-serif text-lg text-heading">{strings.community.kakaoName}</h3>
              <p className="mt-1 text-sm text-ink-soft">
                {strings.community.kakaoMeta(worship.kakaoJoinCode)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {strings.community.kakaoDescription}
              </p>
              <a
                href={site.social.kakaoOpenChat}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-forest underline underline-offset-4"
              >
                {strings.community.kakaoCta}
              </a>
            </article>
            <article className="rounded-lg border border-ink/10 bg-card p-6">
              <h3 className="font-serif text-lg text-heading">{strings.community.stravaName}</h3>
              <p className="mt-1 text-sm text-ink-soft">Strava</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {strings.community.stravaDescription}
              </p>
              <a
                href={site.social.strava}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-forest underline underline-offset-4"
              >
                {strings.community.stravaCta}
              </a>
            </article>
          </div>

        </div>
      </section>
    </>
  );
}
