import catUrl from '#/features/ai/assets/cat-glasses.png'
import { createAsciiRenderer } from '#/lib/ascii-renderer'

const SCENE_SIZE = 512

function drawCat(canvas: HTMLCanvasElement | null) {
  if (!canvas) return

  let stopped = false
  let cleanup = () => {}

  const image = new Image()
  image.src = catUrl
  image.decode().then(() => {
    if (stopped) return
    const renderer = createAsciiRenderer(canvas, {
      width: SCENE_SIZE,
      height: SCENE_SIZE,
      fontSize: (width) => (width < 480 ? 5 : 7),
    })
    if (!renderer) return

    const sync = () => {
      renderer.layout()
      renderer.draw((context) =>
        context.drawImage(image, 0, 0, SCENE_SIZE, SCENE_SIZE),
      )
    }

    const resizeObserver = new ResizeObserver(sync)
    resizeObserver.observe(canvas)
    cleanup = () => resizeObserver.disconnect()
  })

  return () => {
    stopped = true
    cleanup()
  }
}

export default function CatGlassesAscii() {
  return (
    <canvas
      ref={drawCat}
      role="img"
      aria-label="ASCII drawing of a fluffy gray cat wearing thick black glasses"
      className="block aspect-square w-full"
    />
  )
}
