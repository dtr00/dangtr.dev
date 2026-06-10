import type { Id } from '../../../../convex/_generated/dataModel'

const CONVEX_ID_PATTERN = /^[a-z0-9]+$/i

export function isResourceId(value: string): value is Id<'resources'> {
  return value.length >= 10 && CONVEX_ID_PATTERN.test(value)
}

export function parseResourceId(value: string): Id<'resources'> | null {
  return isResourceId(value) ? value : null
}
