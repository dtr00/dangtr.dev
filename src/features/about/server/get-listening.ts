import { createServerFn } from '@tanstack/react-start'

const LASTFM_USER = 'danquo19'
const LASTFM_API = 'https://ws.audioscrobbler.com/2.0/'
const CACHE_MS = 60_000
const TRACK_LIMIT = 5
// fetch extra scrobbles so songs on repeat still leave five unique tracks
const RECENT_FETCH_LIMIT = 50
// last.fm serves this star image when it has no artwork for a track
const PLACEHOLDER_IMAGE = '2a96cbd8b46e442fc41c2b86b821562f'

export type Track = {
  name: string
  artist: string
  url: string
  image: string | null
  nowPlaying?: boolean
  playedAt?: number
  playcount?: number
}

export type Listening = { recent: Track[]; top: Track[] }

type LastfmImage = { size: string; '#text': string }

type RecentTracksResponse = {
  recenttracks: {
    track: Array<{
      name: string
      url: string
      artist: { '#text': string }
      image: LastfmImage[]
      date?: { uts: string }
      '@attr'?: { nowplaying?: string }
    }>
  }
}

type TopTracksResponse = {
  toptracks: {
    track: Array<{
      name: string
      url: string
      playcount: string
      artist: { name: string }
    }>
  }
}

type TrackInfoResponse = { track?: { album?: { image: LastfmImage[] } } }

let cache: { at: number; data: Listening } | null = null

async function lastfm<T>(params: Record<string, string>): Promise<T> {
  const key = process.env.LASTFM_KEY
  if (!key) throw new Error('LASTFM_KEY is not set')
  const url = new URL(LASTFM_API)
  for (const [name, value] of Object.entries({
    ...params,
    api_key: key,
    format: 'json',
  })) {
    url.searchParams.set(name, value)
  }
  const response = await fetch(url)
  if (!response.ok) throw new Error(`last.fm responded ${response.status}`)
  return (await response.json()) as T
}

function pickImage(images: LastfmImage[] | undefined) {
  const url = images?.find((image) => image.size === 'large')?.['#text']
  return url && !url.includes(PLACEHOLDER_IMAGE) ? url : null
}

// Top tracks only come with the placeholder image, so look up each album cover.
async function albumImage(artist: string, track: string) {
  try {
    const info = await lastfm<TrackInfoResponse>({
      method: 'track.getInfo',
      artist,
      track,
    })
    return pickImage(info.track?.album?.image)
  } catch {
    return null
  }
}

function uniqueByUrl<T extends { url: string }>(tracks: T[]) {
  const seen = new Set<string>()
  return tracks
    .filter((track) => {
      if (seen.has(track.url)) return false
      seen.add(track.url)
      return true
    })
    .slice(0, TRACK_LIMIT)
}

// last.fm has no spotify ids, so open spotify's search for the exact song
function spotifyUrl(name: string, artist: string) {
  return `https://open.spotify.com/search/${encodeURIComponent(`${name} ${artist}`)}`
}

async function fetchListening(): Promise<Listening> {
  const [recent, top] = await Promise.all([
    lastfm<RecentTracksResponse>({
      method: 'user.getrecenttracks',
      user: LASTFM_USER,
      limit: String(RECENT_FETCH_LIMIT),
    }),
    lastfm<TopTracksResponse>({
      method: 'user.gettoptracks',
      user: LASTFM_USER,
      period: '7day',
      limit: String(TRACK_LIMIT),
    }),
  ])

  const topTracks = top.toptracks.track.slice(0, TRACK_LIMIT)
  const topImages = await Promise.all(
    topTracks.map((track) => albumImage(track.artist.name, track.name)),
  )

  return {
    recent: uniqueByUrl(recent.recenttracks.track).map((track) => ({
      name: track.name,
      artist: track.artist['#text'],
      url: spotifyUrl(track.name, track.artist['#text']),
      image: pickImage(track.image),
      nowPlaying: track['@attr']?.nowplaying === 'true',
      playedAt: track.date ? Number(track.date.uts) * 1000 : undefined,
    })),
    top: topTracks.map((track, index) => ({
      name: track.name,
      artist: track.artist.name,
      url: spotifyUrl(track.name, track.artist.name),
      image: topImages[index],
      playcount: Number(track.playcount),
    })),
  }
}

export const getListening = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Listening> => {
    if (cache && Date.now() - cache.at < CACHE_MS) return cache.data
    try {
      const data = await fetchListening()
      cache = { at: Date.now(), data }
      return data
    } catch {
      return cache?.data ?? { recent: [], top: [] }
    }
  },
)
