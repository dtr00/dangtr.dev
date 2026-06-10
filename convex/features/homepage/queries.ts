import { query } from '../../_generated/server'
import { v } from 'convex/values'

import {
  DEFAULT_HOMEPAGE_INTRO_HTML,
  toHomepageDisplayHtml,
} from '../../lib/richTextHtml'

export const getIntro = query({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const record = await ctx.db.query('homepageContent').first()

    if (!record) {
      return DEFAULT_HOMEPAGE_INTRO_HTML
    }

    return toHomepageDisplayHtml(record.content)
  },
})
