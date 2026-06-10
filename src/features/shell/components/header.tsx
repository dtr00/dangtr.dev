import { useUser } from '@clerk/tanstack-react-start'
import { IconMedicalCross } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'

export default function Header() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [spinning, setSpinning] = useState(false)
  const spinningRef = useRef(false)

  function handleLogoMouseEnter() {
    if (spinningRef.current) {
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    spinningRef.current = true
    setSpinning(true)
  }

  function handleLogoAnimationEnd() {
    spinningRef.current = false
    setSpinning(false)
  }

  return (
    <header>
      <div className="mx-auto flex max-w-3xl items-center px-8 pt-24 pb-4">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-base"
            onMouseEnter={handleLogoMouseEnter}
          >
            <span className="inline-flex perspective-[600px]">
              <IconMedicalCross
                className={spinning ? 'logo-mark logo-mark-spinning' : 'logo-mark'}
                size={18}
                stroke={1.75}
                aria-hidden
                onAnimationEnd={handleLogoAnimationEnd}
              />
            </span>
            dangtr.dev
          </Link>
          <div className="size-6 shrink-0">
            {isLoaded && isSignedIn && user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName ?? 'Profile picture'}
                className="size-full rounded-full"
              />
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
