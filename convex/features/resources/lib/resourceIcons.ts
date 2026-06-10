export const DEFAULT_RESOURCE_ICON = 'IconFile'

const ICON_NAME_PATTERN = /^Icon[A-Z][A-Za-z0-9]*$/

export function isResourceIconName(value: string): boolean {
  return ICON_NAME_PATTERN.test(value)
}

export function toResourceIconName(value: string): string | null {
  return isResourceIconName(value) ? value : null
}

export type ResourceIconName = string
