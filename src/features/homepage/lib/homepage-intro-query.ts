import { convexQuery } from '@convex-dev/react-query'

import { api } from '../../../../convex/_generated/api'

export const homepageIntroQuery = convexQuery(
  api.features.homepage.queries.getIntro,
)
