import { useCallback, useState } from 'react'

import { getListening } from '#/features/about/server/get-listening'
import type { Listening, Track } from '#/features/about/server/get-listening'

function timeAgo(timestamp: number) {
  const minutes = Math.floor((Date.now() - timestamp) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function RecentMeta({ track }: { track: Track }) {
  if (track.nowPlaying) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 animate-pulse rounded-full bg-foreground motion-reduce:animate-none" />
        now
      </span>
    )
  }
  return track.playedAt ? (
    <span suppressHydrationWarning>{timeAgo(track.playedAt)}</span>
  ) : null
}

function TrackList({
  title,
  tracks,
  meta,
}: {
  title: string
  tracks: Track[]
  meta: (track: Track) => React.ReactNode
}) {
  return (
    <section className="animate-in fade-in duration-300 motion-reduce:animate-none">
      <h4 className="text-sm text-muted-foreground">{title}</h4>
      <ol className="mt-3 space-y-3">
        {tracks.map((track) => (
          <li key={`${track.url}-${track.playedAt ?? track.playcount}`}>
            <a
              href={track.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3"
            >
              {track.image ? (
                <img
                  src={track.image}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                  className="size-10 shrink-0 rounded-md bg-muted object-cover"
                />
              ) : (
                <span className="size-10 shrink-0 rounded-md bg-muted" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base text-foreground underline-offset-4 group-hover:underline">
                  {track.name}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  {track.artist}
                </span>
              </span>
              <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                {meta(track)}
              </span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}

const SKELETON_ROWS = 5

function TrackListSkeleton({ title }: { title: string }) {
  return (
    <section aria-hidden>
      <h4 className="text-sm text-muted-foreground">{title}</h4>
      <ol className="mt-3 space-y-3">
        {Array.from({ length: SKELETON_ROWS }, (_, row) => (
          <li
            key={row}
            className="flex animate-pulse items-center gap-3 motion-reduce:animate-none"
          >
            <span className="size-10 shrink-0 rounded-md bg-muted" />
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="h-3.5 w-2/3 rounded bg-muted" />
              <span className="h-3 w-1/3 rounded bg-muted" />
            </span>
            <span className="h-3 w-12 shrink-0 rounded bg-muted" />
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function Listening() {
  const [listening, setListening] = useState<Listening | null>(null)

  // Fetch from the browser after the page renders instead of blocking SSR.
  const load = useCallback((element: HTMLDivElement | null) => {
    if (!element) return
    let cancelled = false
    getListening().then((data) => {
      if (!cancelled) setListening(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (listening && !listening.recent.length && !listening.top.length) {
    return null
  }

  return (
    <div
      ref={load}
      aria-busy={!listening}
      className="mt-6 grid gap-8 sm:grid-cols-2"
    >
      {listening ? (
        <>
          <TrackList
            title="recently played"
            tracks={listening.recent}
            meta={(track) => <RecentMeta track={track} />}
          />
          <TrackList
            title="top this week"
            tracks={listening.top}
            meta={(track) =>
              `${track.playcount} ${track.playcount === 1 ? 'play' : 'plays'}`
            }
          />
        </>
      ) : (
        <>
          <TrackListSkeleton title="recently played" />
          <TrackListSkeleton title="top this week" />
        </>
      )}
    </div>
  )
}
