import type { Id } from '../../../_generated/dataModel'
import { parseJsonRecord } from '../../../lib/jsonContent'

export type ImageBlockContent = {
  storageId: Id<'_storage'> | null
  alt: string
  width: number | null
}

const EMPTY_IMAGE_CONTENT: ImageBlockContent = {
  storageId: null,
  alt: '',
  width: null,
}

export const EMPTY_IMAGE_BLOCK_CONTENT = serializeImageBlockContent(
  EMPTY_IMAGE_CONTENT,
)

function isStorageId(value: string): value is Id<'_storage'> {
  return value.length > 0
}

function parseStorageId(value: unknown): Id<'_storage'> | null {
  if (typeof value !== 'string' || !isStorageId(value)) {
    return null
  }

  return value
}

function parseWidth(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null
  }

  return Math.round(value)
}

export function parseImageBlockContent(content: string): ImageBlockContent {
  const record = parseJsonRecord(content)

  if (!record) {
    return EMPTY_IMAGE_CONTENT
  }

  const storageId = parseStorageId(record.storageId)
  const alt = typeof record.alt === 'string' ? record.alt : ''
  const width = parseWidth(record.width)

  return { storageId, alt, width }
}

export function serializeImageBlockContent(content: ImageBlockContent): string {
  return JSON.stringify({
    storageId: content.storageId,
    alt: content.alt,
    width: content.width,
  })
}

export async function deleteImageBlockStorage(
  ctx: { storage: { delete: (id: Id<'_storage'>) => Promise<void> } },
  content: string,
): Promise<void> {
  const imageContent = parseImageBlockContent(content)

  if (imageContent.storageId) {
    await ctx.storage.delete(imageContent.storageId)
  }
}
