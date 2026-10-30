const HIT_SLOP = 8

function contains(
  box: { left: number; top: number; width: number; height: number },
  x: number,
  y: number,
) {
  return (
    x >= box.left - HIT_SLOP &&
    x <= box.left + box.width + HIT_SLOP &&
    y >= box.top - HIT_SLOP &&
    y <= box.top + box.height + HIT_SLOP
  )
}

export function clickDuringViewTransition(name?: string) {
  const group = name ? `::view-transition-group(${name})` : null

  const isAnimating = () =>
    document.documentElement
      .getAnimations({ subtree: true })
      .some(
        (animation) =>
          animation.effect instanceof KeyframeEffect &&
          animation.effect.pseudoElement?.startsWith('::view-transition') ===
            true,
      )

  const animatedBox = () => {
    if (!group) return null
    const style = getComputedStyle(document.documentElement, group)
    const width = parseFloat(style.width)
    const height = parseFloat(style.height)
    if (!width || !height) return null
    const matrix = new DOMMatrixReadOnly(
      style.transform === 'none' ? undefined : style.transform,
    )
    return { left: matrix.e, top: matrix.f, width, height }
  }

  return (element: HTMLElement | null) => {
    if (!element) return
    const root = document.documentElement
    let showingPointer = false

    const isOverElement = (event: PointerEvent) => {
      const box = animatedBox()
      return (
        (box !== null && contains(box, event.clientX, event.clientY)) ||
        contains(element.getBoundingClientRect(), event.clientX, event.clientY)
      )
    }

    const setPointer = (show: boolean) => {
      if (show === showingPointer) return
      showingPointer = show
      root.style.cursor = show ? 'pointer' : ''
    }

    const onPointerMove = (event: PointerEvent) => {
      setPointer(isAnimating() && isOverElement(event))
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !isAnimating() || !isOverElement(event)) return
      event.preventDefault()
      setPointer(false)
      element.click()
    }

    document.addEventListener('pointermove', onPointerMove, true)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      setPointer(false)
      document.removeEventListener('pointermove', onPointerMove, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }
}
