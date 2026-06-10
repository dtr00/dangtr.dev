import { useMutation } from 'convex/react'
import { useMemo } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { ResourceBlockAlignment } from '../../../../convex/features/resources/lib/blockTypes'
import {
  normalizeLinkUrl,
  parseLinkBlockContent,
  type LinkBlockContent,
} from '../../../../convex/features/resources/lib/linkContent'
import { useConvexField } from '@/lib/use-convex-field'
import { useResourceBlockChrome } from '#/features/resources/lib/use-resource-block-chrome'

function linkFieldsMatch(current: LinkBlockContent, next: LinkBlockContent): boolean {
  return (
    current.label.trim() === next.label.trim() &&
    normalizeLinkUrl(current.url) === normalizeLinkUrl(next.url)
  )
}

export function useLinkBlockEditor(
  blockId: Id<'resourceBlocks'>,
  content: string,
  align: ResourceBlockAlignment,
) {
  const updateLinkContent = useMutation(
    api.features.resources.blocks.mutations.updateLinkContent,
  )
  const chrome = useResourceBlockChrome(blockId, align)
  const value = useMemo(() => parseLinkBlockContent(content), [content])

  const { draft, setDraft, isSaving, saveError, save, revert } = useConvexField({
    value,
    isEqual: linkFieldsMatch,
    onSave: async (next) => {
      await updateLinkContent({
        blockId,
        label: next.label.trim(),
        url: next.url,
      })
    },
  })

  return {
    label: draft.label,
    url: draft.url,
    setLabel: (label: string) => {
      setDraft((current) => ({ ...current, label }))
    },
    setUrl: (url: string) => {
      setDraft((current) => ({ ...current, url }))
    },
    saveError: saveError ?? chrome.actionError,
    isBusy: isSaving || chrome.isDeleting,
    save,
    revert,
    handleDelete: chrome.handleDelete,
    handleAlignChange: chrome.handleAlignChange,
  }
}
