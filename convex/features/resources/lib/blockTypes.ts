import { v } from 'convex/values'

export const RESOURCE_BLOCK_TYPES = ['title', 'paragraph', 'image', 'link'] as const

export type ResourceBlockType = (typeof RESOURCE_BLOCK_TYPES)[number]

export const resourceBlockTypeValidator = v.union(
  v.literal('title'),
  v.literal('paragraph'),
  v.literal('image'),
  v.literal('link'),
)

export const RESOURCE_BLOCK_ALIGNMENTS = ['left', 'center', 'right'] as const

export type ResourceBlockAlignment = (typeof RESOURCE_BLOCK_ALIGNMENTS)[number]

export const DEFAULT_RESOURCE_BLOCK_ALIGNMENT: ResourceBlockAlignment = 'left'

export const resourceBlockAlignmentValidator = v.union(
  v.literal('left'),
  v.literal('center'),
  v.literal('right'),
)

export function isResourceBlockAlignment(
  value: string,
): value is ResourceBlockAlignment {
  return (
    value === 'left' ||
    value === 'center' ||
    value === 'right'
  )
}
