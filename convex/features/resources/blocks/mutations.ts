import { v } from 'convex/values'

import { authedMutation } from '../../../lib/authedMutation'
import {
  DEFAULT_RESOURCE_BLOCK_ALIGNMENT,
  resourceBlockAlignmentValidator,
  resourceBlockTypeValidator,
} from '../lib/blockTypes'
import {
  deleteImageBlockStorage,
  EMPTY_IMAGE_BLOCK_CONTENT,
  parseImageBlockContent,
  serializeImageBlockContent,
} from '../lib/imageContent'
import {
  EMPTY_LINK_BLOCK_CONTENT,
  sanitizeLinkBlockContent,
  serializeLinkBlockContent,
} from '../lib/linkContent'
import { MAX_IMAGE_BYTES } from '../lib/limits'
import { sanitizeParagraphHtml } from '../../../lib/richTextHtml'

export const create = authedMutation({
  args: {
    resourceId: v.id('resources'),
    type: resourceBlockTypeValidator,
  },
  returns: v.id('resourceBlocks'),
  handler: async (ctx, args) => {
    const resource = await ctx.db.get('resources', args.resourceId)
    if (!resource) {
      throw new Error('Resource not found')
    }

    const blocks = await ctx.db
      .query('resourceBlocks')
      .withIndex('by_resource', (q) => q.eq('resourceId', args.resourceId))
      .collect()

    const order =
      blocks.length === 0 ? 0 : Math.max(...blocks.map((block) => block.order)) + 1

    const content =
      args.type === 'image'
        ? EMPTY_IMAGE_BLOCK_CONTENT
        : args.type === 'link'
          ? EMPTY_LINK_BLOCK_CONTENT
          : ''

    return await ctx.db.insert('resourceBlocks', {
      resourceId: args.resourceId,
      type: args.type,
      content,
      align: DEFAULT_RESOURCE_BLOCK_ALIGNMENT,
      order,
      createdAt: Date.now(),
    })
  },
})

export const generateUploadUrl = authedMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const attachUploadedImage = authedMutation({
  args: {
    blockId: v.id('resourceBlocks'),
    storageId: v.id('_storage'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const block = await ctx.db.get('resourceBlocks', args.blockId)
    if (!block || block.type !== 'image') {
      throw new Error('Image block not found')
    }

    const metadata = await ctx.storage.getMetadata(args.storageId)

    if (!metadata) {
      throw new Error('Uploaded image not found')
    }

    if (metadata.contentType !== 'image/webp') {
      await ctx.storage.delete(args.storageId)
      throw new Error('Unsupported image type')
    }

    if (metadata.size > MAX_IMAGE_BYTES) {
      await ctx.storage.delete(args.storageId)
      throw new Error('Image must be 10 MB or smaller')
    }

    const current = parseImageBlockContent(block.content)

    if (current.storageId) {
      await ctx.storage.delete(current.storageId)
    }

    await ctx.db.patch('resourceBlocks', args.blockId, {
      content: serializeImageBlockContent({
        storageId: args.storageId,
        alt: current.alt,
        width: null,
      }),
    })

    return null
  },
})

export const updateContent = authedMutation({
  args: {
    blockId: v.id('resourceBlocks'),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const block = await ctx.db.get('resourceBlocks', args.blockId)
    if (!block) {
      throw new Error('Block not found')
    }

    if (block.type !== 'title' && block.type !== 'paragraph') {
      throw new Error('Use the typed update mutation for this block type')
    }

    const nextContent =
      block.type === 'paragraph'
        ? sanitizeParagraphHtml(args.content)
        : args.content.trim()

    await ctx.db.patch('resourceBlocks', args.blockId, {
      content: nextContent,
    })
    return null
  },
})

export const updateImageMetadata = authedMutation({
  args: {
    blockId: v.id('resourceBlocks'),
    alt: v.string(),
    width: v.union(v.number(), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const block = await ctx.db.get('resourceBlocks', args.blockId)
    if (!block || block.type !== 'image') {
      throw new Error('Image block not found')
    }

    const current = parseImageBlockContent(block.content)
    const width =
      args.width !== null &&
      Number.isFinite(args.width) &&
      args.width > 0
        ? Math.round(args.width)
        : null

    await ctx.db.patch('resourceBlocks', args.blockId, {
      content: serializeImageBlockContent({
        storageId: current.storageId,
        alt: args.alt.trim(),
        width,
      }),
    })

    return null
  },
})

export const updateLinkContent = authedMutation({
  args: {
    blockId: v.id('resourceBlocks'),
    label: v.string(),
    url: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const block = await ctx.db.get('resourceBlocks', args.blockId)
    if (!block || block.type !== 'link') {
      throw new Error('Link block not found')
    }

    await ctx.db.patch('resourceBlocks', args.blockId, {
      content: serializeLinkBlockContent(
        sanitizeLinkBlockContent({
          label: args.label,
          url: args.url,
        }),
      ),
    })

    return null
  },
})

export const updateAlign = authedMutation({
  args: {
    blockId: v.id('resourceBlocks'),
    align: resourceBlockAlignmentValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const block = await ctx.db.get('resourceBlocks', args.blockId)
    if (!block) {
      throw new Error('Block not found')
    }

    await ctx.db.patch('resourceBlocks', args.blockId, {
      align: args.align,
    })
    return null
  },
})

export const remove = authedMutation({
  args: {
    blockId: v.id('resourceBlocks'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const block = await ctx.db.get('resourceBlocks', args.blockId)
    if (!block) {
      throw new Error('Block not found')
    }

    if (block.type === 'image') {
      await deleteImageBlockStorage(ctx, block.content)
    }

    await ctx.db.delete('resourceBlocks', args.blockId)
    return null
  },
})
