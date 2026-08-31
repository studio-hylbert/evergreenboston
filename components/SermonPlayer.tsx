"use client";

import { useState } from "react";
import type { Video } from "@/lib/youtube";

/**
 * Click-to-play. Nothing from YouTube is requested until a visitor presses
 * play, and playback then runs through youtube-nocookie.com, so someone who
 * only reads the page is never handed a YouTube cookie.
 */
export default function SermonPlayer({
  video,
  playLabel,
}: {
  video: Video;
  playLabel: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="aspect-video overflow-hidden rounded-lg bg-deep">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1`}
          title={video.title ?? video.rawTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-lg bg-deep"
    >
      {/*
        The still is a fixed-size file on YouTube's CDN and this is a static
        export with the optimizer disabled, so `next/image` would add nothing.
      */}
      <img
        src={video.thumbnail}
        alt=""
        className="h-full w-full object-cover opacity-85 transition group-hover:opacity-100"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-on-deep/90 shadow-lg transition group-hover:bg-on-deep">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7 text-forest">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
          </svg>
        </span>
      </span>
      <span className="sr-only">{`${video.title ?? video.rawTitle} — ${playLabel}`}</span>
    </button>
  );
}
