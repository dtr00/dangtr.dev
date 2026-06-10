import { useMutation } from 'convex/react'
import { useMemo } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { ResourceBlockAlignment } from '../../../../convex/features/resources/lib/blockTypes'
import { parseImageBlockContent } from '../../../../convex/features/resources/lib/imageContent'
import { useConvexField } from '@/lib/use-convex-field'
import { useResourceBlockChrome } from '#/features/resources/lib/use-resource-block-chrome'

export function useImageBlockMetadata(
  blockId: Id<'resourceBlocks'>,
  content: string,
  align: ResourceBlockAlignment,
) {
  const updateImageMetadata = useMutation(
    api.features.resources.blocks.mutations.updateImageMetadata,
  )
  const chrome = useResourceBlockChrome(blockId, align)
  const value = useMemo(() => {
    const parsed = parseImageBlockContent(content)
    return { alt: parsed.alt, width: parsed.width }
  }, [content])

  const { draft, setDraft, isSaving, saveError, save, revert } = useConvexField({
    value,
    isEqual: (current, next) =>
      current.alt.trim() === next.alt.trim() && current.width === next.width,
    onSave: async (next) => {
      await updateImageMetadata({
        blockId,
        alt: next.alt,
        width: next.width,
      })
    },
  })

  return {
    alt: draft.alt,
    width: draft.width,
    setAlt: (alt: string) => {
      setDraft((current) => ({ ...current, alt }))
    },
    setWidth: (width: number | null) => {
      setDraft((current) => ({ ...current, width }))
    },
    saveError: saveError ?? chrome.actionError,
    isBusy: isSaving || chrome.isDeleting,
    save,
    revert,
    handleDelete: chrome.handleDelete,
    handleAlignChange: chrome.handleAlignChange,
  }
}
