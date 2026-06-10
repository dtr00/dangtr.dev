import { v } from 'convex/values'

import type { Doc } from '../../../_generated/dataModel'
import type { QueryCtx } from '../../../_generated/server'
import {
  DEFAULT_RESOURCE_BLOCK_ALIGNMENT,
  resourceBlockAlignmentValidator,
} from './blockTypes'
import { parseImageBlockContent } from './imageContent'
import { DEFAULT_RESOURCE_ICON, isResourceIconName } from './resourceIcons'

export const resourceValidator = v.object({
  _id: v.id('resources'),
  name: v.string(),
  description: v.string(),
  icon: v.string(),
  createdAt: v.number(),
})

const resourceBlockBaseValidator = {
  _id: v.id('resourceBlocks'),
  resourceId: v.id('resources'),
  align: resourceBlockAlignmentValidator,
  order: v.number(),
  createdAt: v.number(),
}

export const titleBlockValidator = v.object({
  ...resourceBlockBaseValidator,
  type: v.literal('title'),
  content: v.string(),
})

export const paragraphBlockValidator = v.object({
  ...resourceBlockBaseValidator,
  type: v.literal('paragraph'),
  content: v.string(),
})

export const imageBlockValidator = v.object({
  ...resourceBlockBaseValidator,
  type: v.literal('image'),
  content: v.string(),
  imageUrl: v.union(v.string(), v.null()),
  alt: v.string(),
})

export const linkBlockValidator = v.object({
  ...resourceBlockBaseValidator,
  type: v.literal('link'),
  content: v.string(),
})

export const resourceBlockValidator = v.union(
  titleBlockValidator,
  paragraphBlockValidator,
  imageBlockValidator,
  linkBlockValidator,
)

export function normalizeResourceIcon(icon: string): string {
  return isResourceIconName(icon) ? icon : DEFAULT_RESOURCE_ICON
}

export function toResourceResponse(resource: Doc<'resources'>) {
  return {
    _id: resource._id,
    name: resource.name,
    description: resource.description,
    icon: normalizeResourceIcon(resource.icon),
    createdAt: resource.createdAt,
  }
}

export async function toResourceBlockResponse(
  ctx: QueryCtx,
  block: Doc<'resourceBlocks'>,
) {
  const base = {
    _id: block._id,
    resourceId: block.resourceId,
    align: block.align ?? DEFAULT_RESOURCE_BLOCK_ALIGNMENT,
    order: block.order,
    createdAt: block.createdAt,
  }

  switch (block.type) {
    case 'image': {
      const imageContent = parseImageBlockContent(block.content)
      const imageUrl = imageContent.storageId
        ? await ctx.storage.getUrl(imageContent.storageId)
        : null

      return {
        ...base,
        type: 'image' as const,
        content: block.content,
        imageUrl,
        alt: imageContent.alt,
      }
    }
    case 'link':
      return {
        ...base,
        type: 'link' as const,
        content: block.content,
      }
    case 'paragraph':
      return {
        ...base,
        type: 'paragraph' as const,
        content: block.content,
      }
    case 'title':
      return {
        ...base,
        type: 'title' as const,
        content: block.content,
      }
  }
}
