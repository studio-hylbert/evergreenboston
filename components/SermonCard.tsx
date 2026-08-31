import type { Video } from "@/lib/youtube";
import { formatKoreanDate } from "@/lib/format";

export default function SermonCard({ video }: { video: Video }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden rounded-lg border border-ink/10 bg-white transition hover:border-forest/40 hover:shadow-sm"
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
        <p className="text-xs text-ink-soft">{formatKoreanDate(video.date)}</p>
        <h3 className="mt-1.5 font-serif text-base leading-snug text-forest-deep">
          {video.title ?? video.rawTitle}
        </h3>
        {video.preacher ? (
          <p className="mt-1.5 text-sm text-ink-soft">{video.preacher}</p>
        ) : null}
      </div>
    </a>
  );
}
