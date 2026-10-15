import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SermonCard, { ShortCard, VideoByline } from "@/components/SermonCard";
import CardRail, { RailItem } from "@/components/CardRail";
import SermonPlayer from "@/components/SermonPlayer";
import { readVideos } from "@/lib/youtube";
import { formatDate } from "@/lib/format";
import { ui } from "@/lib/ui";
import type { Locale } from "@/lib/i18n";
import { alternatesFor } from "@/lib/site-url";
import site from "@/content/site.json";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    alternates: alternatesFor(lang, "sermons"),
    title: ui[lang].sermons.title,
    description: ui[lang].sermons.description,
  };
}

export default async function SermonsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const strings = ui[lang];
  const videos = readVideos();
  const sermons = videos.filter((video) => video.category === "sermon");
  const [latest, ...earlier] = sermons;
  const shorts = videos.filter((video) => video.category === "short");
  const community = videos.filter((video) => video.category === "community");

  return (
    <>
      <PageHeader title={strings.sermons.title} description={strings.sermons.description} />

      <div className="mx-auto max-w-5xl px-6 py-14">
        {latest ? (
          <section>
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              {strings.sermons.latest}
            </h2>
            <div className="mt-4 grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-center">
              <SermonPlayer video={latest} playLabel={strings.sermons.play} />
              <div>
                <p className="text-sm text-ink-soft">{formatDate(latest.date, lang)}</p>
                <h3 className="mt-2 font-serif text-2xl leading-snug text-heading">
                  {latest.title}
                </h3>
                <VideoByline video={latest} className="mt-2 text-ink-soft" />
              </div>
            </div>
          </section>
        ) : null}

        {/*
          Straight after the latest sermon rather than after the archive:
          Shorts are what the channel posts most often, and the rail is one
          row however many there are, so it pushes the archive down very little.
        */}
        {shorts.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              {strings.sermons.shorts}
            </h2>
            <div className="mt-4">
              <CardRail label={strings.sermons.shorts}>
                {shorts.map((video) => (
                  <RailItem key={video.videoId} narrow>
                    <ShortCard video={video} locale={lang} />
                  </RailItem>
                ))}
              </CardRail>
            </div>
          </section>
        ) : null}

        {earlier.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              {strings.sermons.past}
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {earlier.map((video) => (
                <SermonCard key={video.videoId} video={video} locale={lang} />
              ))}
            </div>
          </section>
        ) : null}

        {community.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              {strings.sermons.community}
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {community.map((video) => (
                <SermonCard key={video.videoId} video={video} locale={lang} />
              ))}
            </div>
          </section>
        ) : null}

        {/*
          The feed carries the 15 most recent uploads, so the archive itself
          stays on YouTube rather than being mirrored here.
        */}
        <p className="mt-16 border-t border-ink/10 pt-6 text-sm text-ink-soft">
          {strings.sermons.archivePrefix}
          <a
            href={site.social.youtube}
            target="_blank"
            rel="noreferrer"
            className="text-forest underline underline-offset-4"
          >
            {strings.sermons.archiveLink}
          </a>
          {strings.sermons.archiveSuffix}
        </p>
      </div>
    </>
  );
}
