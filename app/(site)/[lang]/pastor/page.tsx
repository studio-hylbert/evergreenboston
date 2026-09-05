import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { asset } from "@/lib/asset";
import { formatDate } from "@/lib/format";
import { ui } from "@/lib/ui";
import { t, type Locale, type Localized } from "@/lib/i18n";
import { alternatesFor } from "@/lib/site-url";
import staff from "@/content/staff.json";

const pastor = staff.seniorPastor;

/*
 * A photograph of a person needs its own alt text, so the file and the
 * description are supplied together or not at all. Having one without the
 * other stops the build rather than publishing an unlabelled portrait.
 */
if (Boolean(pastor.photo) !== Boolean(pastor.photoAlt.ko && pastor.photoAlt.en)) {
  throw new Error("content/staff.json: seniorPastor.photo and photoAlt must be set together");
}

const eyebrow = "text-xs font-medium tracking-[0.2em] text-brass uppercase";

/**
 * A label against a line: a year against what happened in it, or `비전`
 * against what it is. Everything on this page below the opening paragraph is
 * one of those, so it is all set the same quiet way.
 *
 * The label sits above the line on a phone rather than beside it. Some of these
 * run to sixty characters, and a fixed label column would leave them wrapping
 * in a 200px gutter. An empty label — a year the church has not confirmed —
 * simply leaves the column blank.
 */
function Rows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="mt-5 max-w-3xl divide-y divide-ink/10 border-t border-ink/10 text-sm">
      {rows.map((row) => (
        <div
          key={`${row.label}|${row.value}`}
          className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-6"
        >
          <dt className="text-ink-soft sm:w-28 sm:shrink-0">{row.label}</dt>
          <dd className="leading-relaxed">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    alternates: alternatesFor(lang, "pastor"),
    title: ui[lang].pastor.byline(t(pastor.name, lang), t(pastor.role, lang)),
    description: t(pastor.heart, lang),
  };
}

export default async function PastorPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const strings = ui[lang];

  const quoteLabels: Record<string, string> = {
    vision: strings.pastor.vision,
    wish: strings.pastor.wish,
  };
  const quotes = pastor.quotes.map((quote) => ({
    label: quoteLabels[quote.id],
    value: `“${t(quote.text, lang)}”`,
  }));
  const row = (r: { year: Localized; detail: Localized }) => ({
    label: t(r.year, lang),
    value: t(r.detail, lang),
  });

  return (
    <>
      <PageHeader
        title={t(pastor.name, lang)}
        description={`${t(pastor.role, lang)} · ${t(pastor.tenure, lang)}`}
      />

      <div className="mx-auto max-w-5xl px-6 py-14">
        {/*
          Flex rather than a grid: the prose keeps the same measure as /about
          whether or not a portrait sits beside it, which a fixed column count
          would not allow. There is no portrait yet — see `photo` in
          content/staff.json — so today this is one column.
        */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <p className="font-serif text-xl leading-relaxed text-heading">
              {t(pastor.family, lang)}
            </p>

            <h2 className={`mt-10 ${eyebrow}`}>{strings.pastor.heart}</h2>
            <p className="mt-3 leading-loose">{t(pastor.heart, lang)}</p>

            {/*
              His vision and his last request sit here as two more lines of the
              record rather than as pulled-out quotations. The vision already
              carries the homepage; saying it loudly twice would spend it.
            */}
            <Rows rows={quotes} />
          </div>

          {/* Reads above the text on a phone, beside it on a wide screen. */}
          {pastor.photo ? (
            <figure className="order-first shrink-0 lg:order-none">
              {/*
                Authored at 260px and served at 192 at the widest, so it holds
                up on a 1.35x screen. Cropped from a family photograph, which
                is as much of him as the source will give.
              */}
              <img
                src={asset(pastor.photo)}
                alt={t(pastor.photoAlt, lang)}
                width={260}
                height={352}
                className="w-40 rounded-lg sm:w-48"
              />
            </figure>
          ) : null}
        </div>

        <section className="mt-14">
          <h2 className={eyebrow}>{strings.pastor.priorWork}</h2>
          {/*
            Eight jobs read as a sentence rather than as a list of credentials,
            which is closer to how he wrote them down.
          */}
          <p className="mt-4 max-w-3xl leading-loose text-ink-soft">
            {pastor.priorWork.map((job) => t(job, lang)).join(" · ")}
          </p>
        </section>

        {/*
          A newspaper wrote up the same run of jobs listed above, so the
          mention sits here rather than at the foot of the page.

          A clipping rather than a live preview. Framing the article is not
          blocked — bostonkorea.com sends no X-Frame-Options — but that page is
          150KB carrying eight ad-network references, and a cross-origin frame
          takes none of our styling: what a visitor would see is the paper's
          header and a banner, and the paper's session cookie would be set on
          everyone who opens this page without clicking anything. So the
          headline, the date and the opening line are copied into
          content/staff.json and set in our own type. One sentence, attributed
          and linked, is what a clipping on a noticeboard would show.

          The English headline and lede are our renderings; the article has no
          English edition, which is what `pressAttribution` and `pressCta` say.
        */}
        {pastor.press.length > 0 ? (
          <section className="mt-14">
            <h2 className={eyebrow}>{strings.pastor.press}</h2>
            <div className="mt-4 grid max-w-3xl gap-4">
              {pastor.press.map((item) => (
                <article key={item.url} className="rounded-lg border border-ink/10 bg-card p-6">
                  <p className="text-xs text-ink-soft">
                    {t(item.outlet, lang)} · {formatDate(item.date, lang)}
                  </p>
                  <h3 className="mt-2 font-serif text-lg leading-snug text-heading">
                    {t(item.headline, lang)}
                  </h3>
                  <blockquote className="mt-4 border-l-2 border-brass/40 pl-4">
                    <p className="text-sm leading-relaxed text-ink-soft">
                      {t(item.lede, lang)}
                    </p>
                    <footer className="mt-2 text-xs text-ink-soft">
                      {strings.pastor.pressAttribution(t(item.reporter, lang))}
                    </footer>
                  </blockquote>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block text-sm text-forest underline underline-offset-4"
                  >
                    {strings.pastor.pressCta(t(item.outlet, lang))}
                  </a>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-14">
          <h2 className={eyebrow}>{strings.pastor.journey}</h2>
          <Rows rows={pastor.journey.map(row)} />
        </section>

        <section className="mt-14">
          <h2 className={eyebrow}>{strings.pastor.training}</h2>
          <Rows rows={pastor.training.map(row)} />
        </section>
      </div>
    </>
  );
}
