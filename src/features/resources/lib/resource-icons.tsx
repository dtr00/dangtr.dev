import { IconFile } from '@tabler/icons-react'
import type { IconProps, TablerIcon } from '@tabler/icons-react'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'
import {
  DEFAULT_RESOURCE_ICON,
  isResourceIconName,
} from '../../../../convex/features/resources/lib/resourceIcons'

export {
  DEFAULT_RESOURCE_ICON,
  isResourceIconName,
  toResourceIconName,
  type ResourceIconName,
} from '../../../../convex/features/resources/lib/resourceIcons'

type EagerIconModule = { default: TablerIcon }
type LazyIconModule = () => Promise<EagerIconModule>
type IconModuleEntry = EagerIconModule | LazyIconModule

const iconModules: Record<string, IconModuleEntry> = import.meta.env.SSR
  ? import.meta.glob<{ default: TablerIcon }>(
      '/node_modules/@tabler/icons-react/dist/esm/icons/Icon*.mjs',
      { eager: true },
    )
  : import.meta.glob<{ default: TablerIcon }>(
      '/node_modules/@tabler/icons-react/dist/esm/icons/Icon*.mjs',
    )

const iconCache = new Map<string, TablerIcon>()

const ResourceIconSsrContext = createContext<Record<string, string>>({})

export function ResourceIconSsrProvider({
  svgs,
  children,
}: {
  svgs: Record<string, string>
  children: ReactNode
}) {
  return (
    <ResourceIconSsrContext.Provider value={svgs}>
      {children}
    </ResourceIconSsrContext.Provider>
  )
}

function getIconModulePath(name: string) {
  return `/node_modules/@tabler/icons-react/dist/esm/icons/${name}.mjs`
}

function isLoadedIconModule(
  entry: IconModuleEntry | undefined,
): entry is EagerIconModule {
  return entry !== undefined && typeof entry !== 'function'
}

export function getTablerIconSync(name: string): TablerIcon | null {
  const iconName = isResourceIconName(name) ? name : DEFAULT_RESOURCE_ICON
  const cached = iconCache.get(iconName)
  if (cached) {
    return cached
  }

  const modulePath = getIconModulePath(iconName)
  const entry = iconModules[modulePath]
  if (isLoadedIconModule(entry)) {
    iconCache.set(iconName, entry.default)
    return entry.default
  }

  return null
}

async function loadTablerIcon(name: string): Promise<TablerIcon> {
  const syncIcon = getTablerIconSync(name)
  if (syncIcon) {
    return syncIcon
  }

  const iconName = isResourceIconName(name) ? name : DEFAULT_RESOURCE_ICON
  const cached = iconCache.get(iconName)
  if (cached) {
    return cached
  }

  const modulePath = getIconModulePath(iconName)
  const entry = iconModules[modulePath]

  if (typeof entry === 'function') {
    const iconModule = await entry()
    iconCache.set(iconName, iconModule.default)
    return iconModule.default
  }

  if (isLoadedIconModule(entry)) {
    iconCache.set(iconName, entry.default)
    return entry.default
  }

  return IconFile
}

export async function preloadResourceIcons(names: string[]) {
  const unique = [...new Set(names)]
  await Promise.all(unique.map((name) => loadTablerIcon(name)))
}

export function getResourceIconLabel(name: string) {
  return name
    .replace(/^Icon/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim()
}

type ResourceIconProps = IconProps & {
  name: string
}

export function ResourceIcon({
  name,
  size = 16,
  stroke = 1.75,
  className,
  ...props
}: ResourceIconProps) {
  const iconSvgs = useContext(ResourceIconSsrContext)
  const iconName = isResourceIconName(name) ? name : DEFAULT_RESOURCE_ICON
  const ssrSvg = iconSvgs[iconName]
  const [Icon, setIcon] = useState<TablerIcon | null>(
    () => iconCache.get(iconName) ?? null,
  )

  useEffect(() => {
    if (ssrSvg) {
      return
    }

    let cancelled = false

    void loadTablerIcon(iconName).then((LoadedIcon) => {
      if (!cancelled) {
        setIcon(() => LoadedIcon)
      }
    })

    return () => {
      cancelled = true
    }
  }, [iconName, ssrSvg])

  if (ssrSvg && !Icon) {
    return (
      <span
        className={cn('inline-flex shrink-0 [&>svg]:size-full', className)}
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: ssrSvg }}
        aria-hidden
      />
    )
  }

  const ResolvedIcon = Icon ?? IconFile

  return (
    <ResolvedIcon
      size={size}
      stroke={stroke}
      aria-hidden
      className={className}
      {...props}
    />
  )
}
