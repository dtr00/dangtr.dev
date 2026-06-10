import { v } from 'convex/values'

import { authedMutation } from '../../lib/authedMutation'
import {
  isHomepageContentEmpty,
  sanitizeHomepageHtml,
} from '../../lib/richTextHtml'

export const updateIntro = authedMutation({
  args: {
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (isHomepageContentEmpty(args.content)) {
      throw new Error('Homepage introduction cannot be empty')
    }

    const content = sanitizeHomepageHtml(args.content)
    const existing = await ctx.db.query('homepageContent').first()

    if (existing) {
      await ctx.db.patch('homepageContent', existing._id, {
        content,
        updatedAt: Date.now(),
      })
      return null
    }

    await ctx.db.insert('homepageContent', {
      content,
      updatedAt: Date.now(),
    })

    return null
  },
})
