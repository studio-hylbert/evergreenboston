import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { asset } from "@/lib/asset";
import site from "@/content/site.json";
import worship from "@/content/worship.json";
import visit from "@/content/visit.json";

export const metadata: Metadata = {
  title: "찾아오시는 길",
  description: `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`,
};

export default function VisitPage() {
  const sunday = worship.services.find((service) => service.id === "sunday");

  return (
    <>
      <PageHeader
        title="찾아오시는 길"
        description="브루클라인 Beacon Street에 있는 All Saints Parish 예배당에서 모입니다."
      />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">주소</h2>
            <address className="mt-3 font-serif text-2xl leading-snug text-forest-deep not-italic">
              {site.address.street}
              <br />
              {site.address.city}, {site.address.state} {site.address.zip}
            </address>
            <p className="mt-3 text-sm text-ink-soft">{site.address.note}</p>

            <a
              href={site.address.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block rounded-md bg-forest px-5 py-3 text-sm font-medium text-paper transition hover:bg-forest-deep"
            >
              구글 지도에서 길찾기
            </a>

            <dl className="mt-10 divide-y divide-ink/10 border-t border-ink/10">
              <div className="py-5">
                <dt className="text-sm text-ink-soft">예배 시간</dt>
                <dd className="mt-1 font-serif text-lg text-forest-deep">
                  {sunday?.name} · {sunday?.day} {sunday?.time}
                </dd>
              </div>
              {visit.transit.map((item) => (
                <div key={item.mode} className="py-5">
                  <dt className="text-sm text-ink-soft">{item.mode}</dt>
                  <dd className="mt-1 leading-relaxed">{item.detail}</dd>
                  {item.note ? (
                    <dd className="mt-1 text-sm text-ink-soft">{item.note}</dd>
                  ) : null}
                </div>
              ))}
            </dl>

            <p className="mt-8 rounded-lg bg-sage/50 p-5 leading-relaxed text-forest-deep">
              {visit.arrivalNote}
            </p>
          </div>

          <figure>
            <picture>
              <source
                media="(min-width: 768px)"
                srcSet={asset("/images/church-exterior.jpg")}
              />
              <img
                src={asset("/images/church-exterior-sm.jpg")}
                alt="All Saints Parish 예배당 외관. 아치형 창이 있는 석조 건물이다."
                className="w-full rounded-lg"
              />
            </picture>
            {/*
              CC BY-SA 4.0 requires the photographer, the licence and a link
              back. See IMAGE-CREDITS.md — this notice can go when the church
              supplies its own photograph.
            */}
            <figcaption className="mt-3 text-xs text-ink-soft">
              사진:{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:All_Saints_Parish_Church_1773_Beacon_Street_Brookline_Massachusetts.jpg"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                EgorovaSvetlana
              </a>
              ,{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                CC BY-SA 4.0
              </a>
            </figcaption>
          </figure>
        </div>
      </div>
    </>
  );
}
