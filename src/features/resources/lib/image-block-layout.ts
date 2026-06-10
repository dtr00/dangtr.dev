const MIN_IMAGE_WIDTH = 80

export function imageClassName(width: number | null): string {
  if (width !== null) {
    return 'h-auto max-w-full rounded-md object-contain'
  }

  return 'max-h-[480px] max-w-full rounded-md object-contain'
}

export function widthStyle(width: number | null) {
  if (width === null) {
    return undefined
  }

  return { width: `${width}px` }
}

export function clampImageWidth(
  startWidth: number,
  deltaX: number,
  maxWidth: number,
): number {
  return Math.round(
    Math.max(MIN_IMAGE_WIDTH, Math.min(maxWidth, startWidth + deltaX)),
  )
}

export { MIN_IMAGE_WIDTH }
