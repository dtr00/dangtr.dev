import { convexQuery } from '@convex-dev/react-query'
import type { FunctionReturnType } from 'convex/server'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

export type ResourceDetail = NonNullable<
  FunctionReturnType<typeof api.features.resources.queries.get>
>

export type ResourceBlockItem = FunctionReturnType<
  typeof api.features.resources.blocks.queries.listByResource
>[number]

export function resourceGetQuery(resourceId: Id<'resources'>) {
  return convexQuery(api.features.resources.queries.get, {
    resourceId,
  })
}

export function resourceBlocksQuery(resourceId: Id<'resources'>) {
  return convexQuery(api.features.resources.blocks.queries.listByResource, {
    resourceId,
  })
}
