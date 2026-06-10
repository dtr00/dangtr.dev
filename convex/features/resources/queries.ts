import { query } from '../../_generated/server'
import { v } from 'convex/values'

import {
  resourceValidator,
  toResourceResponse,
} from './lib/validators'

export const list = query({
  args: {},
  returns: v.array(resourceValidator),
  handler: async (ctx) => {
    const resources = await ctx.db.query('resources').order('desc').collect()

    return resources.map(toResourceResponse)
  },
})

export const get = query({
  args: {
    resourceId: v.id('resources'),
  },
  returns: v.union(resourceValidator, v.null()),
  handler: async (ctx, args) => {
    const resource = await ctx.db.get('resources', args.resourceId)
    if (!resource) {
      return null
    }

    return toResourceResponse(resource)
  },
})
