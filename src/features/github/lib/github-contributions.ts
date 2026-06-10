export type ContributionDay = {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export function groupContributionsIntoWeeks(
  contributions: ContributionDay[],
): ContributionDay[][] {
  if (contributions.length === 0) {
    return []
  }

  const weeks: ContributionDay[][] = []
  const emptyDay: ContributionDay = { date: '', count: 0, level: 0 }
  let currentWeek: ContributionDay[] = []

  const firstDate = new Date(`${contributions[0].date}T00:00:00`)
  for (let i = 0; i < firstDate.getDay(); i++) {
    currentWeek.push(emptyDay)
  }

  for (const day of contributions) {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(emptyDay)
    }
    weeks.push(currentWeek)
  }

  return weeks
}

export function isContributionLevel(level: number): level is ContributionDay['level'] {
  return level >= 0 && level <= 4
}
