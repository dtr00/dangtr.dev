import { useEffect, useMemo, useState, type WheelEvent } from 'react'
import * as TablerIcons from '@tabler/icons-react'
import type { IconProps, TablerIcon } from '@tabler/icons-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import {
  getResourceIconLabel,
  ResourceIcon,
  isResourceIconName,
  type ResourceIconName,
} from '#/features/resources/lib/resource-icons'

const MIN_SEARCH_LENGTH = 3
const SEARCH_DEBOUNCE_MS = 250
const DEFAULT_ICON_COUNT = 25
const MAX_ICON_RESULTS = 72

function isTablerIconComponent(value: unknown): value is TablerIcon {
  return (
    typeof value === 'object' &&
    value !== null &&
    'render' in value &&
    typeof value.render === 'function'
  )
}

const tablerIconMap: Record<string, TablerIcon> = {}
const TABLER_ICON_NAMES: string[] = []

for (const [name, icon] of Object.entries(TablerIcons)) {
  if (!isResourceIconName(name) || !isTablerIconComponent(icon)) {
    continue
  }

  tablerIconMap[name] = icon
  TABLER_ICON_NAMES.push(name)
}

TABLER_ICON_NAMES.sort()

type IconSelectProps = {
  value: ResourceIconName
  onChange: (value: ResourceIconName) => void
  disabled?: boolean
  triggerVariant?: 'outline' | 'ghost'
  iconSize?: number
}

function stopWheelPropagation(event: WheelEvent) {
  event.stopPropagation()
}

function TablerIconGlyph({
  name,
  ...props
}: IconProps & { name: ResourceIconName }) {
  const Icon = tablerIconMap[name]
  return <Icon aria-hidden {...props} />
}

function getIconSizeClass(iconSize: number) {
  if (iconSize >= 32) {
    return 'size-8'
  }

  if (iconSize >= 28) {
    return 'size-7'
  }

  if (iconSize >= 24) {
    return 'size-6'
  }

  if (iconSize >= 20) {
    return 'size-5'
  }

  return 'size-4'
}

export default function IconSelect({
  value,
  onChange,
  disabled = false,
  triggerVariant = 'outline',
  iconSize = 16,
}: IconSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [search])

  const trimmedSearch = search.trim()
  const trimmedDebouncedSearch = debouncedSearch.trim()
  const isDebouncing =
    trimmedSearch.length >= MIN_SEARCH_LENGTH &&
    trimmedSearch !== trimmedDebouncedSearch

  const { icons, totalMatches } = useMemo(() => {
    const query = trimmedDebouncedSearch.toLowerCase()
    if (query.length < MIN_SEARCH_LENGTH) {
      return {
        icons: TABLER_ICON_NAMES.slice(0, DEFAULT_ICON_COUNT),
        totalMatches: TABLER_ICON_NAMES.length,
      }
    }

    const matches = TABLER_ICON_NAMES.filter((iconName) =>
      `${iconName} ${getResourceIconLabel(iconName)}`
        .toLowerCase()
        .includes(query),
    )

    return {
      icons: matches.slice(0, MAX_ICON_RESULTS),
      totalMatches: matches.length,
    }
  }, [trimmedDebouncedSearch])

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      setSearch('')
      setDebouncedSearch('')
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size="icon-sm"
          disabled={disabled}
          aria-label="Choose icon"
          className={
            triggerVariant === 'ghost'
              ? 'size-8 shrink-0 p-1 text-muted-foreground hover:text-foreground'
              : 'shrink-0 text-muted-foreground hover:text-foreground'
          }
        >
          <ResourceIcon
            name={value}
            size={iconSize}
            stroke={1.75}
            className={getIconSizeClass(iconSize)}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="z-60 w-72 gap-0 p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onWheel={stopWheelPropagation}
      >
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search icons..."
          aria-label="Search icons"
          className="h-10 rounded-none border-0 border-b border-border bg-transparent px-3 shadow-none focus-visible:border-border focus-visible:ring-0"
        />
        <div
          className="max-h-64 overflow-y-auto overscroll-contain p-2"
          onWheel={stopWheelPropagation}
        >
          {isDebouncing ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </p>
          ) : icons.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No icons found.
            </p>
          ) : (
            <div className="space-y-2">
              {totalMatches > icons.length ? (
                <p className="text-xs text-muted-foreground">
                  Showing {icons.length} of {totalMatches}
                </p>
              ) : null}
              <div className="grid grid-cols-6 gap-1">
                {icons.map((iconName) => (
                  <Button
                    key={iconName}
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={getResourceIconLabel(iconName)}
                    aria-pressed={iconName === value}
                    className="text-muted-foreground hover:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
                    onClick={() => {
                      onChange(iconName)
                      setOpen(false)
                    }}
                  >
                    <TablerIconGlyph name={iconName} size={16} stroke={1.75} />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
