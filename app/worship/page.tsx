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
        description="온 세대가 함께 예배합니다. 처음 오시는 분도 그대로 오시면 됩니다."
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
                {service.live ? (
                  <span className="rounded-full bg-brass/15 px-2.5 py-1 text-xs text-brass">
                    실시간 중계
                  </span>
                ) : null}
              </div>
              <p className="mt-3 font-serif text-2xl text-forest">
                {service.day} {service.time}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{service.location}</p>
              <p className="mt-4 leading-relaxed text-ink-soft">{service.description}</p>

              {service.live ? (
                <a
                  href={site.social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block text-sm text-forest underline underline-offset-4"
                >
                  유튜브에서 실시간으로 참여하기
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

        <section className="mt-14 max-w-2xl">
          <h2 className="font-serif text-2xl font-semibold text-forest-deep">
            처음 오시는 분께
          </h2>
          <dl className="mt-6 divide-y divide-ink/10 border-t border-ink/10">
            <div className="py-5">
              <dt className="font-medium text-forest">무엇을 입고 가야 하나요?</dt>
              <dd className="mt-1.5 leading-relaxed text-ink-soft">
                편한 복장으로 오시면 됩니다. 특별히 갖춰 입으실 필요는 없습니다.
              </dd>
            </div>
            <div className="py-5">
              <dt className="font-medium text-forest">몇 시까지 가야 하나요?</dt>
              <dd className="mt-1.5 leading-relaxed text-ink-soft">
                예배 10분 전쯤 오시면 자리를 안내받으실 수 있습니다.
                늦으셔도 괜찮으니 편하게 들어오세요.
              </dd>
            </div>
            <div className="py-5">
              <dt className="font-medium text-forest">아이와 함께 가도 되나요?</dt>
              <dd className="mt-1.5 leading-relaxed text-ink-soft">
                온 세대가 함께 드리는 예배입니다. 아이와 함께 오셔도 좋습니다.
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}
