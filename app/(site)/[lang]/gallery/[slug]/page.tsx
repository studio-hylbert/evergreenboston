import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { read, find, altFor } from "@/lib/gallery";
import { asset } from "@/lib/asset";
import { ui } from "@/lib/ui";
import { locales, t, type Locale } from "@/lib/i18n";
import { alternatesFor } from "@/lib/site-url";

/*
 * One page per Drive folder, decided at build time. `dynamicParams` stays off
 * for the same reason it is off for `[lang]`: a static export has nothing to
 * resolve a stray address with later, and an album that is not in the committed
 * cache should be a 404 rather than a build failure.
 */
export const dynamicParams = false;

/*
 * A static export insists on at least one address per dynamic route, so an
 * empty gallery would fail the build rather than simply having nothing to show.
 * An empty gallery is an ordinary state — it is how the site starts, and how it
 * would look if the church cleared the folder out — so when there are no albums
 * this generates one address that renders as not-found. Nothing links to it,
 * and `/gallery` itself hides from the header until there is something in it.
 */
const NONE = "_none";

export function generateStaticParams() {
  const albums = read("gallery");
  const slugs = albums.length > 0 ? albums.map((album) => album.slug) : [NONE];

  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const album = find("gallery", slug);
  if (!album) notFound();

  return {
    alternates: alternatesFor(lang, `gallery/${slug}`),
    title: t(album.title, lang),
    description: ui[lang].gallery.photoCount(album.photos.length),
  };
}

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}) {
  const { lang, slug } = await params;
  const strings = ui[lang];
  const album = find("gallery", slug);
  if (!album) notFound();

  const others = read("gallery").filter((other) => other.slug !== slug);

  return (
    <>
      <PageHeader
        title={t(album.title, lang)}
        description={strings.gallery.photoCount(album.photos.length)}
      />

      <div className="mx-auto max-w-5xl px-6 py-14">
        {/*
          Columns rather than a grid. The photos are whatever shape they were
          taken in, and a grid would have to crop them to keep its rows level;
          this keeps every photo whole. Reading order runs down each column,
          which for a set of pictures costs nothing.
        */}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {album.photos.map((photo) => (
            <a
              key={photo.id}
              href={asset(photo.full.path)}
              className="group mb-4 block overflow-hidden rounded-lg border border-ink/10 bg-card transition hover:border-forest/40 hover:shadow-sm"
              /*
                A link to the image itself, not a lightbox. It works with
                JavaScript off, hands the visitor their browser's own zoom, and
                is one less thing to maintain on a site meant to be left alone.
              */
              aria-label={strings.gallery.openPhoto}
            >
              {/* width and height are recorded at refresh time so the page
                  reserves the right space before the photo arrives. */}
              <img
                src={asset(photo.thumbnail.path)}
                alt={altFor(photo)}
                width={photo.thumbnail.width}
                height={photo.thumbnail.height}
                loading="lazy"
                className="w-full transition duration-500 group-hover:scale-[1.02]"
              />
            </a>
          ))}
        </div>

        {others.length > 0 ? (
          <section className="mt-14 border-t border-ink/10 pt-8">
            <h2 className="text-xs font-medium tracking-[0.2em] text-brass uppercase">
              {strings.gallery.otherAlbums}
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={`/${lang}/gallery/${other.slug}`}
                  className="rounded-md border border-forest/30 px-4 py-2.5 text-sm text-forest transition hover:bg-card"
                >
                  {t(other.title, lang)}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
