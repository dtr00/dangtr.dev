import { convexQuery } from '@convex-dev/react-query'
import type { FunctionReturnType } from 'convex/server'

import { api } from '../../../../convex/_generated/api'

export const resourcesListQuery = convexQuery(api.features.resources.queries.list)

export type ResourceListItem = FunctionReturnType<
  typeof api.features.resources.queries.list
>[number]
