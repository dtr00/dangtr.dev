import { createServerFn } from '@tanstack/react-start'

import {
  isContributionLevel,
  type ContributionDay,
} from '#/features/github/lib/github-contributions'

type ContributionsApiResponse = {
  contributions: Array<{
    date: string
    count: number
    level: number
  }>
}

function isContributionsApiResponse(
  value: unknown,
): value is ContributionsApiResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  if (!('contributions' in value) || !Array.isArray(value.contributions)) {
    return false
  }

  return value.contributions.every(
    (day) =>
      typeof day === 'object' &&
      day !== null &&
      typeof day.date === 'string' &&
      typeof day.count === 'number' &&
      typeof day.level === 'number',
  )
}

function parseContributions(data: ContributionsApiResponse): ContributionDay[] {
  return data.contributions.flatMap((day) => {
    if (!isContributionLevel(day.level)) {
      return []
    }

    return [
      {
        date: day.date,
        count: day.count,
        level: day.level,
      },
    ]
  })
}

export type GitHubContributionsResult = {
  contributions: ContributionDay[]
  username: string
}

export const getGitHubContributions = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GitHubContributionsResult | null> => {
    const username = process.env.ALLOWED_GITHUB_USERNAME

    if (!username) {
      return null
    }

    try {
      const response = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
      )

      if (!response.ok) {
        console.error(
          `[github] Contribution fetch failed: ${response.status} ${response.statusText}`,
        )
        return null
      }

      const data: unknown = await response.json()

      if (!isContributionsApiResponse(data)) {
        console.error('[github] Contribution response had an unexpected shape')
        return null
      }

      return {
        contributions: parseContributions(data),
        username,
      }
    } catch (error) {
      console.error('[github] Contribution fetch failed:', error)
      return null
    }
  },
)
