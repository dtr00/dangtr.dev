import { useMutation } from 'convex/react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { ResourceBlockAlignment } from '../../../../convex/features/resources/lib/blockTypes'
import { useConvexField } from '@/lib/use-convex-field'
import { useResourceBlockChrome } from '#/features/resources/lib/use-resource-block-chrome'

type UseTextBlockEditorOptions = {
  prepareContent?: (value: string) => string
}

export function useTextBlockEditor(
  blockId: Id<'resourceBlocks'>,
  content: string,
  align: ResourceBlockAlignment,
  options?: UseTextBlockEditorOptions,
) {
  const updateContent = useMutation(
    api.features.resources.blocks.mutations.updateContent,
  )
  const chrome = useResourceBlockChrome(blockId, align)

  const { draft, setDraft, isSaving, saveError, save, revert } = useConvexField({
    value: content,
    prepare: options?.prepareContent,
    onSave: async (prepared) => {
      await updateContent({ blockId, content: prepared })
    },
  })

  return {
    value: draft,
    setValue: setDraft,
    saveError: saveError ?? chrome.actionError,
    isBusy: isSaving || chrome.isDeleting,
    isSaving,
    save,
    revert,
    handleDelete: chrome.handleDelete,
    handleAlignChange: chrome.handleAlignChange,
  }
}
