import { query } from '../../_generated/server'
import { v } from 'convex/values'

import { isAllowedIdentity } from '../../lib/allowlist'

export const canEdit = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      return false
    }

    return isAllowedIdentity(identity)
  },
})
