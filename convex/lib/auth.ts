import type { UserIdentity } from 'convex/server'

import type { MutationCtx } from '../_generated/server'

import { isAllowedIdentity } from './allowlist'

export async function requireAuthedEditor(
  ctx: MutationCtx,
): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw new Error('Not authenticated')
  }

  if (!isAllowedIdentity(identity)) {
    throw new Error('Unauthorized')
  }

  return identity
}
