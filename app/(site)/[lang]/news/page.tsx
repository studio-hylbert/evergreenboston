import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { read, altFor } from "@/lib/gallery";
import { asset } from "@/lib/asset";
import { formatDate } from "@/lib/format";
import { ui } from "@/lib/ui";
import { t, type Locale } from "@/lib/i18n";
import { alternatesFor } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    alternates: alternatesFor(lang, "news"),
    title: ui[lang].news.title,
    description: ui[lang].news.description,
  };
}

export default async function NewsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const strings = ui[lang];
  const items = read("news");

  return (
    <>
      <PageHeader title={strings.news.title} description={strings.news.description} />

      {/*
        Every notice in full, on one page. There are no per-notice pages: a
        notice is a poster, and a poster is the whole of what there is to read,
        so a page whose only job is to show one of them would be a click that
        buys nothing. It also keeps the section from breaking the build when the
        church clears it out — a static export needs at least one address for a
        dynamic route, and "no notices right now" is a perfectly ordinary state.
      */}
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="grid gap-16">
          {items.map((item) => (
            <article key={item.slug} id={item.slug} className="scroll-mt-24">
              <p className="text-xs text-ink-soft">{formatDate(item.date, lang)}</p>
              <h2 className="mt-1.5 font-serif text-2xl leading-snug text-heading">
                {t(item.title, lang)}
              </h2>
              <div className="mt-5 grid gap-6">
                {item.photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={asset(photo.full.path)}
                    className="block overflow-hidden rounded-lg border border-ink/10 bg-card"
                    aria-label={strings.gallery.openPhoto}
                  >
                    <img
                      src={asset(photo.full.path)}
                      alt={altFor(photo)}
                      width={photo.full.width}
                      height={photo.full.height}
                      loading="lazy"
                      className="w-full"
                    />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
