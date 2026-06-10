import { IconArrowUpRight, IconBrandGithub } from '@tabler/icons-react'
import type { ReactNode } from 'react'

import type { ContributionDay } from '#/features/github/lib/github-contributions'
import { groupContributionsIntoWeeks } from '#/features/github/lib/github-contributions'
import { LoadingGrid } from '#/components/ui/loading-grid'
import CursorLogo from '#/features/github/components/icons/cursor-logo'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'

type ContributionHeatmapProps = {
  contributions: ContributionDay[]
  username: string
}

function formatContributionDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatContributionCount(count: number) {
  if (count === 0) {
    return 'No contributions'
  }

  return `${count} Contribution${count === 1 ? '' : 's'}`
}

function ExternalLink({
  href,
  label,
  tooltip,
  icon,
}: {
  href: string
  label: string
  tooltip?: string
  icon: ReactNode
}) {
  const link = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1 text-xs text-foreground"
    >
      <span className="inline-flex text-muted-foreground transition-colors group-hover:text-foreground">
        {icon}
      </span>
      {label}
      <IconArrowUpRight
        className="text-muted-foreground transition-colors group-hover:text-foreground"
        size={14}
        stroke={1.75}
        aria-hidden
      />
    </a>
  )

  if (!tooltip) {
    return link
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

function HeatmapCell({ day }: { day: ContributionDay }) {
  if (!day.date) {
    return (
      <div
        className="heatmap-cell size-[14px] rounded-[3px]"
        data-level={day.level}
      />
    )
  }

  const countLabel = formatContributionCount(day.count)
  const dateLabel = formatContributionDate(day.date)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="heatmap-cell size-[14px] rounded-[3px] border-0 p-0"
          data-level={day.level}
          aria-label={`${countLabel}, ${dateLabel}`}
        />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={6}
        className="flex flex-col items-start gap-0.5"
      >
        <span>{countLabel}</span>
        <span>{dateLabel}</span>
      </TooltipContent>
    </Tooltip>
  )
}

export default function ContributionHeatmap({
  contributions,
  username,
}: ContributionHeatmapProps) {
  const weeks = groupContributionsIntoWeeks(contributions)

  if (weeks.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <div className="mb-2 flex items-center gap-1.5">
        <LoadingGrid className="size-3.5" />
        <p className="text-xs leading-none text-foreground">Contributing</p>
      </div>
      <div className="relative overflow-hidden">
        <div
          className="flex justify-end gap-[3px]"
          aria-label="GitHub contribution activity for the last year"
        >
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) => (
                <HeatmapCell
                  key={day.date || `${weekIndex}-${dayIndex}`}
                  day={day}
                />
              ))}
            </div>
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-background to-transparent"
        />
      </div>
      <div className="mt-2 flex justify-end gap-4">
        <ExternalLink
          href="https://cursor.com/@dangt"
          label="cursor"
          tooltip="My cursor profile"
          icon={<CursorLogo size={16} />}
        />
        <ExternalLink
          href={`https://github.com/${username}`}
          label="github"
          tooltip="My profile"
          icon={<IconBrandGithub size={14} stroke={1.75} aria-hidden />}
        />
      </div>
    </div>
  )
}
