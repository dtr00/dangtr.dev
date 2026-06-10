export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function parseJsonRecord(content: string): Record<string, unknown> | null {
  if (!content.trim()) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(content)
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}
