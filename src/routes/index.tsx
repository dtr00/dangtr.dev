import { Link, createFileRoute } from '@tanstack/react-router'

import KoiPondAscii from '#/features/home/components/koi-pond-ascii'
import { clickDuringViewTransition } from '#/lib/click-during-view-transition'

export const Route = createFileRoute('/')({
  component: Home,
})

const clickableProjects = clickDuringViewTransition()
const clickableWork = clickDuringViewTransition()
const clickableAi = clickDuringViewTransition()
const clickableAbout = clickDuringViewTransition()

function Home() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="mx-auto w-full max-w-3xl px-6 pt-24 sm:px-8 sm:pt-32">
        <h1 className="text-lg font-medium tracking-tight">
          <span className="inline-block [view-transition-name:brand-name]">
            dang
          </span>{' '}
          tran
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">
          i like to build stuff
        </p>
        <p className="mt-4 text-lg text-muted-foreground">
          incredibly hyper-fixated on design and speed
        </p>
        <nav className="mt-8 flex flex-col items-start gap-y-3 text-lg">
          <Link
            ref={clickableWork}
            to="/work"
            className="text-foreground underline underline-offset-4"
          >
            work
          </Link>
          <Link
            ref={clickableProjects}
            to="/projects"
            className="text-foreground underline underline-offset-4"
          >
            projects
          </Link>
          <Link
            ref={clickableAbout}
            to="/about"
            className="text-foreground underline underline-offset-4"
          >
            about me
          </Link>
        </nav>
      </div>
      <div className="mx-auto mt-auto w-full max-w-3xl pt-16">
        <div className="flex justify-end px-6 pb-2 text-lg sm:px-8">
          <Link
            ref={clickableAi}
            to="/meow"
            className="text-foreground underline underline-offset-4"
          >
            meow ai
          </Link>
        </div>
        <KoiPondAscii />
      </div>
    </main>
  )
}
