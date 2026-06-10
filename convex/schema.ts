import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  resources: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    createdAt: v.number(),
  }),
  resourceBlocks: defineTable({
    resourceId: v.id('resources'),
    type: v.union(
      v.literal('title'),
      v.literal('paragraph'),
      v.literal('image'),
      v.literal('link'),
    ),
    content: v.string(),
    align: v.optional(
      v.union(v.literal('left'), v.literal('center'), v.literal('right')),
    ),
    order: v.number(),
    createdAt: v.number(),
  })
    .index('by_resource', ['resourceId'])
    .index('by_resource_and_order', ['resourceId', 'order']),
  homepageContent: defineTable({
    content: v.string(),
    updatedAt: v.number(),
  }),
})
