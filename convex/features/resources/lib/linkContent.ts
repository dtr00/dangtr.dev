import { parseJsonRecord } from '../../../lib/jsonContent'

export type LinkBlockContent = {
  label: string
  url: string
}

const EMPTY_LINK_CONTENT: LinkBlockContent = {
  label: '',
  url: '',
}

export const EMPTY_LINK_BLOCK_CONTENT = serializeLinkBlockContent(EMPTY_LINK_CONTENT)

export function normalizeLinkUrl(url: string): string {
  const trimmed = url.trim()

  if (!trimmed) {
    return ''
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const parsed = new URL(withProtocol)

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return ''
    }

    return parsed.toString()
  } catch {
    return ''
  }
}

export function parseLinkBlockContent(content: string): LinkBlockContent {
  const record = parseJsonRecord(content)

  if (!record) {
    return EMPTY_LINK_CONTENT
  }

  const label = typeof record.label === 'string' ? record.label : ''
  const url = typeof record.url === 'string' ? record.url : ''

  return { label, url }
}

export function serializeLinkBlockContent(content: LinkBlockContent): string {
  return JSON.stringify({
    label: content.label,
    url: content.url,
  })
}

export function sanitizeLinkBlockContent(content: LinkBlockContent): LinkBlockContent {
  return {
    label: content.label.trim(),
    url: normalizeLinkUrl(content.url),
  }
}
