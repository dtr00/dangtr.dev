import { useQuery } from 'convex/react'

import { api } from '../../../../convex/_generated/api'

export function useCanEdit(): boolean {
  const canEdit = useQuery(api.features.auth.queries.canEdit)
  return canEdit ?? false
}
