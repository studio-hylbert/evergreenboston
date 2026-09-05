import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { read, altFor } from "@/lib/gallery";
import { asset } from "@/lib/asset";
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
    alternates: alternatesFor(lang, "gallery"),
    title: ui[lang].gallery.title,
    description: ui[lang].gallery.description,
  };
}

export default async function GalleryPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const strings = ui[lang];
  const albums = read("gallery");

  return (
    <>
      <PageHeader title={strings.gallery.title} description={strings.gallery.description} />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => {
            {/* The most recent photo stands for the album. */}
            const cover = album.photos[album.photos.length - 1];

            return (
              <Link
                key={album.slug}
                href={`/${lang}/gallery/${album.slug}`}
                className="group block overflow-hidden rounded-lg border border-ink/10 bg-card transition hover:border-forest/40 hover:shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden bg-paper-sunk">
                  {/*
                    A plain <img> rather than next/image: this is a static export
                    with the optimizer disabled, and the file was already written
                    at the size it is served at. `asset` applies the base path,
                    which next/image would have done itself.
                  */}
                  <img
                    src={asset(cover.thumbnail.path)}
                    alt={altFor(cover)}
                    width={cover.thumbnail.width}
                    height={cover.thumbnail.height}
                    loading="lazy"
                    /*
                      Cropped from the top, not the middle. Covers are a fixed
                      shape so the grid stays level, and what a tall picture
                      keeps at the top — a poster's title, the faces in a group
                      photo — is what makes it recognisable.
                    */
                    className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-serif text-lg leading-snug text-heading">
                    {t(album.title, lang)}
                  </h2>
                  <p className="mt-1.5 text-sm text-ink-soft">
                    {strings.gallery.photoCount(album.photos.length)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
