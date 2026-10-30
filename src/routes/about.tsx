import { createFileRoute } from '@tanstack/react-router'

import ShotStack from '#/components/shot-stack'
import type { Shot } from '#/components/shot-stack'
import bookshelfImage from '#/features/about/assets/bookshelf.webp'
import pegboardImage from '#/features/about/assets/pegboard.webp'
import plushiesImage from '#/features/about/assets/plushies.webp'
import Listening from '#/features/about/components/listening'
import BackHeader from '#/features/shell/components/back-header'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [{ title: 'about' }],
  }),
  component: About,
})

const BIRTHDAY = new Date(2002, 11, 12)

function yearsSince(date: Date) {
  const now = new Date()
  const hadBirthday =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate())
  return now.getFullYear() - date.getFullYear() - (hadBirthday ? 0 : 1)
}

const photos: Shot[] = [
  {
    src: plushiesImage,
    alt: 'chiikawa and hachiware plushies gathered around a wooden tripod lamp',
    width: 1200,
    height: 1170,
  },
  {
    src: pegboardImage,
    alt: 'cork pegboard covered in keychains, plushies, and little figures',
    width: 1200,
    height: 1170,
  },
  {
    src: bookshelfImage,
    alt: 'wooden shelf with bleach manga, a pixel art pokémon, a kirby keychain, and a gundam kit',
    width: 1200,
    height: 1170,
  },
]

function About() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-6 pt-8 pb-24 sm:px-8">
      <BackHeader />
      <h3 className="mt-16 text-lg font-medium text-foreground">
        i&apos;m Dang!
      </h3>
      <p className="mt-1 text-lg text-muted-foreground">
        a bit more about myself as a person
      </p>
      <div className="mt-2 flex items-start gap-3">
        <ul className="list-disc space-y-1 pl-5 text-lg text-foreground marker:text-muted-foreground">
          <li>i&apos;m {yearsSince(BIRTHDAY)} years old</li>
          <li>i&apos;m vietnamese</li>
          <li>i can burp on command</li>
          <li>i love boardgames and cats</li>
        </ul>
        <svg
          aria-hidden
          viewBox="0 0 40 40"
          className="mt-1 size-10 shrink-0 -rotate-[20deg] -scale-x-100 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 4c-1 8 1 15 6 19 5 4 12 4 20 3" />
          <path d="M28 21l6 5-6 5" />
        </svg>
      </div>
      <h3 className="mt-12 text-lg font-medium text-foreground">hobbies</h3>
      <ShotStack
        shots={photos}
        label="photos"
        variant="polaroid"
        cardWidth={56}
      />
      <p className="mt-10 text-lg text-muted-foreground">
        i am a collector of many things. i find enjoyment out of really small
        things, which is why i love design
      </p>
      <h3 className="mt-16 text-lg font-medium text-foreground">music</h3>
      <p className="mt-1 text-lg text-muted-foreground">
        i love music. here&apos;s what i&apos;ve been listening to recently
      </p>
      <Listening />
      <h3 className="mt-16 text-lg font-medium text-foreground">
        tech &amp; peripherals
      </h3>
      <p className="mt-1 text-lg text-muted-foreground">
        severely addicted to tech and peripherals. a bit of what i use daily
      </p>
      <h4 className="mt-6 text-lg text-muted-foreground">tech</h4>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-lg text-foreground marker:text-muted-foreground">
        <li>iphone 18 pro ‘silver’</li>
        <li>
          pc
          <ul className="mt-1 list-[circle] space-y-1 pl-6">
            <li className="[font-feature-settings:'calt'_0]">
              Ryzen 7 7800x3d
            </li>
            <li>NVIDIA rtx 4080 super FE</li>
            <li>6400mhz 64gb ddr5</li>
          </ul>
        </li>
      </ul>
      <h4 className="mt-6 text-lg text-muted-foreground">peripherals</h4>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-lg text-foreground marker:text-muted-foreground">
        <li>WALLHACK K-001</li>
        <li>Logitech Superstrike x3</li>
        <li>Letshuoer Cadenza 4</li>
      </ul>
    </main>
  )
}
