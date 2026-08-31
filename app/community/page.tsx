import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import site from "@/content/site.json";
import worship from "@/content/worship.json";

export const metadata: Metadata = {
  title: "공동체",
  description: "주일 외에도 한 주간 함께 모입니다.",
};

const gatherings = [
  {
    name: "새가족 오픈카톡",
    meta: `참여코드 ${worship.kakaoJoinCode}`,
    description:
      "주간 교회 소식을 나누고 궁금한 점을 편하게 물어보실 수 있습니다. 처음 오신 분들이 가장 먼저 만나는 자리입니다.",
    href: site.social.kakaoOpenChat,
    hrefLabel: "오픈카톡 참여하기",
  },
  {
    name: "이른아침기도회",
    meta: "화–토 오전 6:00 · Zoom",
    description:
      "화요일부터 토요일까지 매일 아침 온라인으로 함께 기도합니다. 어디에 계시든 참여하실 수 있습니다.",
    href: worship.services.find((service) => service.id === "dawn")?.zoomUrl,
    hrefLabel: "Zoom으로 참여하기",
  },
  {
    name: "늘푸른 Runner's Club",
    meta: "Strava",
    description:
      "함께 걷고 달리며 몸과 마음을 돌봅니다. 달리기가 처음이어도 괜찮습니다.",
    href: site.social.strava,
    hrefLabel: "클럽 보기",
  },
  {
    name: "사역 캘린더",
    meta: "Google Sheets",
    description:
      "한 해의 예배와 행사 일정을 한눈에 보실 수 있습니다.",
    href: site.links.ministryCalendar,
    hrefLabel: "캘린더 보기",
  },
];

export default function CommunityPage() {
  return (
    <>
      <PageHeader
        title="공동체"
        description="주일 외에도 한 주간 함께 모입니다."
      />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          {gatherings.map((gathering) => (
            <article
              key={gathering.name}
              className="flex flex-col rounded-lg border border-ink/10 bg-white p-7"
            >
              <h2 className="font-serif text-xl text-forest-deep">{gathering.name}</h2>
              <p className="mt-1 text-sm text-ink-soft">{gathering.meta}</p>
              <p className="mt-4 flex-1 leading-relaxed text-ink-soft">
                {gathering.description}
              </p>
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
          <h2 className="font-serif text-xl text-forest-deep">소식 받아보기</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
            교회의 주간 소식과 사진은 인스타그램과 페이스북에도 올라옵니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-forest/30 px-4 py-2.5 text-sm text-forest transition hover:bg-white"
            >
              Instagram
            </a>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-forest/30 px-4 py-2.5 text-sm text-forest transition hover:bg-white"
            >
              Facebook
            </a>
            <a
              href={site.social.youtube}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-forest/30 px-4 py-2.5 text-sm text-forest transition hover:bg-white"
            >
              YouTube
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
