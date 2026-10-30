import { createFileRoute } from '@tanstack/react-router'

import CatGlassesAscii from '#/features/ai/components/cat-glasses-ascii'
import MeowChat from '#/features/ai/components/meow-chat'
import BackHeader from '#/features/shell/components/back-header'

export const Route = createFileRoute('/meow')({
  head: () => ({
    meta: [{ title: 'ai' }],
  }),
  component: Ai,
})

function TalkingToNote() {
  return (
    <p className="mt-4 ml-[12%] flex -rotate-6 items-start font-hand text-2xl text-muted-foreground sm:absolute sm:top-full sm:left-0 sm:ml-[68%]">
      <svg
        aria-hidden
        viewBox="0 0 64 60"
        className="-mt-5 h-15 w-16 shrink-0 -scale-x-100"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 52c10 5 24 4 32-4 6-6 4-14-2-13-6 1-5 10 2 12 9 3 17-6 19-16 2-8 1-16-2-26" />
        <path d="M46 11l6-6 5 9" />
      </svg>
      <span className="mt-4 -ml-1 whitespace-nowrap">
        who you&apos;re talking to
      </span>
    </p>
  )
}

function Ai() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-6 pt-8 pb-24 sm:px-8">
      <BackHeader />
      <div className="mt-16 grid gap-8 sm:grid-cols-2 sm:grid-rows-[auto_1fr] sm:gap-y-6">
        <p className="text-lg text-muted-foreground sm:col-start-2 sm:row-start-1">
          ai is cool, but curiosity is cooler
        </p>
        <div className="flex h-80 flex-col sm:col-start-2 sm:row-start-2 sm:h-0 sm:min-h-full">
          <MeowChat />
        </div>
        <div className="relative sm:col-start-1 sm:row-span-2 sm:row-start-1">
          <CatGlassesAscii />
          <TalkingToNote />
        </div>
      </div>
    </main>
  )
}
