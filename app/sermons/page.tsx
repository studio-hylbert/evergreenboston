import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SermonCard from "@/components/SermonCard";
import SermonPlayer from "@/components/SermonPlayer";
import { fetchVideos } from "@/lib/youtube";
import { formatKoreanDate } from "@/lib/format";
import site from "@/content/site.json";

export const metadata: Metadata = {
  title: "설교 영상",
  description: "주일예배 말씀을 다시 들으실 수 있습니다.",
};

export default async function SermonsPage() {
  const videos = await fetchVideos();
  const sermons = videos.filter((video) => video.isSermon);
  const [latest, ...earlier] = sermons;
  const other = videos.filter((video) => !video.isSermon);

  return (
    <>
      <PageHeader
        title="설교 영상"
        description="주일예배는 매주 유튜브로 실시간 중계되며, 예배 후 영상으로 다시 보실 수 있습니다."
      />

      <div className="mx-auto max-w-5xl px-6 py-14">
        {latest ? (
          <section>
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              가장 최근 말씀
            </h2>
            <div className="mt-4 grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-center">
              <SermonPlayer video={latest} />
              <div>
                <p className="text-sm text-ink-soft">{formatKoreanDate(latest.date)}</p>
                <h3 className="mt-2 font-serif text-2xl leading-snug text-forest-deep">
                  {latest.title ?? latest.rawTitle}
                </h3>
                {latest.preacher ? (
                  <p className="mt-2 text-ink-soft">{latest.preacher}</p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {earlier.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              지난 말씀
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {earlier.map((video) => (
                <SermonCard key={video.videoId} video={video} />
              ))}
            </div>
          </section>
        ) : null}

        {other.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              교회 영상
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {other.map((video) => (
                <SermonCard key={video.videoId} video={video} />
              ))}
            </div>
          </section>
        ) : null}

        {/*
          The feed carries the 15 most recent uploads, so the archive itself
          stays on YouTube rather than being mirrored here.
        */}
        <p className="mt-16 border-t border-ink/10 pt-6 text-sm text-ink-soft">
          더 지난 말씀은{" "}
          <a
            href={site.social.youtube}
            target="_blank"
            rel="noreferrer"
            className="text-forest underline underline-offset-4"
          >
            유튜브 채널
          </a>
          에서 보실 수 있습니다.
        </p>
      </div>
    </>
  );
}
