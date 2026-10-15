import type { Video } from "@/lib/youtube";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export default function SermonCard({
  video,
  locale,
}: {
  video: Video;
  locale: Locale;
}) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden rounded-lg border border-ink/10 bg-card transition hover:border-forest/40 hover:shadow-sm"
    >
      <div className="aspect-video overflow-hidden bg-paper-sunk">
        {/*
          Stills are served from YouTube rather than copied into the repository,
          so they cannot go stale when a video is replaced. `next/image` would
          add nothing: this is a static export with the optimizer disabled, and
          the still is a fixed-size file on someone else's CDN.
        */}
        <img
          src={video.thumbnail}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-ink-soft">{formatDate(video.date, locale)}</p>
        {/*
          Sermon titles come from YouTube and are written in Korean, so they
          stay in Korean on the English pages too. There is nothing to translate
          them from.
        */}
        <h3 className="mt-1.5 font-serif text-base leading-snug text-heading">{video.title}</h3>
        <VideoByline video={video} className="mt-1.5 text-sm text-ink-soft" />
      </div>
    </a>
  );
}

/** Passage and preacher on one line, either of which a title may leave out. */
export function VideoByline({ video, className }: { video: Video; className: string }) {
  const parts = [video.passage, video.preacher].filter((part) => part !== null);
  return parts.length > 0 ? <p className={className}>{parts.join(" · ")}</p> : null;
}

export function ShortCard({ video, locale }: { video: Video; locale: Locale }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer"
      className="group block h-full overflow-hidden rounded-lg border border-ink/10 bg-card transition hover:border-forest/40 hover:shadow-sm"
    >
      <div className="aspect-[9/16] overflow-hidden bg-paper-sunk">
        {/*
          The still is 16:9 with the upright frame in the middle, so cropping
          it to 9:16 from the centre leaves exactly the frame.
        */}
        <img
          src={video.thumbnail}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-3">
        <p className="text-xs text-ink-soft">{formatDate(video.date, locale)}</p>
        <h3 className="mt-1 font-serif text-sm leading-snug text-heading">{video.title}</h3>
        <VideoByline video={video} className="mt-1 text-xs text-ink-soft" />
      </div>
    </a>
  );
}
