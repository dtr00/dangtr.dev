import { IconArrowUpRight } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'

import activityImage from '#/features/design/assets/hexprep-activity.webp'
import automationsImage from '#/features/design/assets/hexprep-automations.webp'
import overviewImage from '#/features/design/assets/hexprep-overview.webp'
import settingsImage from '#/features/design/assets/hexprep-settings.webp'
import worklistImage from '#/features/design/assets/hexprep-worklist.webp'
import ShotStack from '#/components/shot-stack'
import type { Shot } from '#/components/shot-stack'
import BackHeader from '#/features/shell/components/back-header'

export const Route = createFileRoute('/work')({
  head: () => ({
    meta: [{ title: 'work' }],
  }),
  component: Work,
})

const hexprepShots: Shot[] = [
  {
    src: overviewImage,
    alt: 'hexprep dashboard with inventory, shipment, and revenue overviews',
    width: 2000,
    height: 1177,
  },
  {
    src: worklistImage,
    alt: 'hexprep worklist grouping open issues, logistics requests, and outbound shipments',
    width: 2000,
    height: 1177,
  },
  {
    src: activityImage,
    alt: 'hexprep outbound shipment activity timeline with field-level change history',
    width: 2000,
    height: 1177,
  },
  {
    src: automationsImage,
    alt: 'hexprep automation graph wiring a low stock trigger to a slack webhook',
    width: 2000,
    height: 1177,
  },
  {
    src: settingsImage,
    alt: 'hexprep account settings dialog over the dashboard',
    width: 2000,
    height: 1177,
  },
]

function Work() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-6 pt-8 pb-24 sm:px-8">
      <BackHeader />
      <section className="mt-16 text-lg">
        <h2>
          <a
            href="https://hexprep.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-foreground"
          >
            <span className="underline underline-offset-4">hexprep</span>
            <IconArrowUpRight aria-hidden size={16} stroke={1.75} />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </h2>
        <p className="mt-1 text-muted-foreground">
          amazon & 3pl fulfillment dashboard
        </p>
        <ShotStack shots={hexprepShots} label="hexprep screenshots" />
      </section>
    </main>
  )
}
