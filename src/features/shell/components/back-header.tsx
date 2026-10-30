import { IconArrowLeft } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { clickDuringViewTransition } from '#/lib/click-during-view-transition'

const clickableBrand = clickDuringViewTransition('brand-name')

export default function BackHeader() {
  return (
    <header className="sticky top-4 z-50 -ml-3.5 w-fit">
      <Link
        ref={clickableBrand}
        to="/"
        className="inline-flex items-center gap-1.5 rounded-full border bg-black/70 py-1 pr-4 pl-3 text-lg font-medium tracking-tight backdrop-blur-md raise-on-scroll transition-colors hover:bg-white/10"
      >
        <IconArrowLeft aria-hidden size={16} stroke={1.75} />
        <span className="[view-transition-name:brand-name]">dang</span>
      </Link>
    </header>
  )
}
