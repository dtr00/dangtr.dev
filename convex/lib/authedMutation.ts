import { customMutation } from 'convex-helpers/server/customFunctions'

import { mutation } from '../_generated/server'

import { requireAuthedEditor } from './auth'

export const authedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    await requireAuthedEditor(ctx)
    return { ctx, args }
  },
})
