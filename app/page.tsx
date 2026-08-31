import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import SermonCard from "@/components/SermonCard";
import { asset } from "@/lib/asset";
import { fetchVideos } from "@/lib/youtube";
import site from "@/content/site.json";
import worship from "@/content/worship.json";

export default async function Home() {
  const videos = await fetchVideos();
  const sermons = videos.filter((video) => video.isSermon).slice(0, 3);
  const sunday = worship.services.find((service) => service.id === "sunday");
  const dawn = worship.services.find((service) => service.id === "dawn");

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
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-deep/85 via-forest-deep/70 to-forest-deep/90" />

        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <p className="text-sm tracking-[0.2em] text-sage/80 uppercase">{site.name.en}</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-paper sm:text-5xl">
            {site.name.ko}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-loose text-sage">{site.mission}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/visit"
              className="rounded-md bg-paper px-5 py-3 text-sm font-medium text-forest-deep transition hover:bg-white"
            >
              찾아오시는 길
            </Link>
            <Link
              href="/sermons"
              className="rounded-md border border-sage/40 px-5 py-3 text-sm font-medium text-paper transition hover:border-sage hover:bg-white/10"
            >
              설교 영상 보기
            </Link>
          </div>
        </div>
      </section>

      {/*
        The church's stated mission is to reach 나그네 — people newly arrived in
        Boston. The single most useful thing the homepage can do is answer "can I
        come this Sunday?", so that sits above everything else.
      */}
      <section className="border-b border-ink/10 bg-sage/40">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 sm:grid-cols-3">
          <div>
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">주일예배</h2>
            <p className="mt-2 font-serif text-2xl text-forest-deep">{sunday?.time}</p>
            <p className="mt-1 text-sm text-ink-soft">매주 {sunday?.day}</p>
          </div>
          <div>
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">장소</h2>
            <p className="mt-2 font-serif text-lg leading-snug text-forest-deep">
              {site.address.street}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {site.address.city}, {site.address.state} {site.address.zip}
            </p>
            {sunday?.location ? (
              <p className="mt-1 text-sm text-forest">{sunday.location}</p>
            ) : null}
          </div>
          <div>
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">처음 오시나요</h2>
            <Link
              href="/visit"
              className="mt-2 inline-block font-serif text-lg text-forest underline underline-offset-4"
            >
              오시는 길 안내
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="말씀"
            title="최근 설교"
            description="주일예배 말씀을 유튜브로 다시 들으실 수 있습니다."
          />
          <Link href="/sermons" className="text-sm text-forest underline underline-offset-4">
            전체 보기
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sermons.map((video) => (
            <SermonCard key={video.videoId} video={video} />
          ))}
        </div>
      </section>

      <section className="border-t border-ink/10 bg-paper-sunk">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <SectionHeading
            eyebrow="함께"
            title="이번 주 함께하는 자리"
            description="주일 외에도 한 주간 함께 모입니다."
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <article className="rounded-lg border border-ink/10 bg-white p-6">
              <h3 className="font-serif text-lg text-forest-deep">{dawn?.name}</h3>
              <p className="mt-1 text-sm text-ink-soft">
                {dawn?.day} {dawn?.time} · {dawn?.location}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{dawn?.description}</p>
            </article>
            <article className="rounded-lg border border-ink/10 bg-white p-6">
              <h3 className="font-serif text-lg text-forest-deep">새가족 오픈카톡</h3>
              <p className="mt-1 text-sm text-ink-soft">참여코드 {worship.kakaoJoinCode}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                주간 교회 소식을 나누고 궁금한 점을 편하게 물어보실 수 있습니다.
              </p>
              <a
                href={site.social.kakaoOpenChat}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-forest underline underline-offset-4"
              >
                오픈카톡 참여하기
              </a>
            </article>
            <article className="rounded-lg border border-ink/10 bg-white p-6">
              <h3 className="font-serif text-lg text-forest-deep">늘푸른 Runner&apos;s Club</h3>
              <p className="mt-1 text-sm text-ink-soft">Strava</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                함께 걷고 달리며 몸과 마음을 돌봅니다.
              </p>
              <a
                href={site.social.strava}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-forest underline underline-offset-4"
              >
                클럽 보기
              </a>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
