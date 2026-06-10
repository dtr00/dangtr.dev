import type { ResourceBlockAlignment } from '../../../../convex/features/resources/lib/blockTypes'

export type { ResourceBlockAlignment }

const alignmentConfig: Record<
  ResourceBlockAlignment,
  { text: string; figure: string }
> = {
  left: { text: 'text-left', figure: '' },
  center: { text: 'text-center', figure: 'mx-auto' },
  right: { text: 'text-right', figure: 'ml-auto' },
}

export function blockAlignmentClassName(
  align: ResourceBlockAlignment,
): string {
  return alignmentConfig[align].text
}

export function imageFigureAlignClassName(
  align: ResourceBlockAlignment,
): string {
  return alignmentConfig[align].figure
}
