import { v } from 'convex/values'

import { authedMutation } from '../../lib/authedMutation'
import { deleteImageBlockStorage } from './lib/imageContent'
import { isResourceIconName } from './lib/resourceIcons'

export const create = authedMutation({
  args: {
    name: v.string(),
    description: v.string(),
    icon: v.string(),
  },
  returns: v.id('resources'),
  handler: async (ctx, args) => {
    const name = args.name.trim()
    if (name.length === 0) {
      throw new Error('Resource name is required')
    }

    if (!isResourceIconName(args.icon)) {
      throw new Error('Invalid icon')
    }

    return await ctx.db.insert('resources', {
      name,
      description: args.description.trim(),
      icon: args.icon,
      createdAt: Date.now(),
    })
  },
})

export const updateName = authedMutation({
  args: {
    resourceId: v.id('resources'),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const name = args.name.trim()
    if (name.length === 0) {
      throw new Error('Resource name is required')
    }

    const resource = await ctx.db.get('resources', args.resourceId)
    if (!resource) {
      throw new Error('Resource not found')
    }

    await ctx.db.patch('resources', args.resourceId, { name })
    return null
  },
})

export const updateDescription = authedMutation({
  args: {
    resourceId: v.id('resources'),
    description: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const resource = await ctx.db.get('resources', args.resourceId)
    if (!resource) {
      throw new Error('Resource not found')
    }

    await ctx.db.patch('resources', args.resourceId, {
      description: args.description.trim(),
    })
    return null
  },
})

export const updateIcon = authedMutation({
  args: {
    resourceId: v.id('resources'),
    icon: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!isResourceIconName(args.icon)) {
      throw new Error('Invalid icon')
    }

    const resource = await ctx.db.get('resources', args.resourceId)
    if (!resource) {
      throw new Error('Resource not found')
    }

    await ctx.db.patch('resources', args.resourceId, { icon: args.icon })
    return null
  },
})

export const remove = authedMutation({
  args: {
    resourceId: v.id('resources'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const resource = await ctx.db.get('resources', args.resourceId)
    if (!resource) {
      throw new Error('Resource not found')
    }

    const blocks = await ctx.db
      .query('resourceBlocks')
      .withIndex('by_resource', (q) => q.eq('resourceId', args.resourceId))
      .collect()

    for (const block of blocks) {
      if (block.type === 'image') {
        await deleteImageBlockStorage(ctx, block.content)
      }

      await ctx.db.delete('resourceBlocks', block._id)
    }

    await ctx.db.delete('resources', args.resourceId)
    return null
  },
})
