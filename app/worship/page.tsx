import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import site from "@/content/site.json";
import worship from "@/content/worship.json";

export const metadata: Metadata = {
  title: "예배",
  description: "주일예배와 이른아침기도회 안내입니다.",
};

export default function WorshipPage() {
  return (
    <>
      <PageHeader
        title="예배"
        description="온 세대가 함께 예배합니다."
      />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          {worship.services.map((service) => (
            <article
              key={service.id}
              className="rounded-lg border border-ink/10 bg-white p-7"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-xl text-forest-deep">{service.name}</h2>
                {service.recorded ? (
                  <span className="rounded-full bg-brass/15 px-2.5 py-1 text-xs text-brass">
                    영상 제공
                  </span>
                ) : null}
              </div>
              <p className="mt-3 font-serif text-2xl text-forest">
                {service.day} {service.time}
              </p>
              {service.location ? (
                <p className="mt-1 text-sm text-ink-soft">{service.location}</p>
              ) : null}
              <p className="mt-4 leading-relaxed text-ink-soft">{service.description}</p>

              {service.recorded ? (
                <a
                  href={site.social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block text-sm text-forest underline underline-offset-4"
                >
                  지난 예배 영상 보기
                </a>
              ) : null}
              {service.zoomUrl ? (
                <a
                  href={service.zoomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block text-sm text-forest underline underline-offset-4"
                >
                  Zoom으로 참여하기
                </a>
              ) : null}
            </article>
          ))}
        </div>

      </div>
    </>
  );
}
