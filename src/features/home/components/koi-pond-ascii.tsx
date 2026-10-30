import dockUrl from '#/features/home/assets/koi-dock.png'
import legUrl from '#/features/home/assets/koi-leg.png'
import tailUrl from '#/features/home/assets/koi-tail.png'
import {
  LOOP_SECONDS,
  RIPPLE_LIFETIME,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  drawKoiPondScene,
  isWater,
  sceneFade,
} from '#/features/home/lib/koi-pond-scene'
import type { KoiPondState } from '#/features/home/lib/koi-pond-scene'
import { createAsciiRenderer } from '#/lib/ascii-renderer'

const FRAME_MS = 1000 / 24
const STILL_FRAME_SECONDS = 2.15
const BOOST_SECONDS = 14
const MAX_BOOSTS = 1

async function loadImage(src: string) {
  const image = new Image()
  image.src = src
  await image.decode()
  return image
}

function boostProgress(progress: number) {
  return 1 - (1 - progress) ** 4 * (1 + 4 * progress)
}

function startAnimation(canvas: HTMLCanvasElement | null) {
  if (!canvas) return

  let stopped = false
  let cleanup = () => {}

  Promise.all([loadImage(dockUrl), loadImage(legUrl), loadImage(tailUrl)]).then(
    ([dock, leg, tail]) => {
      if (stopped) return
      const renderer = createAsciiRenderer(canvas, {
        width: SCENE_WIDTH,
        height: SCENE_HEIGHT,
        fade: sceneFade,
      })
      if (!renderer) return
      const sprites = { dock, leg, tail }
      const drawScene = (state: KoiPondState) =>
        renderer.draw((context) => drawKoiPondScene(context, state, sprites))

      let visible = true
      let frame = 0
      let lastDraw = -Infinity
      let clicks: Array<{ x: number; y: number; time: number }> = []
      let boosts: number[] = []
      const start = performance.now()
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      )

      const secondsAt = (now: number) => (now - start) / 1000

      const tick = (now: number) => {
        frame = requestAnimationFrame(tick)
        if (!visible || now - lastDraw < FRAME_MS) return
        lastDraw = now
        const time = secondsAt(now)
        clicks = clicks.filter((click) => time - click.time < RIPPLE_LIFETIME)
        boosts = boosts.filter((boost) => time - boost < BOOST_SECONDS)
        drawScene({
          time: time % LOOP_SECONDS,
          fishTime:
            time +
            boosts.reduce(
              (sum, boost) =>
                sum +
                LOOP_SECONDS * boostProgress((time - boost) / BOOST_SECONDS),
              0,
            ),
          ripples: clicks.map((click) => ({
            x: click.x,
            y: click.y,
            age: time - click.time,
          })),
        })
      }

      const sync = () => {
        cancelAnimationFrame(frame)
        renderer.layout()
        if (reducedMotion.matches) {
          drawScene({
            time: STILL_FRAME_SECONDS,
            fishTime: STILL_FRAME_SECONDS,
            ripples: [],
          })
        } else {
          lastDraw = -Infinity
          frame = requestAnimationFrame(tick)
        }
      }

      const toScene = (event: PointerEvent) => ({
        x: (event.offsetX / canvas.clientWidth) * SCENE_WIDTH,
        y: (event.offsetY / canvas.clientHeight) * SCENE_HEIGHT,
      })

      const onPointerMove = (event: PointerEvent) => {
        const { x, y } = toScene(event)
        canvas.style.cursor =
          !reducedMotion.matches && isWater(x, y) ? 'pointer' : ''
      }

      const onPointerDown = (event: PointerEvent) => {
        const { x, y } = toScene(event)
        if (reducedMotion.matches || !isWater(x, y)) return
        const time = secondsAt(performance.now())
        clicks.push({ x, y, time })
        if (boosts.length < MAX_BOOSTS) boosts.push(time)
      }

      const resizeObserver = new ResizeObserver(sync)
      resizeObserver.observe(canvas)
      const intersectionObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
      })
      intersectionObserver.observe(canvas)
      reducedMotion.addEventListener('change', sync)
      canvas.addEventListener('pointermove', onPointerMove)
      canvas.addEventListener('pointerdown', onPointerDown)

      cleanup = () => {
        cancelAnimationFrame(frame)
        resizeObserver.disconnect()
        intersectionObserver.disconnect()
        reducedMotion.removeEventListener('change', sync)
        canvas.removeEventListener('pointermove', onPointerMove)
        canvas.removeEventListener('pointerdown', onPointerDown)
      }
    },
  )

  return () => {
    stopped = true
    cleanup()
  }
}

export default function KoiPondAscii() {
  return (
    <canvas
      ref={startAnimation}
      role="img"
      aria-label="ASCII animation of a cat on a dock pawing at koi swimming below. Click the water to make ripples."
      className="block aspect-[2/1] w-full"
    />
  )
}
