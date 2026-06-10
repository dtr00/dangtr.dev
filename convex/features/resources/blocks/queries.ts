import { query } from '../../../_generated/server'
import { v } from 'convex/values'

import {
  resourceBlockValidator,
  toResourceBlockResponse,
} from '../lib/validators'

export const listByResource = query({
  args: {
    resourceId: v.id('resources'),
  },
  returns: v.array(resourceBlockValidator),
  handler: async (ctx, args) => {
    const blocks = await ctx.db
      .query('resourceBlocks')
      .withIndex('by_resource_and_order', (q) =>
        q.eq('resourceId', args.resourceId),
      )
      .collect()

    return Promise.all(
      blocks.map((block) => toResourceBlockResponse(ctx, block)),
    )
  },
})

