import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react'
import { useRef, useState } from 'react'

export type Shot = { src: string; alt: string; width: number; height: number }

type Variant = 'screenshot' | 'polaroid'

const DEPTH_SCALE = 0.05
const DEPTH_DIM = 0.15
const POLAROID_TILTS = [-2.5, 1.75, -1]

// Cards keep their slots and stack away from the active card on both sides, so
// each strip always maps to the same card.
function cardAt(
  x: number,
  active: number,
  step: number,
  count: number,
  cardWidth: number,
) {
  if (step === 0) return 0
  if (x < active * step) return Math.floor(x / step)
  if (x > cardWidth + active * step) {
    return Math.min(count - 1, Math.ceil((x - cardWidth) / step))
  }
  return active
}

const controlClassName =
  'flex size-10 items-center justify-center rounded-full bg-white/10 text-foreground transition-colors hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10'

const polaroidClassName = 'rounded-[2px] bg-[#f2efe8]'

function ShotCard({
  shot,
  variant,
  eager,
}: {
  shot: Shot
  variant: Variant
  eager: boolean
}) {
  const image = (
    <img
      src={shot.src}
      alt=""
      width={shot.width}
      height={shot.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={
        variant === 'polaroid'
          ? 'block h-auto w-full'
          : 'h-auto w-full rounded-lg border border-border'
      }
    />
  )
  if (variant === 'screenshot') return image
  return <div className={`${polaroidClassName} p-[5%] pb-[18%]`}>{image}</div>
}

function ShotFull({ shot, variant }: { shot: Shot; variant: Variant }) {
  if (variant === 'screenshot') {
    return (
      <img
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        decoding="async"
        className="h-auto max-h-[calc(100dvh-13rem)] w-auto max-w-full rounded-lg border border-border"
      />
    )
  }
  return (
    <div className={`${polaroidClassName} p-3 pb-14 sm:p-5 sm:pb-20`}>
      <img
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        decoding="async"
        className="block h-auto max-h-[calc(100dvh-19.5rem)] w-auto max-w-[calc(100vw-3.5rem)] sm:max-w-[calc(100vw-12.5rem)]"
      />
    </div>
  )
}

export default function ShotStack({
  shots,
  label,
  variant = 'screenshot',
  cardWidth = 78,
}: {
  shots: Shot[]
  label: string
  variant?: Variant
  cardWidth?: number
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [active, setActive] = useState(0)
  const step = shots.length > 1 ? (100 - cardWidth) / (shots.length - 1) : 0

  const scrollToShot = (target: number, behavior?: ScrollBehavior) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: target * track.clientWidth, behavior })
  }

  const open = (target: number) => {
    dialogRef.current?.showModal()
    setIndex(target)
    scrollToShot(target, 'instant')
  }

  const close = () => dialogRef.current?.close()

  const closeOnBackdrop = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) close()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') scrollToShot(Math.max(index - 1, 0))
    if (event.key === 'ArrowRight') {
      scrollToShot(Math.min(index + 1, shots.length - 1))
    }
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    setActive(cardAt(x, active, step, shots.length, cardWidth))
  }

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget
    setIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  return (
    <>
      <div
        className="relative mt-4"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(0)}
      >
        {shots.map((shot, slot) => {
          const depth = slot - active
          const distance = Math.abs(depth)
          const tilt =
            variant === 'polaroid'
              ? POLAROID_TILTS[slot % POLAROID_TILTS.length]
              : 0
          return (
            <button
              key={shot.src}
              type="button"
              onClick={() => open(slot)}
              aria-label={`view ${shot.alt}`}
              style={{
                left: `${slot * step}%`,
                width: `${cardWidth}%`,
                zIndex: shots.length - distance,
                transform: `rotate(${tilt}deg) scale(${1 - distance * DEPTH_SCALE})`,
                transformOrigin: depth < 0 ? 'left' : 'right',
                filter: `brightness(${1 - distance * DEPTH_DIM})`,
              }}
              className={`top-0 block cursor-zoom-in shadow-[0_0_32px_rgb(0_0_0/0.7)] transition-[transform,transform-origin,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${variant === 'polaroid' ? 'rounded-[2px]' : 'rounded-lg'} ${slot === 0 ? 'relative' : 'absolute'}`}
            >
              <ShotCard shot={shot} variant={variant} eager={slot === 0} />
            </button>
          )
        })}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={label}
        onKeyDown={onKeyDown}
        className="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none scale-[0.97] bg-black/95 p-0 text-foreground opacity-0 transition-[opacity,scale,display,overlay] transition-discrete duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] backdrop:bg-transparent open:scale-100 open:opacity-100 motion-reduce:transition-none starting:open:scale-[0.97] starting:open:opacity-0"
      >
        <div
          onClick={closeOnBackdrop}
          className="flex h-full flex-col items-center justify-center gap-4 py-16"
        >
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="flex w-full shrink-0 snap-x snap-mandatory overflow-x-auto overscroll-contain [scrollbar-width:none] motion-safe:scroll-smooth"
          >
            {shots.map((shot) => (
              <div
                key={shot.src}
                onClick={closeOnBackdrop}
                className="flex w-full shrink-0 snap-center items-center justify-center px-4 sm:px-20"
              >
                <ShotFull shot={shot} variant={variant} />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 px-4">
            {shots.map((shot, slot) => (
              <button
                key={shot.src}
                type="button"
                onClick={() => scrollToShot(slot)}
                aria-label={`show ${shot.alt}`}
                aria-current={slot === index}
                className={`w-14 shrink-0 overflow-hidden rounded-md border transition-[opacity,border-color] duration-200 sm:w-20 ${slot === index ? 'border-foreground opacity-100' : 'border-border opacity-50 hover:opacity-100'}`}
              >
                <img
                  src={shot.src}
                  alt=""
                  width={shot.width}
                  height={shot.height}
                  decoding="async"
                  draggable={false}
                  className="h-auto w-full"
                />
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={close}
          aria-label="close"
          className={`absolute top-4 right-4 ${controlClassName}`}
        >
          <IconX aria-hidden size={20} stroke={1.75} />
        </button>
        <button
          type="button"
          onClick={() => scrollToShot(index - 1)}
          disabled={index === 0}
          aria-label="previous"
          className={`absolute top-1/2 left-4 hidden -translate-y-1/2 pointer-fine:flex ${controlClassName}`}
        >
          <IconChevronLeft aria-hidden size={20} stroke={1.75} />
        </button>
        <button
          type="button"
          onClick={() => scrollToShot(index + 1)}
          disabled={index === shots.length - 1}
          aria-label="next"
          className={`absolute top-1/2 right-4 hidden -translate-y-1/2 pointer-fine:flex ${controlClassName}`}
        >
          <IconChevronRight aria-hidden size={20} stroke={1.75} />
        </button>
        <p aria-live="polite" className="sr-only">
          {index + 1} of {shots.length}
        </p>
      </dialog>
    </>
  )
}
